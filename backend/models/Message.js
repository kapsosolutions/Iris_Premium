import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  messageType: { type: String, default: 'text' }, // text, image, document, interactive, flow
  body: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  reaction: { type: String, default: '' },
  status: { type: String, default: 'delivered' }, // sent, delivered, read
  metaMessageId: { type: String }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
