import React from 'react';
import { motion } from 'framer-motion';

export default function StorySection({ onOpenStudio, onOpenQuote }) {
  return (
    <section id="story" style={{ backgroundColor: 'var(--color-paper)', padding: '100px 0', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '40px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
            Artesanía & Resistencia
          </span>

          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-mid-gray)', marginTop: '8px' }}>
            Engineered for Condensation, Cold Storage & Fine Dining
          </p>
        </motion.div>

        {/* Large Feature Showcase Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="apple-card-gray"
          style={{
            borderRadius: 'var(--radius-cards)',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div>
            <span className="apple-badge-ember" style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
              MATTE BLACK VIP EDITION — SPOT UV STAMP
            </span>

            <h3 style={{ fontSize: '36px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '16px', lineHeight: 1.15 }}>
              Hand-Stamped Waterproof Vinyl & 24K Embossed Foil
            </h3>

            <p style={{ fontSize: '17px', color: 'var(--color-mid-gray)', lineHeight: 1.47, marginBottom: '28px' }}>
              Our bespoke labels are crafted from industrial-grade waterproof vinyl, coated in velvet-matte finishes and foil-stamped to withstand ice buckets, condensation, and high-pressure refrigeration without peeling or smudging.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-pill-primary" onClick={onOpenStudio}>
                Personalizar botella
              </button>
              <a href="#quote" className="link-arrow" onClick={(e) => { e.preventDefault(); onOpenQuote(); }}>
                Solicitar muestra gratuita ›
              </a>
            </div>
          </div>

          <div style={{
            height: '360px',
            borderRadius: 'var(--radius-productimages)',
            backgroundColor: 'var(--color-paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '24px'
          }}>
            <img
              src="https://res.cloudinary.com/zavohueh/image/upload/v1787627493/iris_premium_bottles/iris_matte_black.jpg"
              alt="Iris VIP Matte Black Water Bottle"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
