import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const TOKEN = process.env.META_ACCESS_TOKEN;
const WABA_ID = process.env.WABA_ID || process.env.META_WABA_ID;

async function publishCheckoutFlow() {
  try {
    let flowId = process.env.META_FLOW_CHECKOUT_ID;

    if (!flowId) {
      console.log('\n==========================================');
      console.log('1. Creating Flow 3 (Order Checkout Flow) in Meta WABA...');
      console.log(`WABA ID: ${WABA_ID}`);
      console.log('==========================================');

      const createRes = await axios.post(`https://graph.facebook.com/v21.0/${WABA_ID}/flows`, {
        name: `Iris Premium - Order Checkout Flow`,
        categories: ['OTHER']
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      flowId = createRes.data.id;
      console.log(`✅ Flow 3 Created! ID: ${flowId}`);

      // Save to .env
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('META_FLOW_CHECKOUT_ID=')) {
        envContent = envContent.replace(/META_FLOW_CHECKOUT_ID=.*/g, `META_FLOW_CHECKOUT_ID=${flowId}`);
      } else {
        envContent += `\nMETA_FLOW_CHECKOUT_ID=${flowId}\n`;
      }
      fs.writeFileSync(envPath, envContent);
      process.env.META_FLOW_CHECKOUT_ID = flowId;
      console.log(`📝 Saved META_FLOW_CHECKOUT_ID=${flowId} in .env!`);
    } else {
      console.log(`Flow 3 ID found in .env: ${flowId}`);
    }

    // Configure Endpoint URI on Meta Flow
    const endpointUri = `${process.env.PUBLIC_SERVER_URL || 'https://e5a9-2409-40f0-5052-f94a-dcd3-d3ca-9fc7-2ad5.ngrok-free.app'}/api/whatsapp/flow-endpoint`;
    console.log(`\nSetting endpoint_uri: ${endpointUri} on Flow ID: ${flowId}...`);
    try {
      await axios.post(`https://graph.facebook.com/v21.0/${flowId}`, {
        endpoint_uri: endpointUri
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      console.log('✅ Endpoint URI configured!');
    } catch (e) {
      console.warn('Notice setting endpoint_uri:', e?.response?.data || e.message);
    }

    // Upload Flow JSON
    const flowPath = path.join(process.cwd(), 'flows', 'iris_order_checkout_flow.json');
    const flowObj = JSON.parse(fs.readFileSync(flowPath, 'utf8'));

    const form = new FormData();
    form.append('file', Buffer.from(JSON.stringify(flowObj)), { filename: 'flow.json', contentType: 'application/json' });
    form.append('name', 'flow.json');
    form.append('asset_type', 'FLOW_JSON');

    console.log(`\nUploading Flow 3 JSON asset to Meta Graph API for Flow ID: ${flowId}...`);
    await axios.post(`https://graph.facebook.com/v21.0/${flowId}/assets`, form, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, ...form.getHeaders() }
    });
    console.log('✅ Flow 3 Asset Uploaded Successfully!');

    console.log(`\nPublishing Flow 3 in Meta WABA...`);
    await axios.post(`https://graph.facebook.com/v21.0/${flowId}/publish`, {}, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('🎉 SUCCESS! Flow 3 (Order Checkout Flow) Published Live!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error publishing Flow 3:', err?.response?.data || err.message);
    process.exit(1);
  }
}

publishCheckoutFlow();
