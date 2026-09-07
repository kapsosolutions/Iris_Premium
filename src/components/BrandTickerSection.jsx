import React from 'react';
import { motion } from 'framer-motion';

export default function BrandTickerSection() {
  // Real SVG Brand Logos (Apple Pure White Background & Scaled Up Sizes)
  const row1Logos = [
    {
      name: 'Canva',
      svg: (
        <svg height="42" viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="21" r="18" fill="#00C4CC"/>
          <text x="20" y="27" fill="#FFFFFF" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Canva</text>
        </svg>
      )
    },
    {
      name: 'Capgemini',
      svg: (
        <svg height="42" viewBox="0 0 170 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="5" y="28" fill="#1D1D1F" fontSize="24" fontWeight="700" fontFamily="sans-serif">Capgemini ♠</text>
        </svg>
      )
    },
    {
      name: 'Cisco',
      svg: (
        <svg height="44" viewBox="0 0 130 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24V14M30 30V10M48 36V4M66 36V4M84 30V10M102 24V14" stroke="#0071E3" strokeWidth="5" strokeLinecap="round"/>
          <text x="57" y="44" fill="#1D1D1F" fontSize="15" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">CISCO</text>
        </svg>
      )
    },
    {
      name: 'Experian',
      svg: (
        <svg height="42" viewBox="0 0 150 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="10" width="8" height="8" fill="#0071E3"/>
          <rect x="12" y="2" width="8" height="8" fill="#0071E3"/>
          <rect x="12" y="18" width="8" height="8" fill="#0071E3"/>
          <text x="30" y="28" fill="#1D1D1F" fontSize="23" fontWeight="700" fontFamily="sans-serif">experian</text>
        </svg>
      )
    },
    {
      name: 'ExpressVPN',
      svg: (
        <svg height="42" viewBox="0 0 175 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10C5 10 22 21 5 32" stroke="#FF5A5F" strokeWidth="6" strokeLinecap="round"/>
          <text x="30" y="28" fill="#1D1D1F" fontSize="22" fontWeight="700" fontFamily="sans-serif">ExpressVPN</text>
        </svg>
      )
    },
    {
      name: 'Rakuten',
      svg: (
        <svg height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="26" fill="#BF0000" fontSize="26" fontWeight="900" fontFamily="sans-serif">Rakuten</text>
          <path d="M0 34H96" stroke="#BF0000" strokeWidth="4"/>
        </svg>
      )
    },
    {
      name: 'Red Bull',
      svg: (
        <svg height="42" viewBox="0 0 150 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="21" r="14" fill="#FFCC00"/>
          <text x="38" y="28" fill="#DB0A40" fontSize="23" fontWeight="900" fontFamily="sans-serif">Red Bull</text>
        </svg>
      )
    }
  ];

  const row2Logos = [
    {
      name: 'Replit',
      svg: (
        <svg height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8H18V18H4V8ZM18 18H32V28H18V18ZM4 28H18V38H4V28Z" fill="#F26207"/>
          <text x="40" y="28" fill="#1D1D1F" fontSize="23" fontWeight="700" fontFamily="sans-serif">replit</text>
        </svg>
      )
    },
    {
      name: 'Roblox',
      svg: (
        <svg height="42" viewBox="0 0 150 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="6" width="28" height="28" rx="5" transform="rotate(-12 16 20)" fill="#000000"/>
          <rect x="11" y="15" width="10" height="10" rx="2" transform="rotate(-12 16 20)" fill="#FFFFFF"/>
          <text x="42" y="28" fill="#1D1D1F" fontSize="25" fontWeight="900" letterSpacing="1px" fontFamily="sans-serif">ROBLOX</text>
        </svg>
      )
    },
    {
      name: 'Sega',
      svg: (
        <svg height="42" viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="30" fill="#006699" fontSize="30" fontWeight="900" fontStyle="italic" letterSpacing="3px" fontFamily="sans-serif">SEGA</text>
        </svg>
      )
    },
    {
      name: 'Marriott',
      svg: (
        <svg height="42" viewBox="0 0 160 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 34V8L20 34L32 8V34" stroke="#A6192E" strokeWidth="5" strokeLinejoin="round"/>
          <text x="42" y="28" fill="#1D1D1F" fontSize="21" fontWeight="700" letterSpacing="2px" fontFamily="sans-serif">MARRIOTT</text>
        </svg>
      )
    },
    {
      name: 'Taj Hotels',
      svg: (
        <svg height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 6L6 36H26L16 6Z" fill="#B38E46"/>
          <text x="34" y="28" fill="#1D1D1F" fontSize="23" fontWeight="800" letterSpacing="3px" fontFamily="sans-serif">TAJ</text>
        </svg>
      )
    },
    {
      name: 'Hyatt',
      svg: (
        <svg height="42" viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="28" fill="#0071E3" fontSize="26" fontWeight="700" letterSpacing="4px" fontFamily="sans-serif">HYATT</text>
        </svg>
      )
    },
    {
      name: 'Hilton',
      svg: (
        <svg height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="28" fill="#002663" fontSize="26" fontWeight="800" letterSpacing="3px" fontFamily="sans-serif">Hilton</text>
        </svg>
      )
    }
  ];

  // Tripled lists for seamless infinite loop
  const row1Doubled = [...row1Logos, ...row1Logos, ...row1Logos];
  const row2Doubled = [...row2Logos, ...row2Logos, ...row2Logos];

  return (
    <section style={{
      backgroundColor: 'rgb(253, 253, 253)',
      padding: '36px 0',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      border: 'none',
      boxShadow: 'none'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px 20px', textAlign: 'center' }}>
        <span className="apple-badge-ember" style={{ display: 'inline-block' }}>
          TRUSTED BY PREMIER HOTELS & GLOBAL BRANDS
        </span>
      </div>

      {/* Row 1: Left to Right Marquee */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%', marginBottom: '20px', position: 'relative' }}>
        <motion.div
          animate={{ x: ['-50%', '0%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 32,
            ease: 'linear'
          }}
          style={{ display: 'flex', gap: '36px', whiteSpace: 'nowrap', alignItems: 'center' }}
        >
          {row1Doubled.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 12px',
                opacity: 0.9
              }}
            >
              {item.svg}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 2: Right to Left Marquee */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%', position: 'relative' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 32,
            ease: 'linear'
          }}
          style={{ display: 'flex', gap: '36px', whiteSpace: 'nowrap', alignItems: 'center' }}
        >
          {row2Doubled.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 12px',
                opacity: 0.9
              }}
            >
              {item.svg}
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
