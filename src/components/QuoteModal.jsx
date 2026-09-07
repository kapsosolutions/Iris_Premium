import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function QuoteModal({ isOpen, onClose, prefillData }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    eventType: 'Hotel / Resort',
    quantity: '250',
    bottleType: '750ml Heavy Glass Reserve',
    labelFinish: '24K Embossed Gold Foil',
    eventDate: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        bottleType: prefillData.bottleStyle || prev.bottleType,
        labelFinish: prefillData.labelFinish || prev.labelFinish,
        quantity: prefillData.quantity ? String(prefillData.quantity) : prev.quantity,
        organization: prefillData.brandTitle || prev.organization
      }));
    }
  }, [prefillData]);

  // Lock body scroll and pause Lenis smooth scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#035542', '#56dddb', '#f9e9a9', '#2b7bb9']
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div 
      data-lenis-prevent
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        data-lenis-prevent
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid var(--color-charcoal-press)',
          borderRadius: '4px',
          maxWidth: '650px',
          width: '100%',
          padding: '30px',
          position: 'relative',
          margin: 'auto'
        }}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '16px',
            fontWeight: '500',
            color: 'var(--color-charcoal-press)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          [✕] CLOSE
        </button>

        {!submitted ? (
          <>
            <span className="category-tag">IRIS PREMIUM CONCIERGE</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-charcoal-press)', textTransform: 'uppercase', margin: '4px 0 10px' }}>
              REQUEST BESPOKE QUOTE & SAMPLE KIT
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-charcoal-press)', marginBottom: '24px' }}>
              Fill in your event details below to receive an instant formal PDF quote and complimentary physical sample kit containing our gold foil and waterproof vinyl label samples.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    YOUR FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria Sterling"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    BUSINESS / EVENT EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="victoria@luxuryresort.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    ORGANIZATION / BRAND NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Hyatt / Forbes Summit"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    EVENT TYPE
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px', backgroundColor: '#ffffff' }}
                  >
                    <option value="Hotel / Resort">Hotel / Resort Amenities</option>
                    <option value="Luxury Wedding">Luxury Wedding / Gala</option>
                    <option value="Corporate Summit">Corporate Summit / VIP Event</option>
                    <option value="Private Aviation">Private Aviation / Yachting</option>
                    <option value="Fine Dining">Fine Dining Restaurant</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    QUANTITY
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    BOTTLE VESSEL
                  </label>
                  <input
                    type="text"
                    value={formData.bottleType}
                    onChange={(e) => setFormData({ ...formData, bottleType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                    LABEL FINISH
                  </label>
                  <input
                    type="text"
                    value={formData.labelFinish}
                    onChange={(e) => setFormData({ ...formData, labelFinish: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '4px' }}>
                  ADDITIONAL SPECIFICATIONS / SPECIAL INSTRUCTIONS
                </label>
                <textarea
                  rows="3"
                  placeholder="Need custom monograms, gold foil embossing, or rush 48-hour delivery? Let us know."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--color-charcoal-press)', borderRadius: '4px', fontFamily: 'var(--font-work-sans)' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-pill" style={{ marginTop: '10px', padding: '16px 24px', justifyContent: 'center' }}>
                SUBMIT QUOTE & REQUEST SAMPLE KIT &rarr;
              </button>

            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>💧</div>
            <span className="category-tag" style={{ justifyContent: 'center' }}>CONFIRMATION #IR-{Math.floor(100000 + Math.random() * 900000)}</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-forest-heritage)', textTransform: 'uppercase', margin: '10px 0' }}>
              SAMPLE KIT & QUOTE DISPATCHED!
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-charcoal-press)', maxWidth: '480px', margin: '0 auto 24px' }}>
              Thank you, <strong>{formData.fullName}</strong>. Your formal price quote and custom sample box are being prepared by our concierge team. Check your inbox (<strong>{formData.email}</strong>) for your PDF digital proof.
            </p>
            <button className="btn-outlined" onClick={handleReset}>
              RETURN TO WEBSITE &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
