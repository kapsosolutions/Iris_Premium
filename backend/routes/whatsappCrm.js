import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Template from '../models/Template.js';
import {
  sendTextMessage,
  sendImageMessage,
  sendPDFDocumentMessage,
  listTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
  uploadHeaderSample,
  sendTemplate
} from '../services/metaService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * Normalizes message direction to 'in' or 'out'
 */
function normalizeDirection(dir) {
  if (dir === 'inbound' || dir === 'in') return 'in';
  return 'out';
}

/**
 * Helper to calculate 24h WhatsApp messaging window status
 */
function getMessagingWindowStatus(lastInboundDate) {
  if (!lastInboundDate) return { type: 'expired', label: '🔴 No Window', color: '#ea4335', active: false };
  const now = new Date();
  const diffHours = (now - new Date(lastInboundDate)) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    const remainingHours = Math.max(0, Math.round(24 - diffHours));
    if (remainingHours <= 10) {
      return { type: '24h', label: `🔴 24h Window (${remainingHours}h left)`, color: '#ea4335', active: true };
    }
    return { type: '24h', label: `🟢 24h Window (${remainingHours}h left)`, color: '#107c41', active: true };
  } else {
    return { type: 'expired', label: '🔴 24h Session Closed', color: '#ea4335', active: false };
  }
}

// ============================================================================
// CHAT THREADS & CONTACTS
// ============================================================================

/**
 * GET /api/crm/threads — Returns active chat threads with 24h window & last message
 */
