import { sendInteractiveButtonMessage } from '../services/metaService.js';

async function sendToUser() {
  const recipient = '918106811285';
  console.log(`🚀 Sending Choose Service Interactive Message to handset: +${recipient}...`);

  const welcomeBanner = 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg';
  const welcomeText = `👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling for 5-star hotels, luxury weddings, VIP galas, and private aviation across India.\n\nClick below to explore our concierge services:`;

  try {
    const response = await sendInteractiveButtonMessage(
      recipient,
      welcomeBanner,
      welcomeText,
      [
        { id: 'btn_choose_service', title: 'CHOOSE SERVICE' },
        { id: 'btn_book_order', title: 'BOOK ORDER' }
      ]
    );

    console.log('✅ Sent successfully to handset! Meta Message ID:', response.messages?.[0]?.id);
  } catch (error) {
    console.error('❌ Error sending to handset:', error?.response?.data || error.message);
  }
}

sendToUser();
