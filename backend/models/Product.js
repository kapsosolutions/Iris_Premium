import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  labelFinish: { type: String, default: '24K Embossed Gold Foil' },
  price: { type: Number, required: true },
  mainImage: { type: String },
  galleryImages: [{ type: String }]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Bottled Water' },
  categories: [{ type: String }],
  badge: { type: String, default: 'BESPOKE BOTTLE' },
  bottleQuantity: { type: Number, default: 750 },
  bottleUnit: { type: String, default: 'ml' },
  bottleSize: { type: String, default: '750 ml' },
  packSizes: { type: [Number], default: [50, 100, 250, 500, 1000] },
  retailerId: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  mainImage: { type: String, required: true },
  galleryImages: [{ type: String }],
  variants: [variantSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
