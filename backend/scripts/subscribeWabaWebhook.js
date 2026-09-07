import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const WABA_ID = process.env.WABA_ID || '1403552485021692';
const APP_ID = process.env.APP_ID || '4564195660518860';
const TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH = 'https://graph.facebook.com/v21.0';

async function checkAndSubscribe() {
  console.log(`📡 Checking & Subscribing Meta WABA ID (${WABA_ID}) to Webhook events...`);

  // Step 1: Subscribe WABA App to Webhooks
  try {
    const subRes = await axios.post(
      `${GRAPH}/${WABA_ID}/subscribed_apps`,
      {},
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    console.log('✅ WABA Subscribed Apps API Response:', subRes.data);
  } catch (err) {
    console.error('⚠️ WABA Subscribe Apps Error:', err?.response?.data || err.message);
  }

  // Step 2: Get Subscribed Apps to verify
  try {
    const listRes = await axios.get(
      `${GRAPH}/${WABA_ID}/subscribed_apps`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    console.log('📋 Currently Subscribed Apps for WABA:', JSON.stringify(listRes.data, null, 2));
  } catch (err) {
    console.error('⚠️ List Subscribed Apps Error:', err?.response?.data || err.message);
  }
}

checkAndSubscribe();
