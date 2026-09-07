import React, { useState } from 'react';

export default function Footer({ onOpenStudio, onOpenQuote }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const whatsappUrl = "https://wa.me/919876543210?text=Hello%20Iris%20Premium!%20I%20would%20like%20to%20inquire%20about%20customized%20water%20bottle%20labels.";

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleOrderScroll = () => {
    const el = document.getElementById('order-request');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{
      width: '100%',
      backgroundColor: 'rgb(10 10 10 / 52%)',
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      paddingTop: '64px',
      paddingBottom: '40px',
      backgroundImage: 'linear-gradient(rgb(10 10 10 / 0%), rgb(10 10 10 / 0%)), url("/map.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#ffffff',
      position: 'relative'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        
        {/* Top Footer 3-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          
          {/* Column 1: Brand Info & Social Icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <img 
                src="/logo.png" 
                alt="Iris Premium Logo" 
                style={{ height: '48px', objectFit: 'contain', filter: 'brightness(1.15)' }} 
              />
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, maxWidth: '320px' }}>
              High-quality customized bottled water for premier hotels, luxury weddings, corporate summits, and grand celebrations in Nellore & South India. FSSAI Certified.
            </p>

            {/* Official Real Brand Color Social Logos */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {/* Instagram Official Radial Gradient Logo */}
              <a
                href="https://www.instagram.com/iris__premium/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram (@iris__premium)"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(214, 36, 159, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* Facebook Official Blue Logo */}
              <a
                href="https://www.facebook.com/profile.php?id=61574309566587"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Page"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1877F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* YouTube Official Red Logo */}
              <a
                href="https://www.youtube.com/@Iris__premiumm"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube (@Iris__premiumm)"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FF0000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* WhatsApp Official Green Logo */}
              <a
                href="https://wa.me/919632498664"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Concierge"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 4.992l-1.416 5.17 5.291-1.387c1.458.796 3.097 1.216 4.777 1.217h.005c5.503 0 9.987-4.478 9.988-9.984 0-2.668-1.039-5.176-2.926-7.062a9.923 9.923 0 0 0-7.061-2.931zm.005 1.666c4.586 0 8.321 3.731 8.322 8.318 0 2.224-.866 4.314-2.438 5.885-1.572 1.57-3.664 2.435-5.888 2.435h-.004c-1.453 0-2.884-.39-4.137-1.127l-.297-.176-3.078.807.821-3.003-.194-.308a8.272 8.272 0 0 1-1.27-4.515c.002-4.587 3.737-8.318 8.324-8.318zm-4.18 4.382c-.126 0-.327.047-.498.234-.171.187-.655.64-.655 1.562 0 .921.67 1.811.763 1.936.094.125 1.32 2.016 3.2 2.827.447.193.796.308 1.069.395.449.143.857.123 1.18.075.36-.054 1.107-.452 1.263-.89.156-.437.156-.811.109-.89-.047-.078-.172-.125-.36-.218s-1.107-.546-1.279-.608c-.172-.063-.297-.094-.422.094s-.484.608-.593.733c-.109.125-.219.141-.406.047-.187-.094-.791-.291-1.507-.93-.557-.497-.934-1.111-1.043-1.298-.109-.187-.012-.288.082-.381.084-.083.187-.218.281-.327.094-.109.125-.187.187-.312.063-.125.031-.234-.016-.327s-.422-1.016-.578-1.391c-.152-.365-.307-.316-.422-.321l-.36-.007z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links & Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffb800' }}>
              CONCIERGE & SERVICES
            </span>
            <button onClick={handleOrderScroll} style={{ textAlign: 'left', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              Book Order Request
            </button>
            <a href="#about" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}>
              About Iris Premium (Ramesh P, 2026)
            </a>
            <a href="#location" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}>
              Plant Location & Google Reviews
            </a>
            <a href="#about" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'none' }}>
              FSSAI Quality & Back QR Code Proof
            </a>

            <div style={{ marginTop: '8px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  backgroundColor: '#25D366',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Chat on WhatsApp ›
              </a>
            </div>
          </div>

          {/* Column 3: Apple Style Newsletter Signup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffb800' }}>
              CONCIERGE NEWSLETTER
            </span>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
              Subscribe to receive seasonal label foil releases, exclusive hotel partnership offers, and design trends.
            </p>

            {subscribed ? (
              <div style={{ fontSize: '14px', color: '#25D366', fontWeight: 500, padding: '10px 0' }}>
                ✓ Thank you! You are subscribed to Iris updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="concierge@hotel.com"
                  required
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-pill-primary"
                  style={{ padding: '10px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Legal Copyright Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '28px'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.02em' }}>
            © {new Date().getFullYear()} IRIS PREMIUM BOTTLING CO. (ESTD 2026). ALL RIGHTS RESERVED.
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)' }}>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>FSSAI Certifications</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
