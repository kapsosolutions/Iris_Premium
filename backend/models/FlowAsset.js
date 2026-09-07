import mongoose from 'mongoose';

const flowAssetSchema = new mongoose.Schema({
  assetKey: { type: String, required: true, unique: true },
  title: { type: String },
  imageUrl: { type: String, required: true },
  textContent: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('FlowAsset', flowAssetSchema);
