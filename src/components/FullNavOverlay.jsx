import React, { useEffect } from 'react';

export default function FullNavOverlay({ isOpen, onClose, onOpenStudio, onOpenQuote }) {
  // Lock body scroll and pause Lenis smooth scroll when menu overlay is open
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

  return (
    <div 
      data-lenis-prevent
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'var(--color-cream-white)',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Header Bar in Overlay */}
      <div style={{
        maxWidth: 'var(--page-max-width)',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '30px',
        borderBottom: '1px solid var(--color-charcoal-press)'
      }}>
        <div>
          <img 
            src="/logo.png" 
            alt="Iris Premium Logo" 
            style={{ height: '48px', objectFit: 'contain' }} 
          />
        </div>

        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-work-sans)',
            fontWeight: '500',
            fontSize: '17px',
            color: 'var(--color-forest-heritage)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          CLOSE [✕]
        </button>
      </div>

      {/* Main Navigation Links & Clean Action Buttons */}
      <div style={{
        maxWidth: 'var(--page-max-width)',
        width: '100%',
        margin: '50px auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '50px',
        alignItems: 'start'
      }}>
        {/* Left Column: Navigation Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-forest-heritage)', fontWeight: '500' }}>
            NAVIGATION DIRECTORY
          </span>
          <a href="#showcase" onClick={onClose} style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-charcoal-press)', textTransform: 'uppercase' }}>
            01. Product Showcase
          </a>
          <button onClick={() => { onClose(); onOpenQuote(); }} style={{ textAlign: 'left', fontSize: '32px', fontWeight: '900', color: 'var(--color-forest-heritage)', textTransform: 'uppercase' }}>
            02. Request Custom Quote
          </button>
          <a href="#collections" onClick={onClose} style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-charcoal-press)', textTransform: 'uppercase' }}>
            03. Category Collections
          </a>
          <a href="#about" onClick={onClose} style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-charcoal-press)', textTransform: 'uppercase' }}>
            04. About Iris Premium
          </a>
          <a href="#location" onClick={onClose} style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-charcoal-press)', textTransform: 'uppercase' }}>
            05. Our Plant Location
          </a>
        </div>

        {/* Right Column: Clean Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-forest-heritage)', fontWeight: '500' }}>
            CONCIERGE ACTIONS
          </span>
          
          <button 
            className="btn-outlined" 
            onClick={() => { onClose(); onOpenStudio(); }}
            style={{ padding: '16px 28px', fontSize: '16px', justifyContent: 'center' }}
          >
            DESIGN YOUR LABEL
          </button>

          <button 
            className="btn-pill" 
            onClick={() => { onClose(); onOpenQuote(); }}
            style={{ padding: '16px 28px', fontSize: '16px', justifyContent: 'center' }}
          >
            BOOK / REQUEST QUOTE &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
