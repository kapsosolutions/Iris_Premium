import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/Admin/Desktop/Iris/backend/.env' });

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;

console.log('🔍 Querying Meta WhatsApp Business Account for active & draft Flows...');
console.log(`WABA ID: ${WABA_ID}`);

async function inspectAndCleanFlows() {
  try {
    const url = `https://graph.facebook.com/v21.0/${WABA_ID}/flows?fields=id,name,status,categories,validation_errors`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const flows = response.data?.data || [];
    console.log(`\n📋 Found total ${flows.length} Flow(s) under WABA ${WABA_ID}:\n`);

    flows.forEach((flow, i) => {
      console.log(`${i + 1}. Flow Name: "${flow.name}"`);
      console.log(`   ID: ${flow.id}`);
      console.log(`   Status: ${flow.status}`);
      if (flow.validation_errors && flow.validation_errors.length > 0) {
        console.log(`   Errors: ${JSON.stringify(flow.validation_errors)}`);
      }
      console.log('--------------------------------------------------');
    });

    // Check for draft or unused flows
    const draftFlows = flows.filter(f => f.status === 'DRAFT');
    console.log(`\n📌 Draft Flows count: ${draftFlows.length}`);

    for (const df of draftFlows) {
      console.log(`\n🧹 Deleting unused DRAFT flow: "${df.name}" (ID: ${df.id})...`);
      try {
        const delRes = await axios.delete(`https://graph.facebook.com/v21.0/${df.id}`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        });
        console.log(`✅ Successfully deleted DRAFT flow "${df.name}"!`, delRes.data);
      } catch (delErr) {
        console.error(`❌ Could not delete DRAFT flow "${df.name}":`, delErr?.response?.data || delErr.message);
      }
    }

  } catch (err) {
    console.error('❌ Meta Graph API Query Error:', err?.response?.data || err.message);
  }
}

inspectAndCleanFlows();
