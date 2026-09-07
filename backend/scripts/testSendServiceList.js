import { sendInteractiveListMessage, sendInteractiveButtonMessage, sendTextMessage } from '../services/metaService.js';

async function testList() {
  const recipient = '918106811285';
  console.log(`📱 Sending Concierge Service Menu to handset +${recipient}...`);

  const welcomeBanner = 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg';
  const listBodyText = `👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling for premier hotels, luxury weddings, and VIP galas.\n\nPlease select a service below to proceed:`;

  const listSections = [
    {
      title: 'IRIS CONCIERGE SERVICES',
      rows: [
        {
          id: 'service_book_order',
          title: '📦 Book Order',
          description: 'Browse bottle sizes, variants & custom gold foil labels'
        },
        {
          id: 'service_my_orders',
          title: '📋 My Orders',
          description: 'View your order history & custom label proof status'
        },
        {
          id: 'service_track_order',
          title: '🚚 Track Order',
          description: 'Live dispatch progress & delivery timeline'
        },
        {
          id: 'service_contact_us',
          title: '📞 Contact Us',
          description: 'Plant address, concierge phone & Google Maps'
        }
      ]
    }
  ];

  try {
    const res = await sendInteractiveListMessage(
      recipient,
      null, // Header image optional for max compatibility
      listBodyText,
      'Choose Service',
      listSections
    );

    console.log('✅ List Message Delivered! Meta Response ID:', res.messages?.[0]?.id);
  } catch (error) {
    console.error('❌ Error sending List Message:', error?.response?.data || error.message);
  }
}

testList();
