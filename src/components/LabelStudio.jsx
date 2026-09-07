import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function LabelStudio({ onOpenQuote }) {
  const [bottleStyle, setBottleStyle] = useState('reserve-glass');
  const [labelFinish, setLabelFinish] = useState('gold-foil');
  const [brandTitle, setBrandTitle] = useState('THE RITZ-CARLTON');
  const [brandSubtext, setBrandSubtext] = useState('ANNUAL GALAS & VIP LOUNGE');
  const [monogram, setMonogram] = useState('RC');
  const [accentColor, setAccentColor] = useState('#035542');
  const [fontStyle, setFontStyle] = useState('serif');
  const [quantity, setQuantity] = useState(250);
  const [sampleOrdered, setSampleOrdered] = useState(false);

  const bottleImages = {
    'reserve-glass': '/assets/iris_reserve.jpg',
    'classic-glass': '/assets/iris_wedding.jpg',
    'matte-black': '/assets/iris_matte_black.jpg',
    'sleek-pet': '/assets/iris_corporate.jpg'
  };

  const bottleNames = {
    'reserve-glass': '750ml Heavy Glass Reserve',
    'classic-glass': '500ml Crystal Glass Bottle',
    'matte-black': '330ml Matte Black VIP Edition',
    'sleek-pet': '500ml Sleek Recycled PET'
  };

  const finishNames = {
    'gold-foil': '24K Embossed Gold Foil',
    'silver-foil': 'Metallic Chrome Silver Foil',
    'rose-gold': 'Luxury Rose Gold Stamping',
    'transparent-clear': 'Crystal Clear Waterproof Vinyl',
    'soft-velvet': 'Soft-Touch Matte Velvet',
    'linen-kraft': 'Textured Linen Paper'
  };

  // Calculate unit price estimation in INR (₹)
  const basePrice = bottleStyle.includes('glass') ? 120 : 45;
  const finishModifier = labelFinish.includes('foil') || labelFinish.includes('rose') ? 25 : 10;
  const quantityDiscount = quantity >= 1000 ? 0.75 : (quantity >= 500 ? 0.85 : 1.0);
  const unitPriceNum = Math.round((basePrice + finishModifier) * quantityDiscount);
  const unitPrice = `₹${unitPriceNum}`;
  const totalPrice = `₹${(unitPriceNum * quantity).toLocaleString('en-IN')}`;

  const handleOrderSample = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#035542', '#2b7bb9', '#56dddb', '#f9e9a9']
    });
    setSampleOrdered(true);
    setTimeout(() => {
      onOpenQuote({
        bottleStyle: bottleNames[bottleStyle],
        labelFinish: finishNames[labelFinish],
        brandTitle,
        monogram,
        quantity,
        unitPrice,
        totalPrice
      });
    }, 1200);
  };

  return (
    <section id="studio" style={{
      width: '100%',
      backgroundColor: 'var(--color-cream-white)',
      borderTop: '2px solid var(--color-charcoal-press)',
      borderBottom: '2px solid var(--color-charcoal-press)',
      padding: '50px 20px',
      margin: '60px 0'
    }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        
        {/* Studio Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="category-tag" style={{ justifyContent: 'center' }}>
            ONLINE DESIGN STUDIO • LIVE PREVIEW
          </span>
          <h2 style={{
            fontFamily: 'var(--font-work-sans)',
            fontWeight: 900,
            fontSize: 'clamp(28px, 4vw, 42px)',
            color: 'var(--color-charcoal-press)',
            textTransform: 'uppercase',
            marginTop: '8px'
          }}>
            CUSTOM LABEL CONFIGURATOR
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-charcoal-press)', maxWidth: '650px', margin: '10px auto 0' }}>
            Design your bespoke water bottle label in real time. Choose from hot-stamped gold foils, waterproof matte vinyl, and custom monograms.
          </p>
        </div>

        {/* Studio Layout: 2 Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>

          {/* Left Column: Live Bottle Preview Canvas */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--color-charcoal-press)',
            borderRadius: '4px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(51,51,51,0.1)',
              paddingBottom: '10px'
            }}>
              <span className="category-tag" style={{ padding: 0 }}>LIVE MOCKUP</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-forest-heritage)' }}>
                {bottleNames[bottleStyle]}
              </span>
            </div>

            {/* Interactive Bottle Graphic Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
              aspectRatio: '1/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {/* Bottle Background Image */}
              <img
                src={bottleImages[bottleStyle]}
                alt="Custom Bottle Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />

              {/* Live Overlay Custom Label Badge */}
              <div style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '170px',
                padding: '14px 10px',
                backgroundColor: labelFinish === 'transparent-clear' ? 'rgba(255,255,255,0.85)' : '#ffffff',
                border: `1.5px solid ${accentColor}`,
                borderRadius: '2px',
                boxShadow: labelFinish.includes('foil') ? 'inset 0 0 10px rgba(197, 160, 89, 0.2)' : 'none',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backdropFilter: labelFinish === 'transparent-clear' ? 'blur(4px)' : 'none'
              }}>
                {/* Custom Monogram */}
                {monogram && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `1.5px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: accentColor,
                    fontFamily: fontStyle === 'serif' ? 'var(--font-brand-script)' : 'var(--font-work-sans)'
                  }}>
                    {monogram}
                  </div>
                )}

                {/* Custom Brand Title */}
                <span style={{
                  fontSize: '13px',
                  fontWeight: fontStyle === 'sans' ? '900' : '700',
                  fontFamily: fontStyle === 'serif' ? 'var(--font-brand-script)' : 'var(--font-work-sans)',
                  color: accentColor,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  wordBreak: 'break-word'
                }}>
                  {brandTitle || 'YOUR BRAND HERE'}
                </span>

                {/* Divider Line */}
                <div style={{ width: '40px', height: '1px', backgroundColor: accentColor, margin: '2px 0' }}></div>

                {/* Custom Subtext */}
                <span style={{
                  fontSize: '9px',
                  fontWeight: '500',
                  color: 'var(--color-charcoal-press)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {brandSubtext || 'NATURAL ALPINE WATER'}
                </span>

                {/* Finish Badge tag */}
                <span style={{
                  fontSize: '7px',
                  fontWeight: '500',
                  letterSpacing: '0.12em',
                  color: accentColor,
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  ★ {finishNames[labelFinish]} ★
                </span>
              </div>
            </div>

            {/* Estimated Price Card */}
            <div style={{
              width: '100%',
              marginTop: '20px',
              padding: '16px',
              border: '1.5px solid var(--color-forest-heritage)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(3, 85, 66, 0.02)'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-charcoal-press)', display: 'block' }}>
                  ESTIMATED BATCH TOTAL ({quantity} units)
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-forest-heritage)' }}>
                  {unitPrice} / bottle • Free Shipping Across India
                </span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-forest-heritage)' }}>
                {totalPrice}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
              <button 
                onClick={handleOrderSample} 
                className="btn-pill" 
                style={{ flex: 1, padding: '12px 16px', fontSize: '14px' }}
              >
                {sampleOrdered ? '✓ PREPARING SAMPLE...' : 'ORDER FREE PROOF SAMPLE &rarr;'}
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Control 1: Bottle Type Selector */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '10px' }}>
                1. SELECT BOTTLE VESSEL & CAPACITY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.keys(bottleNames).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBottleStyle(key)}
                    style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'left',
                      border: `1.5px solid ${bottleStyle === key ? 'var(--color-forest-heritage)' : 'var(--color-charcoal-press)'}`,
                      borderRadius: '4px',
                      backgroundColor: bottleStyle === key ? 'rgba(3, 85, 66, 0.05)' : '#ffffff',
                      color: bottleStyle === key ? 'var(--color-forest-heritage)' : 'var(--color-charcoal-press)'
                    }}
                  >
                    {bottleNames[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Label Finish Material */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '10px' }}>
                2. SELECT LABEL FINISH & MATERIAL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.keys(finishNames).map((key) => (
                  <button
                    key={key}
                    onClick={() => setLabelFinish(key)}
                    style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'left',
                      border: `1.5px solid ${labelFinish === key ? 'var(--color-forest-heritage)' : 'rgba(51,51,51,0.3)'}`,
                      borderRadius: '4px',
                      backgroundColor: labelFinish === key ? 'rgba(3, 85, 66, 0.05)' : '#ffffff',
                      color: labelFinish === key ? 'var(--color-forest-heritage)' : 'var(--color-charcoal-press)'
                    }}
                  >
                    {finishNames[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Custom Text Inputs */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '10px' }}>
                3. BRAND NAME & TEXT
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--color-charcoal-press)', display: 'block', marginBottom: '4px' }}>Main Brand / Event Title:</span>
                  <input
                    type="text"
                    value={brandTitle}
                    onChange={(e) => setBrandTitle(e.target.value)}
                    maxLength={30}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid var(--color-charcoal-press)',
                      borderRadius: '4px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--color-charcoal-press)', display: 'block', marginBottom: '4px' }}>Subtext / Slogan:</span>
                    <input
                      type="text"
                      value={brandSubtext}
                      onChange={(e) => setBrandSubtext(e.target.value)}
                      maxLength={40}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1.5px solid var(--color-charcoal-press)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--color-charcoal-press)', display: 'block', marginBottom: '4px' }}>Monogram:</span>
                    <input
                      type="text"
                      value={monogram}
                      onChange={(e) => setMonogram(e.target.value.toUpperCase())}
                      maxLength={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1.5px solid var(--color-charcoal-press)',
                        borderRadius: '4px',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontWeight: '700'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Control 4: Typography & Accent Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '6px' }}>
                  TYPEFACE STYLE
                </label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1.5px solid var(--color-charcoal-press)',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    fontSize: '14px'
                  }}
                >
                  <option value="serif">Playfair Serif (Luxury)</option>
                  <option value="sans">Work Sans Black (Bold)</option>
                  <option value="mono">Clean Modern Caps</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)', display: 'block', marginBottom: '6px' }}>
                  FOIL & ACCENT COLOR
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '42px' }}>
                  {[
                    { color: '#035542', name: 'Forest Heritage' },
                    { color: '#2b7bb9', name: 'Billboard Blue' },
                    { color: '#c5a059', name: '24K Gold' },
                    { color: '#333333', name: 'Charcoal' },
                    { color: '#b76e79', name: 'Rose Gold' }
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => setAccentColor(item.color)}
                      title={item.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        border: `2px solid ${accentColor === item.color ? 'var(--color-charcoal-press)' : 'transparent'}`,
                        outline: accentColor === item.color ? '2px solid var(--color-forest-heritage)' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Control 5: Quantity Selector Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', textTransform: 'uppercase', color: 'var(--color-forest-heritage)' }}>
                  5. BATCH QUANTITY: {quantity} BOTTLES
                </label>
                {quantity >= 1000 && (
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-forest-heritage)' }}>
                    ★ 25% BULK DISCOUNT APPLIED
                  </span>
                )}
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--color-forest-heritage)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-charcoal-press)', marginTop: '4px' }}>
                <span>50 min (Sample tier)</span>
                <span>500 (Gala tier)</span>
                <span>1,000+ (Hotel tier)</span>
                <span>5,000 (Resort tier)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '10px' }}>
              <button onClick={() => onOpenQuote({ bottleStyle, labelFinish, brandTitle, quantity, unitPrice, totalPrice })} className="btn-pill" style={{ flex: 1 }}>
                SUBMIT FOR PRODUCTION QUOTE &rarr;
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
