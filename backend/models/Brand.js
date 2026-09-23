import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model('Brand', brandSchema);
