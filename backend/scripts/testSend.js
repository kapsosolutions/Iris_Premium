import { sendTextMessage, sendInteractiveButtonMessage } from '../services/metaService.js';

async function test() {
  const recipient = '918106811285';
  console.log(`Testing WhatsApp message send to +${recipient}...`);

  try {
    const res = await sendInteractiveButtonMessage(
      recipient,
      'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
      '👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling.\n\nClick below to explore our services:',
      [
        { id: 'btn_choose_service', title: 'CHOOSE SERVICE' },
        { id: 'btn_book_order', title: 'BOOK ORDER' }
      ]
    );
    console.log('✅ Meta API Response:', JSON.stringify(res, null, 2));
  } catch (error) {
    console.error('❌ Send Error:', error?.response?.data || error.message);
  }
}

test();
