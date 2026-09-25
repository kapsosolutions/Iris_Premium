import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    key: { type: String, index: true, sparse: true },
    name: { type: String, index: true },
    title: { type: String, required: true },
    channel: { type: String, enum: ['b2b', 'b2c', 'both'], default: 'b2c' },
    language: { type: String, default: 'en_US' },
    category: { type: String, default: 'MARKETING' }, // MARKETING | UTILITY | AUTHENTICATION
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'IN_APPEAL'],
      default: 'DRAFT'
    },
    rejectedReason: { type: String, default: '' },
    body: { type: String, default: '' },
    footer: { type: String, default: '' },
    headerType: { type: String, enum: ['none', 'text', 'image', 'video', 'document'], default: 'none' },
    headerText: { type: String, default: '' },
    headerUrl: { type: String, default: '' },
    buttons: [
      {
        type: { type: String, enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'], default: 'QUICK_REPLY' },
        kind: { type: String, enum: ['reply', 'url'], default: 'reply' },
        text: String,
        url: String,
        phone_number: String,
        payload: String,
        _id: false
      }
    ],
    metaId: { type: String, default: '', index: true },
    metaTemplateName: { type: String, default: '' },
    metaStatus: { type: String, default: '' },
    components: { type: Object },
    lastSyncedAt: { type: Date },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);
