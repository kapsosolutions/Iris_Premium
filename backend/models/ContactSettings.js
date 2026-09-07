import mongoose from 'mongoose';

const contactSettingsSchema = new mongoose.Schema({
  officeAddress: { type: String, default: 'Iris Premium Bottling Plant, 100 Alpine Spring Way, Nellore, Andhra Pradesh' },
  phoneNumbers: [{ type: String }],
  whatsappNumber: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'concierge@irispremium.com' },
  googleMapsUrl: { type: String, default: 'https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a4cf3007401bc1f:0x7a372ed8b7f3ef23!8m2!3d14.3879365!4d79.9383584!16s%2Fg%2F11z8ncf7r7' },
  coordinates: {
    lat: { type: Number, default: 14.3879365 },
    lng: { type: Number, default: 79.9383584 }
  }
}, { timestamps: true });

export default mongoose.model('ContactSettings', contactSettingsSchema);
