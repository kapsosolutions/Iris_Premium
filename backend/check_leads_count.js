import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './models/Lead.js';

dotenv.config();

async function checkLeads() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const leads = await Lead.find();
    console.log(`📊 Actual Lead Count in MongoDB: ${leads.length}`);
    leads.forEach((ld, idx) => {
      console.log(`${idx + 1}. Name: ${ld.name} | Phone: +${ld.phone} | Last Active: ${ld.lastActive}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLeads();
