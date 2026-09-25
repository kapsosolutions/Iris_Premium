import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection({ onOpenQuote, onOpenStudio }) {
  return (
    <section id="about" className="about-section-container">
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
        
        {/* About Copy Container floating over background image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="about-copy-card"
          style={{
            maxWidth: '520px',
            boxShadow: 'none'
          }}
        >
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '10px', fontSize: 'clamp(11px, 2.5vw, 13px)' }}>
            ABOUT IRIS PREMIUM BOTTLING CO. • ESTD 2026
          </span>

          <h2 className="section-title" style={{ marginBottom: '18px', lineHeight: 1.15 }}>
            High-Quality Customized Bottled Water in Nellore
          </h2>

          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-primary-ink)', lineHeight: 1.6, marginBottom: '16px' }}>
            Founded in <strong>2026</strong> by <strong>Ramesh P</strong>, <strong>Iris Premium</strong> produces high-quality customized water bottles for premier hotels, luxury weddings, corporate summits, and grand celebrations across Nellore and South India.
          </p>

          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-primary-ink)', lineHeight: 1.6, marginBottom: '28px' }}>
            We are <strong>FSSAI Certified</strong> and committed to using highest-grade crystal bottles paired with pure, untouched artesian spring water (pH 7.8). Every bottle features a custom <strong>QR Code printed on the back side</strong> for instant authenticity verification and 24/7 dedicated customer support.
          </p>

          {/* 4 Feature Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(14px, 3vw, 24px)',
            borderTop: '1px solid var(--color-hairline)',
            paddingTop: '20px'
          }}>
            <div>
              <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em', lineHeight: 1.2 }}>FSSAI Certified</span>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: 4 }}>100% Food Safety & Quality</span>
            </div>
            <div>
              <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Back QR Code</span>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: 4 }}>Instant Support & Proof</span>
            </div>
            <div>
              <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em', lineHeight: 1.2 }}>pH 7.8 Water</span>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: 4 }}>Naturally Alkaline Spring</span>
            </div>
            <div>
              <span style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Founder</span>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500, display: 'block', marginTop: 4 }}>Ramesh P (Estd 2026)</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
