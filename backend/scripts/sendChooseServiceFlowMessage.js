import { sendInteractiveFlowMessage } from '../services/metaService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function sendFlow() {
  const recipient = '918106811285';
  const flowId = process.env.META_FLOW_CHOOSE_SERVICE_ID || '2076845906260709';

  console.log(`🚀 Sending Meta Dropdown FLOW CTA Message (Flow ID: ${flowId}) to handset +${recipient}...`);

  const welcomeBanner = 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg';
  const welcomeText = `👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling.\n\nClick the button below to open our interactive Concierge Dropdown Flow:`;

  try {
    const response = await sendInteractiveFlowMessage(
      recipient,
      welcomeBanner,
      welcomeText,
      'Choose Service 📋',
      flowId,
      'SERVICE_MENU',
      null
    );

    console.log('✅ Dropdown Flow CTA Message Sent to Handset! Meta Message ID:', response.messages?.[0]?.id);
  } catch (error) {
    console.error('❌ Error sending Flow Message:', error?.response?.data || error.message);
  }
}

sendFlow();
