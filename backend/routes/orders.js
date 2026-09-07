import express from 'express';
import Order from '../models/Order.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { sendTextMessage, sendInteractiveButtonMessage, sendOrderRequestedNotification } from '../services/metaService.js';
import { generatePDFInvoice } from '../services/pdfInvoiceService.js';

const router = express.Router();

/** GET /api/orders — Admin route to fetch all customer orders */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** GET /api/orders/user/:phone — Fetch user orders by phone */
router.get('/user/:phone', async (req, res) => {
  try {
    const cleanPhone = String(req.params.phone).replace(/\D/g, '');
    const orders = await Order.find({ whatsappNumber: { $regex: cleanPhone } }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/orders/submit-request — Public route for quick order details submission from website */
router.post('/submit-request', async (req, res) => {
  try {
    const { name, whatsappNumber, contactNumber, brandName, logoUrl, purpose, quantity } = req.body;

    if (!name || !whatsappNumber || !brandName || !purpose || !quantity) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const orderId = `IR-${Math.floor(100000 + Math.random() * 900000)}`;
    const parsedQty = parseInt(quantity) || 500;
    const totalAmount = parsedQty * 85;

    const newOrder = new Order({
      orderId,
      customerName: name,
      whatsappNumber,
      contactNumber: contactNumber || whatsappNumber,
      brandName,
      logoUrl: logoUrl || '',
      purpose,
      quantity: parsedQty,
      productName: `${brandName} Custom Bottled Water`,
      totalAmount,
      orderStatus: 'Requested',
      paymentStatus: 'Pending',
      customText: `Purpose: ${purpose} | Brand: ${brandName}`
    });

    await newOrder.save();

    // Trigger WhatsApp notification with banner image & Choose Service CTA button
    try {
      await sendOrderRequestedNotification({
        to: whatsappNumber,
        name,
        brandName,
        purpose,
        quantity: parsedQty,
        contactNumber: contactNumber || whatsappNumber
      });
    } catch (waErr) {
      console.error('WhatsApp order notification warning:', waErr.message);
    }

    res.status(201).json({ success: true, data: newOrder, message: 'Order request submitted successfully!' });
  } catch (error) {
    console.error('Order request submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/** POST /api/orders — Create new order */
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.orderId) {
      orderData.orderId = `IR-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    if (!orderData.totalAmount) {
      orderData.totalAmount = (orderData.quantity || 250) * (orderData.unitPrice || 85);
    }

    const newOrder = new Order(orderData);
    
    // Generate Invoice PDF
    try {
      const pdfUrl = await generatePDFInvoice(newOrder);
      newOrder.pdfInvoiceUrl = pdfUrl;
    } catch (pdfErr) {
      console.error('PDF invoice generation warning:', pdfErr.message);
    }

    await newOrder.save();

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/** PUT /api/orders/:id/status — Admin route to update order status & trigger WhatsApp update */
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { orderStatus, deliveryAddress } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = orderStatus;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;

    // Add tracking step
    order.trackingSteps.push({
      title: `Status updated to ${orderStatus}`,
      location: 'Iris Bottling Facility',
      timestamp: new Date(),
      completed: true
    });

    await order.save();

    // Trigger WhatsApp status update message to client handset
    try {
      const updateMsg = `🔔 *Order Status Update — #${order.orderId}*\n\nYour customized bottle order *#${order.orderId}* status has been updated to: 🟢 *${orderStatus}*\n\nItem: ${order.productName}\nQuantity: ${order.quantity} Bottles`;
      await sendInteractiveButtonMessage(
        order.whatsappNumber,
        'https://res.cloudinary.com/zavohueh/image/upload/v1787890832/iris_order_headers/order_request_header_banner.jpg',
        updateMsg,
        [{ id: 'btn_choose_service', title: 'CHOOSE SERVICE' }]
      );
    } catch (waErr) {
      console.error('WhatsApp status notification warning:', waErr.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
