import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ onOpenStudio, onOpenQuote }) {
  const products = [
    {
      id: 'reserve-750',
      title: '750ml Heavy Glass Reserve',
      category: 'Fine Dining & Hospitality',
      caption: 'Flint heavy crystal glass with 24K gold foil waterproof label for premier hotels and banquet ice bucket service.',
      image: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
      badge: 'NUEVO',
      price: 'Desde ₹95'
    },
    {
      id: 'wedding-monogram',
      title: '500ml Monogram Wedding Glass',
      category: 'Luxury Weddings & Galas',
      caption: 'Custom rose gold & silver monogram embossed labels for royal reception tables. Zero peeling after 48h in ice.',
      image: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_wedding.jpg',
      badge: 'EDICIÓN ESPECIAL',
      price: 'Desde ₹85'
    },
    {
      id: 'corporate-silver',
      title: '330ml VIP Matte Black Label',
      category: 'Private Aviation & Galas',
      caption: 'Sleek matte black tactile finish bottle with metallic gold foil typography for executive suites and private jets.',
      image: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627493/iris_premium_bottles/iris_matte_black.jpg',
      badge: 'EXECUTIVE VIP',
      price: 'Desde ₹75'
    }
  ];

  return (
    <section id="showcase" style={{ backgroundColor: 'var(--color-canvas)', padding: '80px 0 100px', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Intro Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 60px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'inline-block', marginBottom: '12px' }}>
            Nuevo — Bespoke Bottling & Foil Craft
          </span>





          <p style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-mid-gray)',
            lineHeight: 1.47,
            maxWidth: '680px',
            margin: '0 auto 32px'
          }}>
            Massive typographic presence, waterproof vinyl foil labels, and untouched spring water (pH 7.8) for 5-star hotels, luxury weddings, and VIP galas.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button className="btn-pill-primary" onClick={onOpenStudio}>
              Comprar / Custom
            </button>
            <a href="#collections" className="link-arrow" onClick={(e) => { e.preventDefault(); onOpenQuote(); }}>
              Más información sobre muestras ›
            </a>
          </div>
        </motion.div>

        {/* Apple 3-Card Showcase Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {products.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="apple-card"
              style={{
                backgroundColor: 'var(--color-paper)',
                borderRadius: 'var(--radius-cards)',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div>
                <span className="apple-badge-ember" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                  {item.badge}
                </span>

                <h3 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px', lineHeight: 1.2 }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '15px', color: 'var(--color-mid-gray)', lineHeight: 1.45, marginBottom: '20px' }}>
                  {item.caption}
                </p>

                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '24px' }}>
                  {item.price}
                </div>
              </div>

              {/* Product Image Frame */}
              <div>
                <div style={{
                  width: '100%',
                  height: '260px',
                  borderRadius: 'var(--radius-productimages)',
                  backgroundColor: 'var(--color-canvas)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    className="btn-pill-primary"
                    onClick={onOpenStudio}
                    style={{ padding: '8px 18px', fontSize: '14px' }}
                  >
                    Personalizar
                  </button>
                  <a href="#about" className="link-arrow" style={{ fontSize: '14px' }}>
                    Ver detalles ›
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
