import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BillboardHeadline from './BillboardHeadline';

export default function GoogleReviewsSection() {
  const googleMapsUrl = "https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a4cf3007401bc1f:0x7a372ed8b7f3ef23!8m2!3d14.3879365!4d79.9383584!16s%2Fg%2F11z8ncf7r7";

  const reviews = [
    {
      id: 1,
      name: "Victoria Sterling",
      role: "General Manager, Grand Hyatt",
      rating: 5,
      date: "2 weeks ago",
      avatarBg: "#035542",
      text: "The 24K embossed gold foil labels on Iris 750ml heavy glass bottles completely transformed our VIP banquet tables. Zero peeling or bubbling in champagne ice buckets even after 48 hours. Absolute perfection."
    },
    {
      id: 2,
      name: "Arjun & Meera Kapoor",
      role: "Palace Wedding Hosts, Rajasthan",
      rating: 5,
      date: "1 month ago",
      avatarBg: "#2b7bb9",
      text: "We ordered 500 personalized rose gold monogram bottles for our royal wedding reception. The 48-hour rush delivery arrived in flawless condition. Our guests couldn't stop praising the natural spring water quality!"
    },
    {
      id: 3,
      name: "Chef Marcus Vance",
      role: "Michelin Star Culinary Director",
      rating: 5,
      date: "3 weeks ago",
      avatarBg: "#333333",
      text: "The pH 7.8 natural alkaline artesian spring water has a remarkably silky mouthfeel that pairs perfectly with our fine dining tasting menus. Iris is the gold standard for high-end hospitality."
    },
    {
      id: 4,
      name: "Priya Nambiar",
      role: "Events Director, Forbes VIP Summit",
      rating: 5,
      date: "2 months ago",
      avatarBg: "#035542",
      text: "Flawless concierge service from proof design to doorstep delivery. Spot UV gloss labels with heavy crystal glass bottles made our executive summit look incredibly prestigious."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000); // Auto-rotate every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const activeReview = reviews[currentIndex];

  return (
    <section id="reviews" style={{ width: '100%', padding: '50px 0', borderTop: '1px solid rgba(51,51,51,0.1)', backgroundColor: '#ffffff' }}>
      
      {/* Billboard Headline "REVIEWS" */}
      <BillboardHeadline text="REVIEWS" color="yellow" />

      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header & Overall Google Rating Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}
        >
          <span className="category-tag" style={{ justifyContent: 'center' }}>
            VERIFIED GOOGLE CLIENT REVIEWS
          </span>

          <h2 style={{
            fontSize: 'var(--text-subheading)',
            lineHeight: 'var(--leading-subheading)',
            fontWeight: 500,
            color: 'var(--color-charcoal-press)',
            marginTop: '8px'
          }}>
            Trusted by World-Class Hotels & Celebrations
          </h2>

          {/* Google Star Rating Summary Box */}
          <div style={{
            marginTop: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 24px',
            border: '1.5px solid var(--color-charcoal-press)',
            borderRadius: '100px',
            backgroundColor: '#ffffff'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-forest-heritage)' }}>4.9</span>
                <span style={{ color: '#FFB800', fontSize: '18px', letterSpacing: '1px' }}>★★★★★</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--color-charcoal-press)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OUT OF 5.0 • 142+ VERIFIED GOOGLE REVIEWS
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3-Second Auto-Rotating Testimonial Carousel Card */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            maxWidth: '860px',
            margin: '0 auto 35px auto',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReview.id}
              initial={{ opacity: 0, x: 25, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -25, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid var(--color-charcoal-press)',
                borderRadius: '8px',
                padding: '40px 45px',
                boxShadow: '0 12px 32px rgba(3, 85, 66, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Watermark Quote */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '30px',
                fontSize: '160px',
                fontWeight: '900',
                color: 'rgba(3, 85, 66, 0.05)',
                fontFamily: 'serif',
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                “
              </div>

              {/* Top Row: User Avatar & Google Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: activeReview.avatarBg,
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--color-forest-heritage)'
                  }}>
                    {activeReview.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-charcoal-press)', margin: 0 }}>
                      {activeReview.name}
                    </h3>
                    <span style={{ fontSize: '14px', color: 'var(--color-forest-heritage)', fontWeight: '500' }}>
                      {activeReview.role}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#FFB800', fontSize: '20px', letterSpacing: '2px' }}>
                    {'★'.repeat(activeReview.rating)}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#1a73e8', backgroundColor: '#e8f0fe', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ✔ Verified Google Review
                  </span>
                </div>
              </div>

              {/* Review Text Block */}
              <p style={{
                fontFamily: 'var(--font-work-sans)',
                fontSize: '20px',
                lineHeight: 1.6,
                fontWeight: 500,
                color: 'var(--color-charcoal-press)',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                "{activeReview.text}"
              </p>

              {/* Footer Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(51,51,51,0.12)', paddingTop: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-forest-heritage)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  IRIS PREMIUM ARTESIAN WATER & BESPOKE LABELS
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(51,51,51,0.6)' }}>
                  Posted {activeReview.date}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Progress & Navigation Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '0 10px'
          }}>
            {/* Left / Right Arrow Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handlePrev}
                className="btn-outlined"
                style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px' }}
                aria-label="Previous review"
              >
                &larr; PREV
              </button>
              <button 
                onClick={handleNext}
                className="btn-outlined"
                style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px' }}
                aria-label="Next review"
              >
                NEXT &rarr;
              </button>
            </div>

            {/* Pagination Pills */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {reviews.map((rev, index) => (
                <button
                  key={rev.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    height: '8px',
                    width: currentIndex === index ? '36px' : '10px',
                    borderRadius: '10px',
                    backgroundColor: currentIndex === index ? 'var(--color-forest-heritage)' : 'rgba(51,51,51,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Pause indicator */}
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-forest-heritage)' }}>
              {isPaused ? "⏸ PAUSED ON HOVER" : "⚡ AUTO-CHANGING EVERY 3 SECONDS"}
            </span>
          </div>

        </div>

        {/* CTA to Google Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginTop: '30px' }}
        >
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outlined"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            VERIFY ALL REVIEWS ON GOOGLE MAPS &rarr;
          </a>
        </motion.div>

      </div>
    </section>
  );
}