router.get('/threads', async (req, res) => {
  try {
    const threadsAgg = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$phone',
          lastBody: { $first: '$body' },
          lastMediaUrl: { $first: '$mediaUrl' },
          lastAt: { $first: '$createdAt' },
          lastDirectionRaw: { $first: '$direction' },
          lastInboundAt: {
            $max: {
              $cond: [
                { $in: ['$direction', ['in', 'inbound']] },
                '$createdAt',
                null
              ]
            }
          }
        }
      },
      { $sort: { lastAt: -1 } },
      { $limit: 200 }
    ]);

    // Also get all leads to resolve phone numbers to customer names
    const leads = await Lead.find().lean();
    const leadMap = {};
    for (const ld of leads) {
      if (ld.phone) leadMap[ld.phone] = ld.name || ld.company || '';
    }

    // Include any leads that don't have messages yet
    const existingPhones = new Set(threadsAgg.map(t => t._id));
    const extraLeads = leads
      .filter(l => l.phone && !existingPhones.has(l.phone))
      .map(l => ({
        _id: l.phone,
        lastBody: l.requirement || 'New Lead',
        lastMediaUrl: '',
        lastAt: l.updatedAt || l.createdAt || new Date(),
        lastDirectionRaw: 'inbound',
        lastInboundAt: l.lastActive || l.updatedAt || l.createdAt
      }));

    const allThreads = [...threadsAgg, ...extraLeads];
    allThreads.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

    const enriched = await Promise.all(
      allThreads.map(async (t) => {
        const phone = t._id;
        const name = leadMap[phone] || phone;
        const unreadCount = await Message.countDocuments({
          phone,
          direction: { $in: ['in', 'inbound'] },
          status: { $ne: 'read' }
        });

        return {
          _id: phone,
          phone,
          name,
          lastBody: t.lastBody || (t.lastMediaUrl ? '📷 Media' : ''),
          lastAt: t.lastAt,
          lastDirection: normalizeDirection(t.lastDirectionRaw),
          lastInboundAt: t.lastInboundAt,
          unreadCount
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching CRM threads:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/crm/contacts — Legacy endpoint maintained for compatibility
 */
router.get('/contacts', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ updatedAt: -1 }).lean();
    const contactsWithDetails = await Promise.all(
      leads.map(async (ld) => {
        const lastMsg = await Message.findOne({ phone: ld.phone }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({
          phone: ld.phone,
          direction: { $in: ['in', 'inbound'] },
          status: { $ne: 'read' }
        });
        const windowStatus = getMessagingWindowStatus(ld.lastActive || ld.updatedAt);

        return {
          _id: ld._id,
          phone: ld.phone,
          name: ld.name || 'WhatsApp Customer',
          lastActive: ld.lastActive || ld.updatedAt,
          interactionCount: ld.interactionCount || 1,
          lastFlowOption: ld.lastFlowOption || 'General Inquiry',
          lastMessage: lastMsg?.body || lastMsg?.mediaUrl || 'Interactive Flow session',
          lastMessageTime: lastMsg?.createdAt || ld.updatedAt,
          unreadCount,
          windowStatus
        };
      })
    );
    res.json({ success: true, data: contactsWithDetails });
  } catch (err) {
    console.error('Error fetching CRM contacts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/crm/contacts/export — Export contacts as Excel file (.xlsx) or CSV
 */
router.get('/contacts/export', async (req, res) => {
  try {
    const leads = await Lead.find().lean();
    const messagesAgg = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$phone',
          lastAt: { $first: '$createdAt' },
          total: { $sum: 1 },
          lastInboundAt: {
            $max: {
              $cond: [
                { $in: ['$direction', ['in', 'inbound']] },
                '$createdAt',
                null
              ]
            }
          }
        }
      }
    ]);

    const msgMap = {};
    for (const m of messagesAgg) msgMap[m._id] = m;

    const phoneSet = new Set([...leads.map(l => l.phone), ...messagesAgg.map(m => m._id)].filter(Boolean));
    const leadMap = {};
    for (const l of leads) if (l.phone) leadMap[l.phone] = l;

    const data = [];
    for (const phone of phoneSet) {
      const ld = leadMap[phone] || {};
      const msg = msgMap[phone] || {};
      const lastInbound = msg.lastInboundAt || ld.lastActive || ld.updatedAt;
      const windowRemaining = lastInbound ? (new Date(lastInbound).getTime() + 24 * 3600 * 1000 - Date.now()) : -1;
      const windowStatus = windowRemaining > 0 ? `Active (${Math.floor(windowRemaining / 3600000)}h left)` : 'Closed';

      data.push({
        name: ld.name || 'WhatsApp Customer',
        phone: String(phone),
        company: ld.company || '',
        totalMessages: msg.total || 0,
        lastActive: msg.lastAt ? new Date(msg.lastAt).toLocaleString('en-IN') : (ld.updatedAt ? new Date(ld.updatedAt).toLocaleString('en-IN') : ''),
        windowStatus
      });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Iris WhatsApp Contacts');

    ws.columns = [
      { header: 'Customer Name', key: 'name', width: 28 },
      { header: 'WhatsApp Phone', key: 'phone', width: 22 },
      { header: 'Company / Brand', key: 'company', width: 24 },
      { header: 'Total Messages', key: 'totalMessages', width: 16 },
      { header: 'Last Activity', key: 'lastActive', width: 22 },
      { header: '24h Window', key: 'windowStatus', width: 22 }
    ];

    const head = ws.getRow(1);
    head.font = { bold: true, color: { argb: 'FF1C1E21' } };
    head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF25D366' } };
    head.height = 24;

    data.forEach((d) => ws.addRow(d));
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="iris-whatsapp-contacts-${stamp}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('Contacts export failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// MESSAGES IN THREAD
// ============================================================================

/**
 * GET /api/crm/messages/:phone — Get full chat message history for phone
 */
router.get('/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const msgs = await Message.find({ phone }).sort({ createdAt: 1 }).lean();

    // Mark inbound messages as read
    await Message.updateMany(
      { phone, direction: { $in: ['in', 'inbound'] } },
      { status: 'read' }
    );

    const normalized = msgs.map(m => {
      const dir = normalizeDirection(m.direction);
      const isOut = dir === 'out';
      return {
        _id: m._id,
        phone: m.phone,
        direction: dir,
        body: m.body,
        mediaUrl: m.mediaUrl || '',
        status: m.status || (isOut ? 'delivered' : undefined),
        reaction: m.reaction || '',
        createdAt: m.createdAt,
        raw: m.raw || null
      };
    });

    res.json({ success: true, data: normalized });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/send — Send free-form WhatsApp message (within 24h window)
 */
router.post('/send', async (req, res) => {
  try {
    const { phone, body, mediaUrl } = req.body;
    if (!phone || (!body && !mediaUrl)) {
      return res.status(400).json({ success: false, message: 'Phone number and message text or media URL required' });
    }

    let metaResult;
    let messageType = 'text';

    if (mediaUrl) {
      if (mediaUrl.toLowerCase().endsWith('.pdf')) {
        messageType = 'document';
        metaResult = await sendPDFDocumentMessage(phone, mediaUrl, 'Iris Premium Bottle Document.pdf', body || '');
      } else {
        messageType = 'image';
        metaResult = await sendImageMessage(phone, mediaUrl, body || '');
      }
    } else {
      metaResult = await sendTextMessage(phone, body);
    }

    const newMsg = await Message.create({
      phone,
      direction: 'outbound',
      messageType,
      body: body || (mediaUrl?.endsWith('.pdf') ? 'Document Attached' : 'Photo Attached'),
      mediaUrl: mediaUrl || '',
      status: 'delivered',
      metaMessageId: metaResult?.messages?.[0]?.id || ''
    });

    res.json({ success: true, message: 'Message sent successfully', data: newMsg });
  } catch (err) {
    console.error('Error sending CRM message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/send-message — Alias for /send
 */
router.post('/send-message', async (req, res) => {
  try {
    const { phone, body, mediaUrl } = req.body;
    if (!phone || (!body && !mediaUrl)) {
      return res.status(400).json({ success: false, message: 'Phone number and message text or media URL required' });
    }

    let metaResult;
    let messageType = 'text';

    if (mediaUrl) {
      if (mediaUrl.toLowerCase().endsWith('.pdf')) {
        messageType = 'document';
        metaResult = await sendPDFDocumentMessage(phone, mediaUrl, 'Iris Premium Bottle Document.pdf', body || '');
      } else {
        messageType = 'image';
        metaResult = await sendImageMessage(phone, mediaUrl, body || '');
      }
    } else {
      metaResult = await sendTextMessage(phone, body);
    }

    const newMsg = await Message.create({
      phone,
      direction: 'outbound',
      messageType,
      body: body || (mediaUrl.endsWith('.pdf') ? 'Document Attached' : 'Photo Attached'),
      mediaUrl: mediaUrl || '',
      status: 'delivered',
      metaMessageId: metaResult?.messages?.[0]?.id || ''
    });

    res.json({ success: true, message: 'Message sent successfully', data: newMsg });
  } catch (err) {
    console.error('Error sending CRM message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/react — Add emoji reaction to a chat bubble
 */
router.post('/react', async (req, res) => {
  try {
    const { messageId, reaction } = req.body;
    const updated = await Message.findByIdAndUpdate(messageId, { reaction }, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/crm/chat/:phone — Delete complete chat history
 */
router.delete('/chat/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    await Message.deleteMany({ phone });
    await Lead.deleteOne({ phone });
    res.json({ success: true, message: 'Chat history deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// TEMPLATES (CREATE, SUBMIT, REFRESH, SYNC, DELETE, SEND)
// ============================================================================

/**
 * GET /api/crm/templates — List all local templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/templates/upload — Upload media header (image, video, document) to Cloudinary
 */
router.post('/templates/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const isPdf = req.file.mimetype === 'application/pdf';
    const isVideo = req.file.mimetype.startsWith('video');
    const resourceType = isPdf ? 'raw' : (isVideo ? 'video' : 'image');

    const result = await uploadToCloudinary(req.file.buffer, 'iris_premium/templates', resourceType);
    res.json({ success: true, url: result.secure_url || result.url });
  } catch (err) {
    console.error('Template media upload failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/templates — Create new template as local DRAFT
 */
router.post('/templates', async (req, res) => {
  try {
    const b = req.body || {};
    const t = await Template.create({
      ...b,
      name: (b.name || '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      title: b.title || b.name || 'Untitled Template',
      status: 'DRAFT'
    });
    res.status(201).json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/crm/templates/:id — Update existing template
 */
router.put('/templates/:id', async (req, res) => {
  try {
    const t = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to build Meta components array
function buildComponents(doc) {
  const components = [];
  const ht = (doc.headerType || 'none').toLowerCase();
  if (ht === 'text' && doc.headerText) {
    components.push({ type: 'HEADER', format: 'TEXT', text: doc.headerText });
  } else if (['image', 'video', 'document'].includes(ht) && doc.headerUrl) {
    components.push({ type: 'HEADER', format: ht.toUpperCase(), example: { header_handle: [doc.headerUrl] } });
  }
  components.push({ type: 'BODY', text: doc.body || '' });
  if (doc.footer) components.push({ type: 'FOOTER', text: doc.footer });

  const btns = (doc.buttons || []).map((b) => {
    const type = b.type || (b.kind === 'url' ? 'URL' : 'QUICK_REPLY');
    if (type === 'URL') return { type: 'URL', text: b.text, url: b.url || b.payload };
    if (type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text, phone_number: b.phone_number };
    return { type: 'QUICK_REPLY', text: b.text };
  }).filter((b) => b.text);

  if (btns.length) components.push({ type: 'BUTTONS', buttons: btns });
  return components;
}

const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'video/mp4': 'mp4', 'application/pdf': 'pdf' };
function guessMime(url, format) {
  const lower = (url.split('?')[0] || '').toLowerCase();
  if (format === 'IMAGE') return lower.endsWith('.png') ? 'image/png' : 'image/jpeg';
  if (format === 'VIDEO') return 'video/mp4';
  if (format === 'DOCUMENT') return 'application/pdf';
  return 'application/octet-stream';
}

/**
 * POST /api/crm/templates/:id/submit — Submit draft template to Meta for official review
 */
router.post('/templates/:id/submit', async (req, res) => {
  try {
    const doc = await Template.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Template not found' });
    if (!doc.name || !/^[a-z0-9_]{1,512}$/.test(doc.name)) {
      return res.status(400).json({ success: false, message: 'Template name must be lowercase letters, numbers & underscores only.' });
    }

    const components = buildComponents(doc);

    // Media header -> obtain header sample handle if credentials available
    const header = components.find((c) => c.type === 'HEADER');
    if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
      const mediaUrl = doc.headerUrl;
      if (!mediaUrl || !/^https?:\/\//i.test(mediaUrl)) {
        return res.status(400).json({ success: false, message: 'Header media URL missing or invalid. Re-upload header file.' });
      }
      try {
        const fileType = guessMime(mediaUrl, header.format);
        const stem = (mediaUrl.split('/').pop() || 'header').split('?')[0].replace(/[^A-Za-z0-9._-]/g, '_').replace(/\.[^.]+$/, '') || 'header';
        const fileName = `${stem}.${MIME_EXT[fileType] || 'jpg'}`;
        const { header_handle } = await uploadHeaderSample({ fileUrl: mediaUrl, fileName, fileType });
        header.example = { header_handle: [header_handle] };
      } catch (uploadErr) {
        console.warn('Sample header upload fallback:', uploadErr.message);
      }
    }

    // Placeholders {{N}} example values
    const bodyComp = components.find((c) => c.type === 'BODY');
    if (bodyComp && /\{\{\s*\d+\s*\}\}/.test(bodyComp.text || '')) {
      const seen = new Set();
      const vals = [];
      const re = /\{\{\s*(\d+)\s*\}\}/g;
      let m;
      while ((m = re.exec(bodyComp.text)) !== null) {
        if (!seen.has(m[1])) { seen.add(m[1]); vals.push('Customer'); }
      }
      if (vals.length) bodyComp.example = { body_text: [vals] };
    }

    const payload = {
      name: doc.name,
      language: doc.language || 'en_US',
      category: doc.category || 'MARKETING',
      components
    };

    let resp;
    try {
      resp = await createTemplate(payload);
    } catch (e) {
      const msg = e.response?.data?.error?.message || '';
      const already = /already exists|exists with the same name/i.test(msg) || e.response?.data?.error?.error_subcode === 2388024;
      if (!already) throw e;
      const found = (await listTemplates()).find((t) => t.name === doc.name && t.language === doc.language);
      if (!found) throw e;
      resp = { id: found.id, status: found.status };
    }

    doc.metaId = resp.id;
    doc.metaTemplateName = doc.name;
    doc.status = (resp.status || 'PENDING').toUpperCase();
    doc.metaStatus = doc.status;
    doc.components = components;
    doc.lastSyncedAt = new Date();
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (err) {
    const metaErr = err.response?.data?.error;
    const friendly = metaErr?.error_user_msg || metaErr?.message || err.message || 'Failed to submit template';
    console.error('Template submission error:', friendly);
    res.status(500).json({ success: false, message: friendly });
  }
});

/**
 * POST /api/crm/templates/:id/refresh — Refresh status of a submitted template from Meta
 */
router.post('/templates/:id/refresh', async (req, res) => {
  try {
    const doc = await Template.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Template not found' });
    if (!doc.metaId) return res.status(400).json({ success: false, message: 'Template not submitted to Meta yet' });

    const data = await getTemplate(doc.metaId);
    doc.status = (data.status || doc.status).toUpperCase();
    doc.metaStatus = doc.status;
    doc.rejectedReason = data.rejected_reason || '';
    doc.lastSyncedAt = new Date();
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Template refresh error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Helper to derive local fields from Meta components
 */
function derivedFromComponents(components = []) {
  const header = (components || []).find((c) => c.type === 'HEADER');
  const body = (components || []).find((c) => c.type === 'BODY');
  const footer = (components || []).find((c) => c.type === 'FOOTER');
  const buttons = (components || []).find((c) => c.type === 'BUTTONS');

  return {
    body: body?.text || '',
    footer: footer?.text || '',
    headerType: header ? (header.format || 'TEXT').toLowerCase() : 'none',
    headerText: header?.format === 'TEXT' ? header.text || '' : '',
    buttons: (buttons?.buttons || []).map((b) => ({
      type: b.type,
      kind: b.type === 'URL' ? 'url' : 'reply',
      text: b.text,
      url: b.url,
      phone_number: b.phone_number
    }))
  };
}

/**
 * POST /api/crm/templates/sync — Sync all templates from Meta into local DB
 */
router.post('/templates/sync', async (req, res) => {
  try {
    const items = await listTemplates();
    let count = 0;

    for (const t of items) {
      const derived = derivedFromComponents(t.components);
      await Template.findOneAndUpdate(
        { name: t.name, language: t.language },
        {
          metaId: t.id,
          name: t.name,
          title: t.name,
          language: t.language,
          category: t.category,
          status: (t.status || 'PENDING').toUpperCase(),
          metaStatus: (t.status || 'PENDING').toUpperCase(),
          metaTemplateName: t.name,
          rejectedReason: t.rejected_reason || '',
          components: t.components,
          lastSyncedAt: new Date(),
          ...derived
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      count++;
    }

    res.json({ success: true, count });
  } catch (err) {
    console.error('Template sync error:', err.response?.data?.error?.message || err.message);
    res.status(500).json({ success: false, message: err.response?.data?.error?.message || err.message });
  }
});

/**
 * DELETE /api/crm/templates/:id — Delete template locally and on Meta
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const doc = await Template.findById(req.params.id);
    if (!doc) return res.json({ success: true });

    if (doc.name && (doc.metaId || (doc.status && doc.status !== 'DRAFT'))) {
      try {
        await deleteTemplate(doc.name);
      } catch (e) {
        const msg = e.response?.data?.error?.message || e.message;
        if (!/not found|does not exist/i.test(msg)) {
          console.warn('Meta template delete warning:', msg);
        }
      }
    }

    await doc.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Template deletion failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/templates/:id/send — Send an APPROVED Meta template to customer
 */
router.post('/templates/:id/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'phone required' });

    const doc = await Template.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Template not found' });
    if (doc.status !== 'APPROVED' || !doc.name) {
      return res.status(400).json({ success: false, message: 'Only APPROVED templates can be sent' });
    }

    const metaRes = await sendTemplate(phone, doc.name, {
      languageCode: doc.language || 'en_US',
      headerImageUrl: doc.headerType === 'image' ? doc.headerUrl || null : null
    });

    // Save outbound message to DB
    await Message.create({
      phone,
      direction: 'outbound',
      messageType: 'template',
      body: `Template: ${doc.title || doc.name}\n\n${doc.body || ''}`,
      status: 'delivered',
      metaMessageId: metaRes?.messages?.[0]?.id || ''
    });

    res.json({ success: true, data: metaRes });
  } catch (err) {
    console.error('Failed to send template:', err);
    res.status(500).json({ success: false, message: err.response?.data?.error?.message || err.message });
  }
});

export default router;
