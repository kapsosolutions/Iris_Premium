import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const GRAPH_URL = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
const TOKEN = process.env.META_ACCESS_TOKEN;

async function sendTemplate() {
  const recipient = '918106811285';
  console.log(`📱 Sending Meta "hello_world" Template to +${recipient}...`);

  try {
    const res = await axios.post(
      GRAPH_URL,
      {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template Message API Response:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('❌ Template Send Error:', error?.response?.data || error.message);
  }
}

sendTemplate();
