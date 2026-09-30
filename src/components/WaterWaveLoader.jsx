import React from 'react';

/**
 * Bouncing squash-and-stretch circles loader with dynamic floor shadows.
 * Features exact circle7124 & shadow046 animations.
 * Supports theme="whatsapp" (green) and theme="water" (Iris blue).
 */
export default function WaterWaveLoader({
  text = 'Loading data...',
  subtext = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  minHeight = '240px',
  inline = false,
  theme = 'water', // 'water' | 'whatsapp'
  style = {}
}) {
  const isWhatsapp = theme === 'whatsapp';

  const scaleMap = {
    sm: 0.75,
    md: 1,
    lg: 1.15
  };
  const scale = scaleMap[size] || 1;

  if (inline) {
    return (
      <div 
        className={`bouncing-loader-inline ${isWhatsapp ? 'theme-whatsapp' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          ...style
        }}
      >
        <div 
          className={`wrapper ${isWhatsapp ? 'theme-whatsapp' : ''}`}
          style={{ transform: `scale(${scale * 0.65})`, transformOrigin: 'center center' }}
        >
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
          <div className="shadow"></div>
        </div>
        {text && (
          <span style={{ 
            fontSize: '13.5px', 
            fontWeight: 500, 
            color: isWhatsapp ? '#075E54' : '#334155' 
          }}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`bouncing-loader-container ${isWhatsapp ? 'theme-whatsapp' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        minHeight: minHeight,
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div 
        className={`wrapper ${isWhatsapp ? 'theme-whatsapp' : ''}`}
        style={scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : {}}
      >
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
        <div className="shadow"></div>
      </div>

      {text && (
        <div style={{ marginTop: '24px', textAlign: 'center', maxWidth: '380px' }}>
          <p style={{
            fontSize: '14.5px',
            fontWeight: 600,
            margin: '0 0 4px',
            color: isWhatsapp ? '#075E54' : '#0f172a',
            letterSpacing: '-0.01em'
          }}>
            {text}
          </p>
          {subtext && (
            <p style={{
              fontSize: '12.5px',
              color: isWhatsapp ? '#0f7a37' : '#64748b',
              margin: 0,
              lineHeight: 1.4
            }}>
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
