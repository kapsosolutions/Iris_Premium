import express from 'express';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import FlowAsset from '../models/FlowAsset.js';
import ContactSettings from '../models/ContactSettings.js';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import { generatePDFInvoice } from '../services/pdfInvoiceService.js';
import { urlToBase64 } from '../services/imageBase64.js';
import { decryptMetaRequest, encryptMetaResponse } from '../services/flowEncryption.js';
import {
  sendTextMessage,
  sendImageMessage,
  sendPDFDocumentMessage,
  sendInteractiveListMessage,
  sendInteractiveButtonMessage,
  sendInteractiveFlowMessage,
  sendInteractiveCTAUrlMessage,
  sendNativeCatalogMessage,
  sendNativeProductListMessage
} from '../services/metaService.js';

dotenv.config();
const router = express.Router();

const userCartStore = new Map();
const pendingLocationOrders = new Map();

function cleanPhone(num) {
  if (!num) return '';
  return String(num).replace(/\D/g, '');
}

/** 1. GET /webhook — Meta Webhook Handshake Verification */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WA_VERIFY_TOKEN || 'iris_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ Meta Webhook verified successfully!');
      return res.status(200).send(challenge);
    } else {
      console.error('❌ Webhook verification failed: Token mismatch.');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

/** 2. GET & POST /flow-endpoint — Meta Flow Data Exchange & Health Check Handler */
router.get('/flow-endpoint', (req, res) => {
  return res.status(200).json({ version: '6.3', data: { status: 'active' } });
});

router.post('/flow-endpoint', async (req, res) => {
  console.log('📩 RAW FLOW ENDPOINT HEADERS:', req.headers);
  console.log('📩 RAW FLOW ENDPOINT BODY:', JSON.stringify(req.body));
  try {
    let requestPayload = req.body || {};
    let aesKeyBuffer = null;
    let ivBuffer = null;

    // Check if request is encrypted by Meta
    if (req.body?.encrypted_flow_data) {
      try {
        const decrypted = decryptMetaRequest(req.body);
        requestPayload = decrypted.decryptedData;
        aesKeyBuffer = decrypted.aesKeyBuffer;
        ivBuffer = decrypted.ivBuffer;
      } catch (err) {
        console.error('❌ Flow Endpoint Decryption Error:', err.message);
      }
    }

    const { action, screen, data } = requestPayload || {};
    console.log('🔄 Meta Flow Endpoint Event:', action, screen, data);

    let responsePayload = {
      version: '6.3',
      screen: 'SERVICE_MENU',
      data: {
        show_categories: false
      }
    };

    if (action === 'ping' || !action) {
      responsePayload = {
        version: '6.3',
        data: { status: 'active' }
      };
    } else if (action === 'INIT') {
      const selectedService = data?.selected_service;
      responsePayload = {
        version: '6.3',
        screen: 'SERVICE_MENU',
        data: {
          show_categories: selectedService === 'book_order'
        }
      };
    } else if (action === 'data_exchange') {
      const selectedService = data?.selected_service;
      responsePayload = {
        version: '6.3',
        screen: 'SERVICE_MENU',
        data: {
          show_categories: selectedService === 'book_order'
        }
      };
    }

    if (aesKeyBuffer && ivBuffer) {
      const encryptedResponse = encryptMetaResponse(responsePayload, aesKeyBuffer, ivBuffer);
      return res.status(200).send(encryptedResponse);
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error('Flow endpoint error:', err.message);
    return res.status(200).json({ version: '6.3', data: { status: 'active' } });
  }
});

/** Helper to fetch flow asset object (image & textContent) from FlowAsset DB */
const getFlowAssetObj = async (key, fallbackUrl, fallbackText = '') => {
  try {
    const asset = await FlowAsset.findOne({ assetKey: key });
    return {
      imageUrl: asset?.imageUrl || fallbackUrl,
      textContent: asset?.textContent || fallbackText
    };
  } catch (err) {
    return { imageUrl: fallbackUrl, textContent: fallbackText };
  }
};

const getFlowAsset = async (key, fallbackUrl) => {
  const obj = await getFlowAssetObj(key, fallbackUrl);
  return obj.imageUrl;
};

/** 2. POST /webhook — Main Webhook Message Engine */
router.post('/webhook', async (req, res) => {
  // Always return 200 OK to Meta immediately
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const from = message.from; // User's WhatsApp phone number
    const msgType = message.type;

    console.log(`📩 Incoming WhatsApp message from ${from} [Type: ${msgType}]`);

    const contactName = value?.contacts?.[0]?.profile?.name || 'WhatsApp Customer';
    
    // Save/Update Lead
    await Lead.findOneAndUpdate(
      { phone: from },
      {
        name: contactName,
        lastActive: new Date(),
        $inc: { interactionCount: 1 }
      },
      { upsert: true, new: true }
    );

    // Save Inbound Message for WhatsApp CRM
    const textBody = message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || `Interactive ${msgType} message`;
    await Message.create({
      phone: from,
      direction: 'inbound',
      messageType: msgType,
      body: textBody,
      status: 'delivered',
      metaMessageId: message.id
    }).catch(e => console.error('Error logging CRM message:', e.message));

    // Default Images
    const defaultBanner = 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg';

    // CASE CATALOG_CART_ORDER: User submits catalog cart from WhatsApp Commerce Catalog
    if (msgType === 'order' || message.type === 'order' || message.order) {
      const orderData = message.order || {};
      const productItems = orderData.product_items || [];
      const cleanUserPhone = cleanPhone(from);

      let totalBill = 0;
      const formattedItems = [];
      const itemsForInvoice = [];

      for (const item of productItems) {
        const qty = item.quantity || 1;
        const price = Number(item.item_price || 350);
        const itemTotal = qty * price;
        totalBill += itemTotal;

        const retailerId = item.product_retailer_id || '';
        let itemName = 'Iris Custom Water Bottle';
        let packQtyLabel = '1 Bottle';

        if (retailerId.includes('_pack')) {
          const packNum = retailerId.split('_pack')[1];
          packQtyLabel = `Box of ${packNum} Bottles`;
        }

        const titleDisplay = `${itemName} (${packQtyLabel})`;
        formattedItems.push(`• ${titleDisplay} x ${qty} — ₹${itemTotal.toFixed(2)}`);
        itemsForInvoice.push({
          name: titleDisplay,
          size: packQtyLabel,
          quantity: qty,
          unitPrice: price,
          total: itemTotal
        });
      }

      if (totalBill === 0) totalBill = 350;

      // Save user cart context in memory
      userCartStore.set(cleanUserPhone, {
        items: itemsForInvoice,
        totalAmount: totalBill
      });

      const checkoutFlowId = process.env.META_FLOW_CHECKOUT_ID || '1672923447139048';
      const checkoutHeaderUrl = await getFlowAsset('choose_service_header', defaultBanner);

      const checkoutBody = `🛒 *Order Cart Summary:*\n\n${formattedItems.join('\n')}\n\n*Total Bill:* ₹${totalBill.toFixed(2)}\n\nTap below to complete your order details, logo branding name & delivery date!`;

      await sendInteractiveFlowMessage(
        from,
        checkoutHeaderUrl,
        checkoutBody,
        'Proceed Order 📦',
        checkoutFlowId,
        'CHECKOUT_SCREEN',
        {
          whatsapp_number: cleanUserPhone
        }
      );
      return;
    }

    // CASE LOCATION_MESSAGE: User shares live delivery location pin
    if (msgType === 'location' || message.type === 'location' || message.location) {
      const cleanUserPhone = cleanPhone(from);
      const locData = message.location || {};
      const orderIdInPending = pendingLocationOrders.get(cleanUserPhone);

      let ord;
      if (orderIdInPending) {
        ord = await Order.findById(orderIdInPending);
      } else {
        ord = await Order.findOne({ whatsappNumber: { $regex: cleanUserPhone } }).sort({ createdAt: -1 });
      }

      if (ord) {
        ord.deliveryLocation = {
          latitude: locData.latitude,
          longitude: locData.longitude,
          address: locData.address || locData.name || 'Shared GPS Coordinates'
        };
        ord.orderStatus = 'Confirmed';
        await ord.save();

        // Generate Dynamic Local PDF Invoice (NO Cloudinary)
        const pdfUrl = await generatePDFInvoice(ord);
        ord.pdfInvoiceUrl = pdfUrl;
        await ord.save();

        // 1. Send PDF Document Attachment Message matching pdfattachmessage.png
        await sendPDFDocumentMessage(
          from,
          pdfUrl,
          `Iris_Invoice_${ord.orderId}.pdf`,
          `🎉 *Your Order Has Been Placed Successfully!*\n\nThank you for choosing Iris Premium. Your custom bottle artwork proof & dispatch timeline have been generated.\n\n*Order ID:* #${ord.orderId}\n*Branding Name:* ${ord.brandingName || ord.customerName}\n*Total Bill:* ₹${ord.totalAmount}`
        );

        // 2. Send Interactive Button Message with Choose Service CTA
        await sendInteractiveButtonMessage(
          from,
          defaultBanner,
          `✅ *Order #${ord.orderId} Confirmed & Scheduled!*\n\nOur concierge design team has received your order. Tap below to return to main menu or track your order live:`,
          [
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' },
            { id: `track_live_${ord._id}`, title: 'TRACK ORDER 🚚' }
          ]
        );
      } else {
        await sendTextMessage(from, '📍 Location received! Thank you for choosing Iris Premium.');
      }
      return;
    }

    // CASE A: User sends Text (e.g. "Hi", "Hello", "Menu", or any text)
    if (msgType === 'text') {
      const chooseServiceFlowId = process.env.META_FLOW_CHOOSE_SERVICE_ID || '1137012078787664';
      const defaultWelcomeText = `👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling for premier hotels, luxury weddings, and VIP galas.\n\nClick the button below to open our interactive Concierge Service Flow:`;

      const welcomeAsset = await getFlowAssetObj('welcome_banner', defaultBanner, defaultWelcomeText);

      const defaultIcon = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';
      const chooseServiceHeaderUrl = await getFlowAsset('choose_service_header', defaultBanner);

      const bookUrl = await getFlowAsset('icon_book_order', defaultIcon);
      const myOrdersUrl = await getFlowAsset('icon_my_orders', defaultIcon);
      const trackUrl = await getFlowAsset('icon_track_order', defaultIcon);
      const contactUrl = await getFlowAsset('icon_contact_us', defaultIcon);

      const [bannerB64, bookB64, myOrdersB64, trackB64, contactB64] = await Promise.all([
        urlToBase64(chooseServiceHeaderUrl, { width: 1600, height: 200, quality: 92, crop: 'fill', format: 'jpg' }),
        urlToBase64(bookUrl, { width: 100, height: 100, crop: 'fill', format: 'jpg' }),
        urlToBase64(myOrdersUrl, { width: 100, height: 100, crop: 'fill', format: 'jpg' }),
        urlToBase64(trackUrl, { width: 100, height: 100, crop: 'fill', format: 'jpg' }),
        urlToBase64(contactUrl, { width: 100, height: 100, crop: 'fill', format: 'jpg' })
      ]);

      const initialFlowData = {
        welcome_banner: bannerB64,
        has_welcome_banner: Boolean(bannerB64),
        services: [
          { id: 'book_order', title: 'Book Order', description: 'Browse bottle catalog & 24K gold foil', image: bookB64 },
          { id: 'my_orders', title: 'My Orders', description: 'View history & custom proof status', image: myOrdersB64 },
          { id: 'track_order', title: 'Track Order', description: 'Live dispatch timeline', image: trackB64 },
          { id: 'contact_us', title: 'Contact Us', description: 'Plant address & Google Maps', image: contactB64 }
        ]
      };

      await sendInteractiveFlowMessage(
        from,
        welcomeAsset.imageUrl,
        welcomeAsset.textContent || defaultWelcomeText,
        'Choose Service 📋',
        chooseServiceFlowId,
        'SERVICE_MENU',
        initialFlowData
      );

      // Log outbound welcome flow message to Message DB for WhatsApp CRM
      await Message.create({
        phone: from,
        direction: 'outbound',
        messageType: 'flow',
        body: `${welcomeAsset.textContent || defaultWelcomeText}\n\n[Interactive Flow Button: Choose Service 📋]`,
        mediaUrl: welcomeAsset.imageUrl,
        status: 'delivered'
      }).catch(e => console.error('Error logging outbound CRM welcome message:', e.message));

      return;
    }

/** Helper to send category-wise grouped product list & Meta Shop Catalog */
async function sendCategoryWiseCatalog(from, selectedCatFilter = '') {
  let filterQuery = { active: true };
  let catNameDisplay = 'Iris Premium Bottles';

  if (selectedCatFilter.includes('wedding')) {
    filterQuery.$or = [{ category: /wedding/i }, { categories: { $in: [/wedding/i] } }];
    catNameDisplay = 'Marriages / Weddings';
  } else if (selectedCatFilter.includes('family')) {
    filterQuery.$or = [{ category: /family/i }, { categories: { $in: [/family/i] } }];
    catNameDisplay = 'Family Functions';
  } else if (selectedCatFilter.includes('hotel')) {
    filterQuery.$or = [{ category: /hotel/i }, { categories: { $in: [/hotel/i] } }];
    catNameDisplay = 'Hotels & Resorts';
  } else if (selectedCatFilter.includes('restaurant')) {
    filterQuery.$or = [{ category: /restaurant/i }, { categories: { $in: [/restaurant/i] } }];
    catNameDisplay = 'Restaurants & Cafes';
  } else if (selectedCatFilter.includes('bus')) {
    filterQuery.$or = [{ category: /bus/i }, { categories: { $in: [/bus/i] } }];
    catNameDisplay = 'Bus Travels';
  } else if (selectedCatFilter.includes('hospital')) {
    filterQuery.$or = [{ category: /hospital/i }, { categories: { $in: [/hospital/i] } }];
    catNameDisplay = 'Hospitals';
  } else if (selectedCatFilter.includes('mall')) {
    filterQuery.$or = [{ category: /mall/i }, { categories: { $in: [/mall/i] } }];
    catNameDisplay = 'Shopping Malls';
  } else if (selectedCatFilter.includes('house')) {
    filterQuery.$or = [{ category: /house/i }, { categories: { $in: [/house/i] } }];
    catNameDisplay = 'House Purpose';
  } else if (selectedCatFilter.includes('political')) {
    filterQuery.$or = [{ category: /political/i }, { categories: { $in: [/political/i] } }];
    catNameDisplay = 'Political Events';
  } else if (selectedCatFilter.includes('jewelry')) {
    filterQuery.$or = [{ category: /jewelry/i }, { categories: { $in: [/jewelry/i] } }];
    catNameDisplay = 'Jewelry Shops';
  } else if (selectedCatFilter.includes('car')) {
    filterQuery.$or = [{ category: /car/i }, { categories: { $in: [/car/i] } }];
    catNameDisplay = 'Car / Bike Showrooms';
  } else if (selectedCatFilter.includes('corporate')) {
    filterQuery.$or = [{ category: /corporate/i }, { categories: { $in: [/corporate/i] } }];
    catNameDisplay = 'Corporates & Summits';
  } else if (selectedCatFilter.includes('catering')) {
    filterQuery.$or = [{ category: /catering/i }, { categories: { $in: [/catering/i] } }];
    catNameDisplay = 'Caterings & Events';
  } else if (selectedCatFilter.includes('shop')) {
    filterQuery.$or = [{ category: /shop/i }, { categories: { $in: [/shop/i] } }];
    catNameDisplay = 'Small Shops & Outlets';
  } else if (selectedCatFilter.includes('school')) {
    filterQuery.$or = [{ category: /school/i }, { categories: { $in: [/school/i] } }];
    catNameDisplay = 'Schools & Colleges';
  } else if (selectedCatFilter.includes('festival')) {
    filterQuery.$or = [{ category: /festival/i }, { categories: { $in: [/festival/i] } }];
    catNameDisplay = 'Festivals & Celebrations';
  }

  let products = [];
  if (selectedCatFilter && selectedCatFilter !== 'purpose_all') {
    products = await Product.find(filterQuery);
  }

  // If no category filter specified or all bottle models selected, fetch active products
  if (!products || products.length === 0) {
    products = await Product.find({ active: true });
  }

  if (!products || products.length === 0) {
    await sendTextMessage(from, `📦 *${catNameDisplay}*\n\nOur product catalog for this category is currently being updated by the concierge. Please check back shortly!`);
    return;
  }

  // Expand products into bulk pack retailer IDs (50, 100, 250, 500, 1000)
  const productRetailerItems = [];
  products.forEach(p => {
    const baseId = p.retailerId || `iris_prod_${p._id}`;
    const packSizes = Array.isArray(p.packSizes) && p.packSizes.length > 0 ? p.packSizes : [50, 100, 250, 500, 1000];
    
    // Include base 1-bottle item + bulk pack items (50, 100, 250...)
    productRetailerItems.push({ product_retailer_id: baseId });
    packSizes.forEach(size => {
      productRetailerItems.push({ product_retailer_id: `${baseId}_pack${size}` });
    });
  });

  const headerTitle = catNameDisplay.substring(0, 60);
  const catalogBody = `Bulk Pack Options (50, 100, 250, 500, 1000 Bottles)\nTap below to select bulk pack & add to cart 🛒`;

  // Build Native Catalog Product List Sections for this category
  const nativeSections = [{
    title: catNameDisplay.substring(0, 24).toUpperCase(),
    product_items: productRetailerItems.slice(0, 30)
  }];

  try {
    // Send Native Product List Message ("View items" button) matching exact FMCG / Restarunt project output
    await sendNativeProductListMessage(from, catalogBody, nativeSections, headerTitle);
  } catch (err) {
    console.warn('Native Product List fallback:', err.message, err.response?.data);
    // Fallback matching FMCG project: send 1:1 image card for the category product
    for (const p of products.slice(0, 5)) {
      if (p.mainImage) {
        await sendImageMessage(
          from,
          p.mainImage,
          `🍾 *${catNameDisplay}*\n✨ *${p.name}*\n\n${p.description || ''}\n\n*Price:* ₹${p.price}/bottle (${p.bottleSize || '750ml'})\n\nTap below to order via WhatsApp concierge!`
        ).catch(() => {});
      }
    }
  }
}

    // CASE FLOW_SUBMISSION: User submits Meta Flow ("nfm_reply")
    if (msgType === 'interactive' && (message.interactive?.type === 'nfm_reply' || message.interactive?.nfm_reply)) {
      const nfmData = message.interactive.nfm_reply;
      let responseObj = {};
      try {
        responseObj = JSON.parse(nfmData.response_json || '{}');
      } catch (e) {}

      console.log('📋 Parsed Flow Response Object:', responseObj);

      const serviceChoice = String(
        responseObj.service || responseObj.selected_service || responseObj.service_id || responseObj.id || responseObj.screen || responseObj.action || ''
      ).toLowerCase();
      const categoryChoice = String(
        responseObj.selected_category || responseObj.category || ''
      ).toLowerCase();

      console.log(`✨ Selected Flow Service Choice: "${serviceChoice}", Category: "${categoryChoice}"`);

      // 0. Flow 3: Custom Order Checkout Flow Submission
      if (responseObj.customer_name || responseObj.branding_name) {
        const cleanUserPhone = cleanPhone(from);
        const orderId = `IR-${Math.floor(100000 + Math.random() * 900000)}`;

        const userContext = userCartStore.get(cleanUserPhone) || {};
        const items = userContext.items || [{ name: 'Iris Custom Water Bottle', size: '750ml', quantity: 1, unitPrice: userContext.totalAmount || 350, total: userContext.totalAmount || 350 }];
        const totalBill = userContext.totalAmount || 350;

        const newOrder = new Order({
          orderId,
          customerName: responseObj.customer_name || 'Valued Client',
          brandingName: responseObj.branding_name || 'Custom Brand',
          whatsappNumber: cleanUserPhone,
          phoneNumber: responseObj.phone_number || cleanUserPhone,
          deliveryDate: responseObj.delivery_date || 'Standard Dispatch',
          brandLogoNote: responseObj.brand_logo_note || '',
          productName: items[0]?.name || 'Iris Custom Bottle',
          bottleSize: items[0]?.size || '750ml',
          quantity: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
          unitPrice: items[0]?.unitPrice || totalBill,
          totalAmount: totalBill,
          items: items,
          orderStatus: 'Placed',
          trackingSteps: [
            { title: 'Order Placed & Registered', location: 'Iris Bottling Facility', completed: true },
            { title: 'Digital Proof Approval', location: 'Design Studio', completed: false },
            { title: 'Bottle Filling & Foil Printing', location: 'Production Line 1', completed: false },
            { title: 'Ice-Bucket Quality Check', location: 'QC Lab', completed: false },
            { title: 'Out for Dispatch', location: 'Logistics Fleet', completed: false }
          ]
        });

        await newOrder.save();
        pendingLocationOrders.set(cleanUserPhone, newOrder._id);

        const publicServerUrl = process.env.PUBLIC_SERVER_URL || 'https://e5a9-2409-40f0-5052-f94a-dcd3-d3ca-9fc7-2ad5.ngrok-free.app';
        const locationImageUrl = `${publicServerUrl}/uploads/location.jpeg`;
        const locationBody = `📍 *Please Share Your Delivery Location*\n\nThank you *${responseObj.customer_name}*!\nYour custom label order for *"${responseObj.branding_name}"* (Order #${orderId}) has been registered.\n\nPlease share your live location pin below so our logistics team can dispatch your order directly to your doorstep.`;

        await sendInteractiveButtonMessage(
          from,
          locationImageUrl,
          locationBody,
          [
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' }
          ]
        );
        return;
      }

      // 1. If category choice was selected (from Flow 2 Category Selection Flow), send matching product catalog!
      if (categoryChoice) {
        await sendCategoryWiseCatalog(from, categoryChoice);
        return;
      }

      // 2. Service: Book Order selected from Flow 1 (Choose Service Welcome Flow)
      if (serviceChoice.includes('book') || serviceChoice.includes('catalog')) {
        const categoryFlowId = process.env.META_FLOW_CATEGORY_ID || '2738549013209006';

        await sendInteractiveFlowMessage(
          from,
          null,
          `🍾 *Select Bottle Purpose / Event*\n\nPlease tap below to select your category:`,
          'Select Category 🍾',
          categoryFlowId,
          'CATEGORY_MENU',
          {}
        );
        return;
      }

      // 2. Service: My Orders
      if (serviceChoice.includes('my_order') || serviceChoice.includes('orders')) {
        const cleanUserPhone = cleanPhone(from);
        const userOrders = await Order.find({
          whatsappNumber: { $regex: cleanUserPhone }
        }).sort({ createdAt: -1 });

        const myOrdersHeader = await getFlowAsset('my_orders_header', defaultBanner);

        if (userOrders.length === 0) {
          const noOrderBody = `📋 *No Orders Found*\n\nWe couldn't find any bespoke bottle orders associated with WhatsApp number +${cleanUserPhone}.\n\nWould you like to browse our bottle catalog or select another service?`;
          await sendInteractiveButtonMessage(
            from,
            myOrdersHeader,
            noOrderBody,
            [
              { id: 'service_book_order', title: 'BOOK ORDER 📦' },
              { id: 'btn_choose_service', title: 'CHOOSE SERVICE 📋' }
            ]
          );
          return;
        }

        const orderRows = userOrders.slice(0, 8).map((ord) => ({
          id: `order_detail_${ord._id}`,
          title: `#${ord.orderId} - ${ord.productName.substring(0, 18)}`,
          description: `Status: ${ord.orderStatus} • ₹${ord.totalAmount}`
        }));

        await sendInteractiveListMessage(
          from,
          myOrdersHeader,
          `📋 *Your Order History*\n\nFound ${userOrders.length} order(s) for your account. Click below to view dynamic order details & visual status table:`,
          'Your Orders',
          [{ title: 'YOUR BOTTLE ORDERS', rows: orderRows }]
        );
        return;
      }

      // 3. Service: Track Order
      if (serviceChoice.includes('track')) {
        const cleanUserPhone = cleanPhone(from);
        const activeOrders = await Order.find({
          whatsappNumber: { $regex: cleanUserPhone }
        }).sort({ createdAt: -1 });

        const trackHeader = await getFlowAsset('track_order_header', defaultBanner);

        if (activeOrders.length === 0) {
          const noTrackBody = `🚚 *No Active Deliveries*\n\nYou currently have no active bottle shipments in transit for WhatsApp number +${cleanUserPhone}.\n\nWould you like to browse our bottle catalog or select another service?`;
          await sendInteractiveButtonMessage(
            from,
            trackHeader,
            noTrackBody,
            [
              { id: 'service_book_order', title: 'BOOK ORDER 📦' },
              { id: 'btn_choose_service', title: 'CHOOSE SERVICE 📋' }
            ]
          );
          return;
        }

        const trackRows = activeOrders.slice(0, 5).map((ord) => ({
          id: `track_live_${ord._id}`,
          title: `#${ord.orderId} - ${ord.orderStatus}`,
          description: `${ord.quantity}x ${ord.bottleSize}`
        }));

        await sendInteractiveListMessage(
          from,
          trackHeader,
          `🚚 *Live Order Tracking*\n\nSelect an active order below to view step-by-step dispatch status:`,
          'Track Order',
          [{ title: 'ACTIVE SHIPMENTS', rows: trackRows }]
        );
        return;
      }

      // 4. Service: Contact Us
      if (serviceChoice.includes('contact') || serviceChoice.includes('maps')) {
        let contact = await ContactSettings.findOne();
        if (!contact) {
          contact = {
            officeAddress: 'Iris Premium Bottling Plant, 100 Alpine Spring Way, Nellore, Andhra Pradesh',
            phoneNumbers: ['+91 98765 43210', '+91 98765 43211'],
            email: 'concierge@irispremium.com',
            googleMapsUrl: 'https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m'
          };
        }

        const contactHeader = await getFlowAsset('contact_header', defaultBanner);
        const contactBody = `📞 *Iris Concierge & Plant Location*\n\n🏢 *Address:* ${contact.officeAddress}\n\n📱 *Phone:* ${contact.phoneNumbers.join(', ')}\n📧 *Email:* ${contact.email}\n\n📍 *Google Maps Pin:* ${contact.googleMapsUrl}`;

        await sendInteractiveCTAUrlMessage(from, contactHeader, contactBody, 'OPEN GOOGLE MAPS 📍', contact.googleMapsUrl);
        return;
      }

      // Fallback: Send Interactive List Menu
      const defaultIcon = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';
      const listHeaderImage = await getFlowAsset('choose_service_header', defaultBanner);
      const iconBook = await getFlowAsset('icon_book_order', defaultIcon);
      const iconMyOrders = await getFlowAsset('icon_my_orders', defaultIcon);
      const iconTrack = await getFlowAsset('icon_track_order', defaultIcon);
      const iconContact = await getFlowAsset('icon_contact_us', defaultIcon);

      const listBodyText = `📋 *Iris Concierge Service Menu*\n\nPlease select one of the 4 options below to manage your customized water bottle orders:`;
      const listSections = [
        {
          title: 'PRIMARY SERVICES',
          rows: [
            { id: 'service_book_order', title: '📦 Book Order', description: 'Browse bottle sizes, variants & custom gold foil labels', imageUrl: iconBook.replace('/upload/', '/upload/c_fill,h_500,w_500/') },
            { id: 'service_my_orders', title: '📋 My Orders', description: 'View your past bottle orders & label proofs', imageUrl: iconMyOrders.replace('/upload/', '/upload/c_fill,h_500,w_500/') },
            { id: 'service_track_order', title: '🚚 Track Order', description: 'Live shipment status & delivery tracking', imageUrl: iconTrack.replace('/upload/', '/upload/c_fill,h_500,w_500/') },
            { id: 'service_contact_us', title: '📞 Contact Us', description: 'Plant location, concierge phone & Google Maps', imageUrl: iconContact.replace('/upload/', '/upload/c_fill,h_500,w_500/') }
          ]
        }
      ];

      await sendInteractiveListMessage(from, listHeaderImage, listBodyText, 'Choose Service', listSections);
      return;
    }

    // CASE B: User clicks Interactive Reply Button
    if (msgType === 'interactive' && message.interactive?.type === 'button_reply') {
      const buttonId = message.interactive.button_reply.id;

      if (buttonId === 'btn_choose_service') {
        // Send Interactive List Message with dynamic 1:1 Icon Ratios for each of the 4 options
        const defaultIcon = 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png';
        const listHeaderImage = await getFlowAsset('choose_service_header', defaultBanner);

        const iconBook = await getFlowAsset('icon_book_order', defaultIcon);
        const iconMyOrders = await getFlowAsset('icon_my_orders', defaultIcon);
        const iconTrack = await getFlowAsset('icon_track_order', defaultIcon);
        const iconContact = await getFlowAsset('icon_contact_us', defaultIcon);

        const listBodyText = `📋 *Iris Concierge Service Menu*\n\nPlease select one of the 4 options below to manage your customized water bottle orders:`;

        const listSections = [
          {
            title: 'PRIMARY SERVICES',
            rows: [
              {
                id: 'service_book_order',
                title: '📦 Book Order',
                description: 'Browse bottle sizes, variants & custom gold foil labels',
                imageUrl: iconBook.replace('/upload/', '/upload/c_fill,h_500,w_500/')
              },
              {
                id: 'service_my_orders',
                title: '📋 My Orders',
                description: 'View your past bottle orders & label proofs',
                imageUrl: iconMyOrders.replace('/upload/', '/upload/c_fill,h_500,w_500/')
              },
              {
                id: 'service_track_order',
                title: '🚚 Track Order',
                description: 'Live shipment status & delivery tracking',
                imageUrl: iconTrack.replace('/upload/', '/upload/c_fill,h_500,w_500/')
              },
              {
                id: 'service_contact_us',
                title: '📞 Contact Us',
                description: 'Plant location, concierge phone & Google Maps',
                imageUrl: iconContact.replace('/upload/', '/upload/c_fill,h_500,w_500/')
              }
            ]
          }
        ];

        await sendInteractiveListMessage(from, listHeaderImage, listBodyText, 'Choose Service', listSections);
        return;
      }

      if (buttonId === 'btn_book_order' || buttonId === 'service_book_order') {
        await sendCategoryWiseCatalog(from);
        return;
      }
    }

    // CASE C: User selects item from Interactive List Menu
    if (msgType === 'interactive' && message.interactive?.type === 'list_reply') {
      const listId = message.interactive.list_reply.id;

      // 1. Service: Book Order
      if (listId === 'service_book_order') {
        await sendCategoryWiseCatalog(from);
        return;
      }

      // 2. Service: My Orders
      if (listId === 'service_my_orders') {
        const cleanUserPhone = cleanPhone(from);
        const userOrders = await Order.find({
          whatsappNumber: { $regex: cleanUserPhone }
        }).sort({ createdAt: -1 });

        const myOrdersHeader = await getFlowAsset('my_orders_header', defaultBanner);

        if (userOrders.length === 0) {
          const noOrderBody = `📋 *No Orders Found*\n\nWe couldn't find any bespoke bottle orders associated with WhatsApp number +${cleanUserPhone}.\n\nWould you like to browse our bottle catalog or select another service?`;
          await sendInteractiveButtonMessage(
            from,
            myOrdersHeader,
            noOrderBody,
            [
              { id: 'service_book_order', title: 'BOOK ORDER 📦' },
              { id: 'btn_choose_service', title: 'CHOOSE SERVICE 📋' }
            ]
          );
          return;
        }

        const orderRows = userOrders.slice(0, 8).map((ord) => ({
          id: `order_detail_${ord._id}`,
          title: `#${ord.orderId} - ${ord.productName.substring(0, 18)}`,
          description: `Status: ${ord.orderStatus} • ₹${ord.totalAmount}`
        }));

        await sendInteractiveListMessage(
          from,
          myOrdersHeader,
          `📋 *Your Order History*\n\nFound ${userOrders.length} order(s) for your account. Click below to view dynamic order details & visual status table:`,
          'Your Orders',
          [{ title: 'YOUR BOTTLE ORDERS', rows: orderRows }]
        );
        return;
      }

      // 3. Service: Track Order
      if (listId === 'service_track_order') {
        const cleanUserPhone = cleanPhone(from);
        const activeOrders = await Order.find({
          whatsappNumber: { $regex: cleanUserPhone }
        }).sort({ createdAt: -1 });

        const trackHeader = await getFlowAsset('track_order_header', defaultBanner);

        if (activeOrders.length === 0) {
          const noTrackBody = `🚚 *No Active Deliveries*\n\nYou currently have no active bottle shipments in transit for WhatsApp number +${cleanUserPhone}.\n\nWould you like to browse our bottle catalog or select another service?`;
          await sendInteractiveButtonMessage(
            from,
            trackHeader,
            noTrackBody,
            [
              { id: 'service_book_order', title: 'BOOK ORDER 📦' },
              { id: 'btn_choose_service', title: 'CHOOSE SERVICE 📋' }
            ]
          );
          return;
        }
        const trackRows = activeOrders.slice(0, 5).map((ord) => ({
          id: `track_live_${ord._id}`,
          title: `#${ord.orderId} - ${ord.orderStatus}`,
          description: `${ord.quantity}x ${ord.bottleSize}`
        }));

        await sendInteractiveListMessage(
          from,
          trackHeader,
          `🚚 *Live Order Tracking*\n\nSelect an active order below to view step-by-step dispatch status:`,
          'Track Order',
          [{ title: 'ACTIVE SHIPMENTS', rows: trackRows }]
        );
        return;
      }

      // 4. Service: Contact Us
      if (listId === 'service_contact_us') {
        let contact = await ContactSettings.findOne();
        if (!contact) {
          contact = {
            officeAddress: 'Iris Premium Bottling Plant, 100 Alpine Spring Way, Nellore, Andhra Pradesh',
            phoneNumbers: ['+91 98765 43210', '+91 98765 43211'],
            email: 'concierge@irispremium.com',
            googleMapsUrl: 'https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m'
          };
        }

        const contactHeader = await getFlowAsset('contact_header', defaultBanner);
        const contactBody = `📞 *Iris Concierge & Plant Location*\n\n🏢 *Address:* ${contact.officeAddress}\n\n📱 *Phone:* ${contact.phoneNumbers.join(', ')}\n📧 *Email:* ${contact.email}\n\n📍 *Google Maps Pin:* ${contact.googleMapsUrl}`;

        await sendInteractiveCTAUrlMessage(from, contactHeader, contactBody, 'OPEN GOOGLE MAPS 📍', contact.googleMapsUrl);
        return;
      }

      // 5. Product Detail Selected (e.g. `prod_xxxx`)
      if (listId.startsWith('prod_')) {
        const prodId = listId.replace('prod_', '');
        const product = await Product.findById(prodId);

        if (!product) {
          await sendTextMessage(from, 'Product not found.');
          return;
        }

        let variantText = '';
        if (product.variants && product.variants.length > 0) {
          variantText = `\n\n*Available Size Variants:*\n` + product.variants.map((v) => `• ${v.size} — ₹${v.price}/bottle (${v.labelFinish})`).join('\n');
        }

        const prodBody = `🍾 *${product.name.toUpperCase()}*\n\n${product.description || 'Natural Alpine Artesian Spring Water (pH 7.8 naturally alkaline) with 24K embossed gold foil waterproof labeling.'}\n\n*Category:* ${product.category}\n*Standard Price:* ₹${product.price}/bottle${variantText}\n\nClick below to confirm your customized order details & request your formal PDF invoice:`;

        // Send Product Detail Message with Image Header
        await sendInteractiveButtonMessage(
          from,
          product.mainImage || defaultBanner,
          prodBody,
          [
            { id: `order_confirm_${product._id}`, title: 'CONFIRM ORDER 📝' },
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' }
          ]
        );
        return;
      }

      // 6. Order Confirmation Action (`order_confirm_xxxx`)
      if (listId.startsWith('order_confirm_')) {
        const prodId = listId.replace('order_confirm_', '');
        const product = await Product.findById(prodId);

        if (!product) return;

        // Create Order Record in DB
        const newOrderId = `IR-${Math.floor(100000 + Math.random() * 900000)}`;
        const cleanUserPhone = cleanPhone(from);

        const newOrder = new Order({
          orderId: newOrderId,
          customerName: `Concierge Client (${cleanUserPhone})`,
          whatsappNumber: cleanUserPhone,
          phoneNumber: cleanUserPhone,
          monogramText: 'Iris Reserve Monogram',
          productName: product.name,
          bottleSize: product.variants?.[0]?.size || '750ml Heavy Glass Reserve',
          labelFinish: product.variants?.[0]?.labelFinish || '24K Embossed Gold Foil',
          quantity: 250,
          unitPrice: product.price,
          totalAmount: 250 * product.price,
          orderStatus: 'Placed',
          trackingSteps: [
            { title: 'Order Placed & Registered', location: 'Iris Bottling Facility', completed: true },
            { title: 'Digital Proof Approval', location: 'Design Studio', completed: false },
            { title: 'Bottle Filling & Foil Printing', location: 'Production Line 1', completed: false },
            { title: 'Ice-Bucket Quality Check', location: 'QC Lab', completed: false },
            { title: 'Out for Dispatch', location: 'Logistics Fleet', completed: false }
          ]
        });

        // Generate Dynamic PDF Invoice
        const pdfUrl = await generatePDFInvoice(newOrder);
        newOrder.pdfInvoiceUrl = pdfUrl;
        await newOrder.save();

        // Send PDF Invoice Document
        await sendPDFDocumentMessage(
          from,
          pdfUrl,
          `Invoice_${newOrderId}.pdf`,
          `🧾 *Formal Price Quote & Invoice #${newOrderId}*\n\nYour customized bottle order has been logged! View attached PDF invoice.`
        );

        // Send Order Confirmation Message with Choose Service Button
        const confirmText = `✅ *Order Placed Successfully!*\n\n*Order ID:* #${newOrderId}\n*Item:* ${product.name}\n*Quantity:* 250 Bottles\n*Total Amount:* ₹${newOrder.totalAmount}\n*Status:* Placed / In Review\n\nOur concierge team is reviewing your digital label proof. Click below to return to main menu:`;

        await sendInteractiveButtonMessage(
          from,
          product.mainImage || defaultBanner,
          confirmText,
          [
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' }
          ]
        );
        return;
      }

      // 7. Order Detail View (`order_detail_xxxx`)
      if (listId.startsWith('order_detail_')) {
        const orderId = listId.replace('order_detail_', '');
        const ord = await Order.findById(orderId);

        if (!ord) return;

        const orderDetailText = `📋 *ORDER DETAILS #${ord.orderId}*\n\n*Item:* ${ord.productName}\n*Vessel/Size:* ${ord.bottleSize}\n*Label Finish:* ${ord.labelFinish}\n*Quantity:* ${ord.quantity} Bottles\n*Total Amount:* ₹${ord.totalAmount}\n*Current Status:* 🟡 *${ord.orderStatus}*\n*Monogram Printed:* "${ord.monogramText || 'N/A'}"\n\n📊 *STATUS TIMELINE TABLE:*\n1. Order Placed: ✅\n2. Proof Approved: ${ord.orderStatus !== 'Placed' ? '✅' : '⏳ Pending'}\n3. Foil Printing: ${['Bottle Printing', 'Quality Check', 'Out for Delivery', 'Delivered'].includes(ord.orderStatus) ? '✅' : '⏳ Waiting'}\n4. Quality Control: ${['Quality Check', 'Out for Delivery', 'Delivered'].includes(ord.orderStatus) ? '✅' : '⏳ Waiting'}\n5. Out for Delivery: ${['Out for Delivery', 'Delivered'].includes(ord.orderStatus) ? '✅' : '⏳ Waiting'}`;

        await sendInteractiveButtonMessage(
          from,
          defaultBanner,
          orderDetailText,
          [
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' }
          ]
        );
        return;
      }

      // 8. Track Live Shipment (`track_live_xxxx`)
      if (listId.startsWith('track_live_')) {
        const orderId = listId.replace('track_live_', '');
        const ord = await Order.findById(orderId);

        if (!ord) return;

        const trackText = `🚚 *LIVE TRACKING — ORDER #${ord.orderId}*\n\n*Item:* ${ord.productName} (${ord.bottleSize})\n*Current Status:* 🚚 *${ord.orderStatus}*\n*Delivery Address:* ${ord.deliveryAddress}\n\n*Step-by-Step Progress:*\n• Placed: Completed\n• Proof Approval: ${ord.orderStatus !== 'Placed' ? 'Completed' : 'In Progress'}\n• Dispatch: ${ord.orderStatus === 'Out for Delivery' || ord.orderStatus === 'Delivered' ? 'In Transit' : 'Scheduled'}`;

        await sendInteractiveButtonMessage(
          from,
          defaultBanner,
          trackText,
          [
            { id: 'btn_choose_service', title: 'CHOOSE SERVICE' }
          ]
        );
        return;
      }
    }

  } catch (error) {
    console.error('❌ Webhook Handler Error:', error);
  }
});

export default router;
