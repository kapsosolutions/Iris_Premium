import React from 'react';
import { motion } from 'framer-motion';

export default function SpecificationsSection({ onOpenQuote }) {
  return (
    <section id="about" style={{ backgroundColor: 'var(--color-paper)', padding: '100px 0', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '60px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
            Especificaciones Técnicas
          </span>

          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-mid-gray)', marginTop: '8px', maxWidth: '650px' }}>
            Learn about our untouched Alpine artesian spring water and custom foil-stamping technology built for premier hotels and high-end galas.
          </p>
        </motion.div>

        {/* 2-Column Specs Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          
          {/* Left Specs List */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="apple-card-gray"
            style={{ borderRadius: 'var(--radius-cards)', padding: '40px' }}
          >
            <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '20px', lineHeight: 1.2 }}>
              Natural Alpine Spring Water & 24K Hot-Stamped Gold Foil
            </h3>

            <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)', lineHeight: 1.5, marginBottom: '32px' }}>
              Sourced from untouched natural Alpine artesian spring aquifers (pH 7.8 naturally alkaline), every vessel is filled at the spring head to maintain a crisp, silky mineral profile. Our labels are crafted from heavy waterproof vinyl with 24K gold foil stamping that withstands ice buckets without bubbling.
            </p>

            {/* 4 Feature Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              borderTop: '1px solid var(--color-hairline)',
              paddingTop: '24px'
            }}>
              <div>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>pH 7.8</span>
                <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Naturally Alkaline</span>
              </div>
              <div>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>24K Gold</span>
                <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Hot-Stamped Foil</span>
              </div>
              <div>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>100%</span>
                <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Ice-Bucket Waterproof</span>
              </div>
              <div>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary-ink)', display: 'block', letterSpacing: '-0.02em' }}>48 Hours</span>
                <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)', textTransform: 'uppercase', fontWeight: 500 }}>Express Dispatch</span>
              </div>
            </div>
          </motion.div>

          {/* Right Product Image Showcase Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="apple-card-gray"
            style={{
              borderRadius: 'var(--radius-cards)',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '100%',
              height: '320px',
              borderRadius: 'var(--radius-productimages)',
              backgroundColor: 'var(--color-paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <img
                src="https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg"
                alt="Iris Premium Glass Bottle Reserve"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>

            <span className="apple-badge-ember" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              FLAGSHIP GLASS RESERVE
            </span>

            <h4 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
              Alpine Artesian 750ml
            </h4>

            <a href="#quote" className="link-arrow" onClick={(e) => { e.preventDefault(); if (onOpenQuote) onOpenQuote(); }}>
              Solicitar ficha técnica completa ›
            </a>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
