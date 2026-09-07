import express from 'express';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import { sendTextMessage, sendImageMessage, sendPDFDocumentMessage } from '../services/metaService.js';

const router = express.Router();

/**
 * Helper to calculate 24h & 72h WhatsApp messaging window status
 * Shows RED color badge when remaining hours <= 10h!
 */
function getMessagingWindowStatus(lastActiveDate) {
  if (!lastActiveDate) return { type: 'expired', label: '🔴 Window Expired', color: '#ea4335', active: false };
  const now = new Date();
  const diffHours = (now - new Date(lastActiveDate)) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    const remainingHours = Math.max(0, Math.round(24 - diffHours));
    if (remainingHours <= 10) {
      return { type: '24h', label: `🔴 24h Window (${remainingHours}h left)`, color: '#ea4335', active: true };
    }
    return { type: '24h', label: `🟢 24h Window (${remainingHours}h left)`, color: '#107c41', active: true };
  } else if (diffHours <= 72) {
    const remainingHours = Math.max(0, Math.round(72 - diffHours));
    if (remainingHours <= 10) {
      return { type: '72h', label: `🔴 72h Ad Window (${remainingHours}h left)`, color: '#ea4335', active: true };
    }
    return { type: '72h', label: `🟡 72h Ad Window (${remainingHours}h left)`, color: '#f56300', active: true };
  } else {
    return { type: 'expired', label: '🔴 24h Session Closed', color: '#ea4335', active: false };
  }
}

/**
 * GET /api/crm/contacts — List all WhatsApp contacts with latest message & 24h window
 */
router.get('/contacts', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ updatedAt: -1 });

    const contactsWithDetails = await Promise.all(
      leads.map(async (ld) => {
        const lastMsg = await Message.findOne({ phone: ld.phone }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({ phone: ld.phone, direction: 'inbound', status: 'delivered' });
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
 * GET /api/crm/messages/:phone — Get full chat message history thread for a customer
 */
router.get('/messages/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const messages = await Message.find({ phone }).sort({ createdAt: 1 });

    // Mark inbound messages as read
    await Message.updateMany({ phone, direction: 'inbound' }, { status: 'read' });

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/crm/send-message — Send text or media message directly to WhatsApp via Meta API
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

    // Save outbound message to DB
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
 * DELETE /api/crm/chat/:phone — Delete complete chat history & lead
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

export default router;
