import React from 'react';

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/919876543210?text=Hello%20Iris%20Premium!%20I%20would%20like%20to%20inquire%20about%20customized%20water%20bottle%20labels.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with Iris Concierge on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: '#25D366',
        color: '#ffffff',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.45)',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
        cursor: 'pointer',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffffff">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 4.992l-1.416 5.17 5.291-1.387c1.458.796 3.097 1.216 4.777 1.217h.005c5.503 0 9.987-4.478 9.988-9.984 0-2.668-1.039-5.176-2.926-7.062a9.923 9.923 0 0 0-7.061-2.931zm.005 1.666c4.586 0 8.321 3.731 8.322 8.318 0 2.224-.866 4.314-2.438 5.885-1.572 1.57-3.664 2.435-5.888 2.435h-.004c-1.453 0-2.884-.39-4.137-1.127l-.297-.176-3.078.807.821-3.003-.194-.308a8.272 8.272 0 0 1-1.27-4.515c.002-4.587 3.737-8.318 8.324-8.318zm-4.18 4.382c-.126 0-.327.047-.498.234-.171.187-.655.64-.655 1.562 0 .921.67 1.811.763 1.936.094.125 1.32 2.016 3.2 2.827.447.193.796.308 1.069.395.449.143.857.123 1.18.075.36-.054 1.107-.452 1.263-.89.156-.437.156-.811.109-.89-.047-.078-.172-.125-.36-.218s-1.107-.546-1.279-.608c-.172-.063-.297-.094-.422.094s-.484.608-.593.733c-.109.125-.219.141-.406.047-.187-.094-.791-.291-1.507-.93-.557-.497-.934-1.111-1.043-1.298-.109-.187-.012-.288.082-.381.084-.083.187-.218.281-.327.094-.109.125-.187.187-.312.063-.125.031-.234-.016-.327s-.422-1.016-.578-1.391c-.152-.365-.307-.316-.422-.321l-.36-.007z"/>
      </svg>
    </a>
  );
}
