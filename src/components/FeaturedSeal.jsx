import React from 'react';

export default function FeaturedSeal({ text = "FEATURED • IRIS PREMIUM • CUSTOM LABELS • " }) {
  return (
    <div className="featured-seal" title="Iris Premium Stamp of Excellence">
      <svg viewBox="0 0 100 100" width="100" height="100">
        <path
          id="sealPath"
          d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="none"
        />
        <text fill="#035542" fontSize="9.5" fontWeight="500" letterSpacing="0.08em" className="font-work-sans">
          <textPath href="#sealPath" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '18px',
        fontWeight: '900',
        color: 'var(--color-forest-heritage)',
        fontFamily: 'var(--font-work-sans)',
        lineHeight: 1
      }}>
        💧
      </div>
    </div>
  );
}
