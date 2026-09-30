import React from 'react';

/**
 * WaterWaveLoader - Premium liquid wave loading animation.
 * Features undulating multi-layered water waves, fluid shimmer,
 * micro-bubbles, and glass orb reflection without any black boxes.
 */
export default function WaterWaveLoader({
  text = 'Loading data...',
  subtext = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  minHeight = '280px',
  inline = false,
  style = {}
}) {
  const orbSizes = {
    sm: { width: 56, height: 56 },
    md: { width: 84, height: 84 },
    lg: { width: 112, height: 112 }
  };

  const orbDimensions = orbSizes[size] || orbSizes.md;

  if (inline) {
    return (
      <div 
        className="water-wave-loader-inline"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          ...style
        }}
      >
        <div 
          className="water-wave-orb" 
          style={{ width: orbDimensions.width, height: orbDimensions.height }}
        >
          <div className="water-wave-liquid-track">
            {/* Layer 1: Deep Back Water Wave */}
            <svg 
              className="water-wave-svg wave-back" 
              viewBox="0 0 1000 120" 
              preserveAspectRatio="none"
            >
              <path d="M 0 40 Q 250 85 500 40 T 1000 40 L 1000 120 L 0 120 Z" />
            </svg>
            {/* Layer 2: Vibrant Front Water Wave */}
            <svg 
              className="water-wave-svg wave-front" 
              viewBox="0 0 1000 120" 
              preserveAspectRatio="none"
            >
              <path d="M 0 55 Q 250 15 500 55 T 1000 55 L 1000 120 L 0 120 Z" />
            </svg>
            {/* Floating Effervescent Water Bubbles */}
            <div className="water-bubbles">
              <span className="bubble b1"></span>
              <span className="bubble b2"></span>
              <span className="bubble b3"></span>
            </div>
          </div>
          {/* Glass Orb Highlights */}
          <div className="water-glass-shine"></div>
          <div className="water-glass-rim"></div>
        </div>
        {text && <span className="water-loader-text-inline">{text}</span>}
      </div>
    );
  }

  return (
    <div 
      className="water-wave-loader-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        minHeight: minHeight,
        width: '100%',
        ...style
      }}
    >
      <div className="water-wave-orb-wrapper">
        {/* Ambient Pulsing Water Glow */}
        <div className="water-ambient-glow"></div>
        <div className="water-ripple-ring"></div>

        {/* Central Liquid Glass Orb */}
        <div 
          className="water-wave-orb"
          style={{ width: orbDimensions.width, height: orbDimensions.height }}
        >
          <div className="water-wave-liquid-track">
            {/* Layer 1: Deep Back Wave */}
            <svg 
              className="water-wave-svg wave-back" 
              viewBox="0 0 1000 120" 
              preserveAspectRatio="none"
            >
              <path d="M 0 40 Q 250 85 500 40 T 1000 40 L 1000 120 L 0 120 Z" />
            </svg>
            {/* Layer 2: Vibrant Front Wave */}
            <svg 
              className="water-wave-svg wave-front" 
              viewBox="0 0 1000 120" 
              preserveAspectRatio="none"
            >
              <path d="M 0 55 Q 250 15 500 55 T 1000 55 L 1000 120 L 0 120 Z" />
            </svg>
            {/* Floating Effervescent Water Bubbles */}
            <div className="water-bubbles">
              <span className="bubble b1"></span>
              <span className="bubble b2"></span>
              <span className="bubble b3"></span>
            </div>
          </div>

          {/* Glass Orb Reflections */}
          <div className="water-glass-shine"></div>
          <div className="water-glass-rim"></div>
        </div>
      </div>

      {/* Loading Captions */}
      {text && (
        <div className="water-loader-text-wrap">
          <p className="water-loader-text">{text}</p>
          {subtext && <p className="water-loader-subtext">{subtext}</p>}
        </div>
      )}
    </div>
  );
}
