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
  sendOrderRequestedNotification
};
