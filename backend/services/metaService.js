import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GRAPH_URL = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
const TOKEN = process.env.META_ACCESS_TOKEN;
const CATALOG_ID = process.env.META_CATALOG_ID || '1588495739954554';

const cleanPhone = (phone) => String(phone || '').replace('@c.us', '').replace(/\D/g, '');

const postMessage = async (payload) => {
  try {
    const response = await axios.post(GRAPH_URL, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN || TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Meta API Error:', error?.response?.data || error.message);
    throw error;
  }
};

/** Send plain text message */
export const sendTextMessage = async (to, bodyText) => {
  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'text',
    text: { body: bodyText }
  });
};

/** Send image message with caption */
export const sendImageMessage = async (to, imageUrl, captionText = '') => {
  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'image',
    image: {
      link: imageUrl,
      caption: captionText
    }
  });
};

/** Send PDF Document Message */
export const sendPDFDocumentMessage = async (to, pdfUrl, filename = 'Invoice.pdf', captionText = '') => {
  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'document',
    document: {
      link: pdfUrl,
      filename: filename,
      caption: captionText
    }
  });
};

/** Send Meta Approved Template Message (Works outside 24h window) */
export const sendTemplateMessage = async (to, templateName, languageCode = 'en_US', components = []) => {
  const payload = {
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode }
    }
  };

  if (components && components.length > 0) {
    payload.template.components = components;
  }

  return postMessage(payload);
};

/** Send Native Meta WhatsApp Catalog Message */
export const sendNativeCatalogMessage = async (to, bodyText = 'Explore our catalog', thumbnailProductId = '') => {
  const actionObj = {
    name: 'catalog_message'
  };

  if (thumbnailProductId) {
    actionObj.parameters = {
      thumbnail_product_retailer_id: thumbnailProductId
    };
  }

  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: {
      type: 'catalog_message',
      body: { text: bodyText },
      action: actionObj
    }
  });
};

/** Send Native Meta WhatsApp Product List Message */
export const sendNativeProductListMessage = async (to, bodyText, sections, headerText = 'IRIS PREMIUM BOTTLING') => {
  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: {
      type: 'product_list',
      header: {
        type: 'text',
        text: (headerText || 'IRIS PREMIUM BOTTLING').substring(0, 60)
      },
      body: {
        text: bodyText || 'Select a vessel from our Meta catalog:'
      },
      action: {
        catalog_id: process.env.META_CATALOG_ID || CATALOG_ID,
        sections: sections
      }
    }
  });
};

/** Send Interactive List Message (Meta Cloud API v21.0 requires text header for list messages) */
export const sendInteractiveListMessage = async (to, headerTextOrUrl, bodyText, buttonText, sections) => {
  let headerObj;
  if (headerTextOrUrl && !headerTextOrUrl.startsWith('http://') && !headerTextOrUrl.startsWith('https://')) {
    headerObj = { type: 'text', text: headerTextOrUrl };
  } else {
    headerObj = { type: 'text', text: 'IRIS PREMIUM BOTTLING' };
  }

  const interactiveObj = {
    type: 'list',
    header: headerObj,
    body: { text: bodyText },
    footer: { text: 'IRIS PREMIUM' },
    action: {
      button: buttonText || 'Choose Service',
      sections: sections
    }
  };

  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: interactiveObj
  });
};

/** Send Interactive Reply Button Message (Supports image headers) */
export const sendInteractiveButtonMessage = async (to, headerImageUrl, bodyText, buttons) => {
  const interactiveObj = {
    type: 'button',
    header: headerImageUrl ? { type: 'image', image: { link: headerImageUrl } } : undefined,
    body: { text: bodyText },
    footer: { text: 'IRIS PREMIUM' },
    action: {
      buttons: buttons.map((b) => ({
        type: 'reply',
        reply: { id: b.id, title: b.title }
      }))
    }
  };

  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: interactiveObj
  });
};

/** Send Interactive CTA Url Message */
export const sendInteractiveCTAUrlMessage = async (to, headerImageUrl, bodyText, buttonText, url) => {
  const interactiveObj = {
    type: 'cta_url',
    header: headerImageUrl ? { type: 'image', image: { link: headerImageUrl } } : undefined,
    body: { text: bodyText },
    footer: { text: 'IRIS PREMIUM' },
    action: {
      name: 'cta_url',
      parameters: {
        display_text: buttonText || 'Visit Website',
        url: url
      }
    }
  };

  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: interactiveObj
  });
};

