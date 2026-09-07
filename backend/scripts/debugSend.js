import { sendTextMessage, sendInteractiveButtonMessage, sendImageMessage } from '../services/metaService.js';

async function debug() {
  const recipient = '918106811285';
  console.log(`\n==================================================`);
  console.log(`🔍 Testing direct Meta message send to: +${recipient}`);
  console.log(`PHONE_NUMBER_ID: ${process.env.PHONE_NUMBER_ID}`);
  console.log(`WABA_ID: ${process.env.WABA_ID}`);
  console.log(`==================================================\n`);

  try {
    console.log('1. Sending Plain Text Message...');
    const textRes = await sendTextMessage(recipient, '✨ *Iris Premium Bottling Co.*\n\nWelcome! Please reply *HI* to open the Concierge Menu & Bespoke Bottle Customization Flow.');
    console.log('✅ Plain Text Sent! Meta Response:', JSON.stringify(textRes, null, 2));

    console.log('\n2. Sending Interactive Button Message...');
    const buttonRes = await sendInteractiveButtonMessage(
      recipient,
      'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
      '👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nClick below to explore our concierge services:',
      [
        { id: 'btn_choose_service', title: 'CHOOSE SERVICE' },
        { id: 'btn_book_order', title: 'BOOK ORDER' }
      ]
    );
    console.log('✅ Interactive Button Sent! Meta Response:', JSON.stringify(buttonRes, null, 2));

  } catch (error) {
    console.error('❌ Meta Send Error Details:');
    if (error?.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

debug();
