import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: 'WhatsApp User' },
  lastActive: { type: Date, default: Date.now },
  interactionCount: { type: Number, default: 1 },
  lastFlowOption: { type: String, default: 'General Inquiry' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
