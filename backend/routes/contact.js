import express from 'express';
import ContactSettings from '../models/ContactSettings.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/** GET /api/contact — Public route to fetch contact settings */
router.get('/', async (req, res) => {
  try {
    let contact = await ContactSettings.findOne();
    if (!contact) {
      contact = await ContactSettings.create({
        officeAddress: 'Iris Premium Bottling Plant, 100 Alpine Spring Way, Nellore, Andhra Pradesh',
        phoneNumbers: ['+91 98765 43210', '+91 98765 43211'],
        whatsappNumber: '+91 98765 43210',
        email: 'concierge@irispremium.com',
        googleMapsUrl: 'https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a4cf3007401bc1f:0x7a372ed8b7f3ef23!8m2!3d14.3879365!4d79.9383584!16s%2Fg%2F11z8ncf7r7'
      });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** PUT /api/contact — Admin route to update contact settings */
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    let contact = await ContactSettings.findOne();
    if (contact) {
      contact = await ContactSettings.findByIdAndUpdate(contact._id, req.body, { new: true });
    } else {
      contact = await ContactSettings.create(req.body);
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
