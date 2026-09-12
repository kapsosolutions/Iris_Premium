import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const TOKEN = process.env.META_ACCESS_TOKEN;
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || 'https://iris-premium.onrender.com';
const WEBHOOK_URL = `${PUBLIC_SERVER_URL}/api/whatsapp/webhook`;
const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'iris_verify_token';
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