/** Send Meta Flow Message */
export const sendInteractiveFlowMessage = async (to, headerImageUrl, bodyText, buttonText, flowId, flowToken = 'SERVICE_MENU', flowData = {}, screenId) => {
  const targetScreen = screenId || flowToken || 'SERVICE_MENU';
  const flowActionPayload = { screen: targetScreen };
  if (flowData && typeof flowData === 'object' && Object.keys(flowData).length > 0) {
    flowActionPayload.data = flowData;
  }

  const interactiveObj = {
    type: 'flow',
    header: headerImageUrl ? { type: 'image', image: { link: headerImageUrl } } : undefined,
    body: { text: bodyText },
    footer: { text: 'IRIS PREMIUM' },
    action: {
      name: 'flow',
      parameters: {
        flow_message_version: '3',
        flow_token: flowToken,
        flow_id: flowId,
        flow_cta: buttonText || 'Choose Service',
        flow_action: 'navigate',
        flow_action_payload: flowActionPayload
      }
    }
  };

  return postMessage({
    messaging_product: 'whatsapp',
    to: cleanPhone(to),
    type: 'interactive',
    interactive: interactiveObj
  });
};

/** Send Order Requested Notification to Concierge */
export const sendOrderRequestedNotification = async (toPhone, order) => {
  const msg = `🧾 *New Order Requested #${order.orderId}*\n\nCustomer: ${order.customerName}\nItem: ${order.productName} (${order.bottleSize})\nQty: ${order.quantity} Bottles\nTotal: ₹${order.totalAmount}\nStatus: ${order.orderStatus}`;
  return sendTextMessage(toPhone, msg);
};

/** List all message templates from Meta WABA */
export const listTemplates = async () => {
  const wabaId = process.env.WABA_ID;
  const token = process.env.META_ACCESS_TOKEN || TOKEN;
  if (!wabaId) throw new Error('WABA_ID is not configured');
  const res = await axios.get(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit: 200 }
  });
  return res.data?.data || [];
};

/** Get a single template details & review status by Meta ID */
export const getTemplate = async (metaId) => {
  const token = process.env.META_ACCESS_TOKEN || TOKEN;
  const res = await axios.get(`https://graph.facebook.com/v21.0/${metaId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { fields: 'name,status,category,language,components,id,rejected_reason' }
  });
  return res.data;
};

/** Create a new template on Meta WABA */
export const createTemplate = async (payload) => {
  const wabaId = process.env.WABA_ID;
  const token = process.env.META_ACCESS_TOKEN || TOKEN;
  if (!wabaId) throw new Error('WABA_ID is not configured');
  const res = await axios.post(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return res.data;
};

/** Delete a template from Meta WABA by name */
export const deleteTemplate = async (name) => {
  const wabaId = process.env.WABA_ID;
  const token = process.env.META_ACCESS_TOKEN || TOKEN;
  if (!wabaId) throw new Error('WABA_ID is not configured');
  const res = await axios.delete(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { name }
  });
  return res.data;
};

/** Upload header sample file (for media templates) */
export const uploadHeaderSample = async ({ fileUrl, fileName, fileType }) => {
  const appId = process.env.APP_ID || process.env.WA_APP_ID;
  const appSecret = process.env.APP_SECRET || process.env.WA_APP_SECRET;
  const token = process.env.META_ACCESS_TOKEN || TOKEN;
  if (!appId || !appSecret) throw new Error('APP_ID / APP_SECRET not configured for header upload');

  const fileResp = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(fileResp.data);
  const respMime = (fileResp.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const mime = fileType || respMime || 'application/octet-stream';

  const appAccessToken = `${appId}|${appSecret}`;
  const createResp = await axios.post(`https://graph.facebook.com/v21.0/${appId}/uploads`, null, {
    params: { file_name: fileName || 'header', file_length: buffer.length, file_type: mime, access_token: appAccessToken }
  });
  const sessionId = createResp.data.id;

  const uploadResp = await axios.post(`https://graph.facebook.com/v21.0/${sessionId}`, buffer, {
    headers: { Authorization: `OAuth ${token}`, file_offset: '0', 'Content-Type': mime },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
  const handle = uploadResp.data?.h;
  if (!handle) throw new Error('No header handle returned from Meta upload');
  return { header_handle: handle };
};

/** Send Template message with parameters */
export const sendTemplate = async (phone, templateName, { languageCode = 'en_US', headerImageUrl = null, bodyParams = [], buttonUrlParam = null } = {}) => {
  const components = [];
  if (headerImageUrl) {
    components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: headerImageUrl } }]
    });
  }
  if (bodyParams && bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map((t) => ({ type: 'text', text: String(t) }))
    });
  }
  if (buttonUrlParam) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: buttonUrlParam }]
    });
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanPhone(phone),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components.length ? { components } : {})
    }
  };

  return postMessage(payload);
};

export default {
  sendTextMessage,
  sendImageMessage,
  sendPDFDocumentMessage,
  sendTemplateMessage,
  sendNativeCatalogMessage,
  sendNativeProductListMessage,
  sendInteractiveListMessage,
  sendInteractiveButtonMessage,
  sendInteractiveCTAUrlMessage,
  sendInteractiveFlowMessage,
  sendOrderRequestedNotification,
  listTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
  uploadHeaderSample,
  sendTemplate
};
