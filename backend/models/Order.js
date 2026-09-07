import mongoose from 'mongoose';

const trackingStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, default: 'Iris Bottling Facility, Andhra Pradesh' },
  timestamp: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  phoneNumber: { type: String },
  monogramText: { type: String },
  labelDocUrl: { type: String },
  productName: { type: String, required: true },
  bottleSize: { type: String, default: '750ml Heavy Glass Reserve' },
  labelFinish: { type: String, default: '24K Embossed Gold Foil' },
  quantity: { type: Number, required: true, default: 250 },
  unitPrice: { type: Number, required: true, default: 85 },
  totalAmount: { type: Number, required: true },
  pdfInvoiceUrl: { type: String },
  orderStatus: { 
    type: String, 
    enum: ['Placed', 'Proof Approved', 'Bottle Printing', 'Quality Check', 'Out for Delivery', 'Delivered'],
    default: 'Placed' 
  },
  deliveryAddress: { type: String, default: 'Concierge Delivery' },
  trackingSteps: [trackingStepSchema]
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
