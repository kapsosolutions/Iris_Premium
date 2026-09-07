import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '..', '.env');
dotenv.config({ path: ENV_PATH });

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1205981962607057';
const TOKEN = process.env.META_ACCESS_TOKEN;
const FLOW_ID = process.env.META_FLOW_ID || '2297701727696287';
const GRAPH = 'https://graph.facebook.com/v21.0';

/** 1. Generate RSA-2048 Key Pair */
function generateKeys() {
  console.log('🔑 Generating RSA-2048 Keypair for WhatsApp Flow Encryption...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const keysDir = path.join(__dirname, '..', 'keys');
  if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

  fs.writeFileSync(path.join(keysDir, 'flow_private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'flow_public.pem'), publicKey);

  console.log('✅ Keys saved to backend/keys/');
  return publicKey;
}

/** 2. Upload Business Public Key to Meta Phone Number */
async function uploadPublicKeyToMeta(publicKey) {
  console.log(`📤 Uploading Public Key to Meta Phone Number ID: ${PHONE_NUMBER_ID}...`);
  try {
    const response = await axios.post(
      `${GRAPH}/${PHONE_NUMBER_ID}/whatsapp_business_encryption`,
      new URLSearchParams({ business_public_key: publicKey }),
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('✅ Meta Public Key Upload Success:', response.data);
  } catch (error) {
    console.error('⚠️ Public Key Upload Warning:', error?.response?.data || error.message);
  }
}

/** 3. Publish Flow on Meta */
async function publishFlow(flowId) {
  console.log(`🚀 Publishing WhatsApp Flow ID ${flowId} on Meta...`);
  try {
    const response = await axios.post(
      `${GRAPH}/${flowId}/publish`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('🎉 Flow Published Successfully on Meta! Response:', response.data);
  } catch (error) {
    console.error('❌ Flow Publish Error:', error?.response?.data || error.message);
  }
}

async function run() {
  const publicKey = generateKeys();
  await uploadPublicKeyToMeta(publicKey);
  await publishFlow(FLOW_ID);
}

run();
