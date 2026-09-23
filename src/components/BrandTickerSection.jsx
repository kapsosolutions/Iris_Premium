import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const defaultBrands = [
  { _id: '1', name: 'Mahindra', imageUrl: '/uploads/brands/1.png' },
  { _id: '2', name: 'HR Restaurant', imageUrl: '/uploads/brands/2.png' },
  { _id: '3', name: 'SSA Biriyani', imageUrl: '/uploads/brands/3.png' },
  { _id: '4', name: 'Hotel Riyaz Family Restaurant', imageUrl: '/uploads/brands/4.png' },
  { _id: '5', name: 'Barkaas Arabic Restaurant', imageUrl: '/uploads/brands/5.png' },
  { _id: '6', name: 'Ford', imageUrl: '/uploads/brands/6.png' },
  { _id: '7', name: 'Sairam Mallareddy Family Dhaba', imageUrl: '/uploads/brands/7.png' },
  { _id: '8', name: 'Royalaseema Restaurant', imageUrl: '/uploads/brands/8.png' },
  { _id: '9', name: 'Nellore Spice Multicuisine', imageUrl: '/uploads/brands/9.png' },
  { _id: '10', name: 'Sri Simhapuri Glass & Plywoods', imageUrl: '/uploads/brands/10.png' }
];

export default function BrandTickerSection() {
  const [brands, setBrands] = useState(defaultBrands);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBrands(data.data);
        }
      })
      .catch(() => {
        // Fallback to defaultBrands on network or local dev mismatch
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Split or offset brands into two lively rows
  const row1List = brands;
  const row2List = brands.length > 5
    ? [...brands.slice(Math.ceil(brands.length / 2)), ...brands.slice(0, Math.ceil(brands.length / 2))]
    : brands;

  // Tripled/Quadrupled lists for seamless infinite loop
  const row1Doubled = [...row1List, ...row1List, ...row1List, ...row1List];
  const row2Doubled = [...row2List, ...row2List, ...row2List, ...row2List];

  return (
    <section style={{
      backgroundColor: 'rgb(253, 253, 253)',
      padding: '42px 0 48px',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      borderTop: '1px solid rgba(0, 0, 0, 0.04)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
      boxShadow: 'none'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px 26px', textAlign: 'center' }}>
        <span className="apple-badge-ember" style={{ display: 'inline-block', letterSpacing: '0.08em' }}>
          TRUSTED BY PREMIER CLIENTS & BRANDS
        </span>
      </div>

      {/* Row 1: Left to Right Smooth Marquee */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%', marginBottom: '22px', position: 'relative' }}>
        {/* Left Fade Gradient Mask */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '110px',
          background: 'linear-gradient(to right, rgb(253, 253, 253), rgba(253, 253, 253, 0))',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        {/* Right Fade Gradient Mask */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '110px',
          background: 'linear-gradient(to left, rgb(253, 253, 253), rgba(253, 253, 253, 0))',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        <motion.div
          animate={{ x: ['-50%', '0%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 32,
            ease: 'linear'
          }}
          style={{ display: 'flex', gap: '48px', whiteSpace: 'nowrap', alignItems: 'center' }}
        >
          {row1Doubled.map((item, idx) => (
            <div
              key={`row1-${item._id || idx}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '4px 10px',
                flexShrink: 0,
                transition: 'transform 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                style={{
                  maxHeight: '62px',
                  maxWidth: '160px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))'
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 2: Right to Left Smooth Marquee */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%', position: 'relative' }}>
        {/* Left Fade Gradient Mask */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '110px',
          background: 'linear-gradient(to right, rgb(253, 253, 253), rgba(253, 253, 253, 0))',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
        {/* Right Fade Gradient Mask */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '110px',
          background: 'linear-gradient(to left, rgb(253, 253, 253), rgba(253, 253, 253, 0))',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 32,
            ease: 'linear'
          }}
          style={{ display: 'flex', gap: '48px', whiteSpace: 'nowrap', alignItems: 'center' }}
        >
          {row2Doubled.map((item, idx) => (
            <div
              key={`row2-${item._id || idx}-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '4px 10px',
                flexShrink: 0,
                transition: 'transform 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                style={{
                  maxHeight: '62px',
                  maxWidth: '160px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))'
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
