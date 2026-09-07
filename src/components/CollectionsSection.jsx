import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollectionsSection({ onOpenStudio, onOpenQuote }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setDbProducts(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', name: 'Todas las colecciones' },
    { id: 'hospitality', name: 'Hoteles de Lujo' },
    { id: 'weddings', name: 'Bodas Reales' },
    { id: 'corporate', name: 'Eventos VIP & Galas' },
    { id: 'aviation', name: 'Aviación Privada' }
  ];

  const defaultItems = [
    {
      id: 'd1',
      category: 'hospitality',
      name: '750ml Glass Reserve',
      badge: 'NUEVO',
      description: 'Embossed gold foil branding for 5-star premier rooms and VIP suites.',
      mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_reserve.jpg',
      price: 95
    },
    {
      id: 'd2',
      category: 'weddings',
      name: 'Rose Gold Monogram Glass',
      badge: 'DESTINATION WEDDINGS',
      description: 'Personalized initials and date stamping with metallic rose gold foil.',
      mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_wedding.jpg',
      price: 85
    },
    {
      id: 'd3',
      category: 'corporate',
      name: 'Dark Teal & Silver Executive',
      badge: 'GALAS & SUMMITS',
      description: 'Waterproof matte vinyl with metallic chrome silver logo embossing.',
      mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1/iris_premium/iris_corporate.jpg',
      price: 45
    },
    {
      id: 'd4',
      category: 'aviation',
      name: 'Matte Black VIP Edition',
      badge: 'EXECUTIVE AVIATION',
      description: 'Spot UV gloss embossed printing on soft-touch velvet black vessel.',
      mainImage: 'https://res.cloudinary.com/zavohueh/image/upload/v1787627493/iris_premium_bottles/iris_matte_black.jpg',
      price: 75
    }
  ];

  const displayList = dbProducts.length > 0 ? dbProducts : defaultItems;

  const filteredItems = activeCategory === 'all' 
    ? displayList 
    : displayList.filter(i => (i.category || '').toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <section id="collections" style={{ backgroundColor: 'var(--color-canvas)', padding: '100px 0', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'inline-block', marginBottom: '8px' }}>
            Catálogo completo
          </span>

        </motion.div>

        {/* Apple Pill Category Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '50px'
        }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                fontFamily: 'var(--font-sf-pro-text)',
                fontSize: '15px',
                fontWeight: activeCategory === c.id ? 500 : 400,
                color: activeCategory === c.id ? '#ffffff' : 'var(--color-primary-ink)',
                backgroundColor: activeCategory === c.id ? 'var(--color-primary-ink)' : 'var(--color-paper)',
                border: activeCategory === c.id ? 'none' : '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-smallbuttons)',
                padding: '9px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '28px'
        }}>
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div 
                key={item._id || item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="apple-card"
                style={{
                  backgroundColor: 'var(--color-paper)',
                  borderRadius: 'var(--radius-cards)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: 'var(--radius-productimages)',
                    backgroundColor: 'var(--color-canvas)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <img
                      src={item.mainImage || item.image}
                      alt={item.name || item.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <span className="apple-badge-ember" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                    {item.badge || item.tag || 'IRIS PREMIUM'}
                  </span>

                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '6px', lineHeight: 1.25 }}>
                    {item.name || item.title}
                  </h3>

                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                    ₹{item.price} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-mid-gray)' }}>/ botella</span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--color-mid-gray)', lineHeight: 1.45, marginBottom: '20px' }}>
                    {item.description || item.caption}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-hairline)' }}>
                  <button
                    className="btn-pill-primary"
                    onClick={onOpenStudio}
                    style={{ padding: '7px 16px', fontSize: '13px' }}
                  >
                    Personalizar
                  </button>
                  <button
                    className="btn-pill-ghost"
                    onClick={onOpenQuote}
                    style={{ padding: '7px 14px', fontSize: '13px', borderWidth: '1px' }}
                  >
                    Presupuesto
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
