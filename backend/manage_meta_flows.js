import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WABA_ID = process.env.WABA_ID;
const TOKEN = process.env.META_ACCESS_TOKEN;

// Currently active flow IDs in application
const ACTIVE_FLOW_IDS = [
  process.env.META_FLOW_CHOOSE_SERVICE_ID || '1137012078787664',
  process.env.META_FLOW_BOOK_ORDER_ID || '2393197257997865',
  process.env.META_FLOW_MY_ORDERS_ID || '1080099797850675',
  process.env.META_FLOW_TRACK_ORDER_ID || '1420101556708285'
];

async function inspectAndDeprecateUnusedFlows() {
  try {
    const url = `https://graph.facebook.com/v21.0/${WABA_ID}/flows?fields=id,name,status,categories`;
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    const flows = response.data?.data || [];
    console.log(`\n📋 Inspecting Meta WhatsApp Business Account (WABA: ${WABA_ID}):\n`);

    for (const flow of flows) {
      const isActive = ACTIVE_FLOW_IDS.includes(flow.id);
      console.log(`Flow: "${flow.name}" (ID: ${flow.id}) | Status: ${flow.status} | Active in App: ${isActive ? '✅ YES' : '❌ NO (UNUSED)'}`);

      if (!isActive && flow.status === 'PUBLISHED') {
        console.log(`⚠️ Deprecating unused published flow "${flow.name}" (ID: ${flow.id})...`);
        try {
          const depRes = await axios.post(`https://graph.facebook.com/v21.0/${flow.id}/deprecate`, {}, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          console.log(`✅ Successfully deprecated flow "${flow.name}" in Meta!`, depRes.data);
        } catch (depErr) {
          console.error(`❌ Deprecation error for "${flow.name}":`, depErr?.response?.data || depErr.message);
        }
      }
    }

  } catch (err) {
    console.error('❌ Meta Graph API Error:', err?.response?.data || err.message);
  }
}

inspectAndDeprecateUnusedFlows();
