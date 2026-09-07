import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection({ onOpenQuote, onOpenStudio }) {
  return (
    <section id="about" style={{
      backgroundImage: 'url("/about.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      width: '100%',
      padding: '100px 0',
      backgroundColor: '#ffffff',
      boxShadow: 'none'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* About Copy Container floating over background image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: '500px',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '12px' }}>
            ABOUT IRIS PREMIUM BOTTLING CO. • ESTD 2026
          </span>

          <h2 className="section-title" style={{ marginBottom: '20px', lineHeight: 1.15 }}>
            High-Quality Customized Bottled Water in Nellore
          </h2>

          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-primary-ink)', lineHeight: 1.6, marginBottom: '20px' }}>
            Founded in <strong>2026</strong> by <strong>Ramesh P</strong>, <strong>Iris Premium</strong> produces high-quality customized water bottles for premier hotels, luxury weddings, corporate summits, and grand celebrations across Nellore and South India.
          </p>

          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-primary-ink)', lineHeight: 1.6, marginBottom: '32px' }}>
            We are <strong>FSSAI Certified</strong> and committed to using highest-grade crystal bottles paired with pure, untouched artesian spring water (pH 7.8). Every bottle features a custom <strong>QR Code printed on the back side</strong> for instant authenticity verification and 24/7 dedicated customer support.
          </p>

          {/* 4 Feature Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            borderTop: '1px solid var(--color-hairline)',
            paddingTop: '24px'
          }}>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>FSSAI Certified</span>
              <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>100% Food Safety & Quality</span>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>Back QR Code</span>
              <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Instant Support & Proof</span>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>pH 7.8 Water</span>
              <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Naturally Alkaline Spring</span>
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>Founder</span>
              <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Ramesh P (Estd 2026)</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
