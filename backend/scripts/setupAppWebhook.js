import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const APP_ID = process.env.APP_ID || '4564195660518860';
const APP_SECRET = process.env.APP_SECRET || '82c3ba9490a6faca5cf060b1c795a000';
const TOKEN = process.env.META_ACCESS_TOKEN;
const WEBHOOK_URL = 'https://4beb-2409-40f0-540b-3805-9d00-8d54-fa17-f365.ngrok-free.app/api/whatsapp/webhook';
const VERIFY_TOKEN = 'iris_verify_token';
const GRAPH = 'https://graph.facebook.com/v21.0';

async function configureWebhook() {
  console.log(`🔗 Configuring App (${APP_ID}) Webhook Callback URL: ${WEBHOOK_URL}...`);

  const appAccessToken = `${APP_ID}|${APP_SECRET}`;

  try {
    const subRes = await axios.post(
      `${GRAPH}/${APP_ID}/subscriptions`,
      {
        object: 'whatsapp_business_account',
        callback_url: WEBHOOK_URL,
        verify_token: VERIFY_TOKEN,
        fields: ['messages']
      },
      {
        headers: { 'Authorization': `Bearer ${appAccessToken}` }
      }
    );

    console.log('✅ App Webhook Configured Successfully! Response:', subRes.data);
  } catch (err) {
    console.error('⚠️ App Webhook Error:', err?.response?.data || err.message);
  }
}

configureWebhook();
