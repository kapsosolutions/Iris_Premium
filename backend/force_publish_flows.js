import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;

async function forcePublishAllFlows() {
  try {
    console.log(`🔍 Inspecting Meta WhatsApp Business Account (WABA: ${WABA_ID})...\n`);

    const listUrl = `https://graph.facebook.com/v21.0/${WABA_ID}/flows?fields=id,name,status,categories,validation_errors,endpoint_uri`;
    const response = await axios.get(listUrl, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    const flows = response.data?.data || [];
    console.log(`Found total ${flows.length} Flow(s):\n`);

    for (const flow of flows) {
      console.log(`--------------------------------------------------`);
      console.log(`Flow Name: "${flow.name}"`);
      console.log(`ID: ${flow.id}`);
      console.log(`Status: ${flow.status}`);
      console.log(`Endpoint URI: ${flow.endpoint_uri || 'None (Navigate Flow)'}`);

      if (flow.status === 'DRAFT') {
        console.log(`\n⚙️ Unsetting endpoint_uri to publish as standalone Navigate Flow...`);
        try {
          await axios.post(`https://graph.facebook.com/v21.0/${flow.id}`, {
            endpoint_uri: ''
          }, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          console.log(`✅ Cleared endpoint_uri for "${flow.name}"`);
        } catch (e) {
          console.warn(`Notice clearing endpoint_uri:`, e?.response?.data || e.message);
        }

        console.log(`\n🚀 Publishing Flow "${flow.name}" (ID: ${flow.id}) to Meta...`);
        try {
          const pubRes = await axios.post(`https://graph.facebook.com/v21.0/${flow.id}/publish`, {}, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          console.log(`🎉 SUCCESS! Flow "${flow.name}" is now PUBLISHED in Meta!`, pubRes.data);
        } catch (pubErr) {
          console.error(`❌ Publish error for "${flow.name}":`, pubErr?.response?.data || pubErr.message);
        }
      } else {
        console.log(`✅ Flow "${flow.name}" is already PUBLISHED.`);
      }
    }

    console.log(`\n--------------------------------------------------`);
    console.log('🎉 Flow inspection and publication process finished!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Meta Graph API Error:', err?.response?.data || err.message);
    process.exit(1);
  }
}

forcePublishAllFlows();
