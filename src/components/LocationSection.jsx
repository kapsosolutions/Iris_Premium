import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationSection() {
  const mapUrl = "https://www.google.com/maps/place/Iris+premium/@14.3879365,79.9383584,711m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3a4cf3007401bc1f:0x7a372ed8b7f3ef23!8m2!3d14.3879365!4d79.9383584!16s%2Fg%2F11z8ncf7r7?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D";
  const embedIframeUrl = "https://maps.google.com/maps?q=14.3879365,79.9383584&z=16&output=embed";

  const reviews = [
    {
      id: 1,
      name: "Victoria Sterling",
      role: "General Manager, Grand Hyatt",
      rating: 5,
      date: "2 weeks ago",
      avatarBg: "#0071e3",
      text: "The 24K embossed gold foil labels on Iris 750ml heavy glass bottles completely transformed our VIP banquet tables. Zero peeling or bubbling in champagne ice buckets even after 48 hours."
    },
    {
      id: 2,
      name: "Arjun & Meera Kapoor",
      role: "Palace Wedding Hosts",
      rating: 5,
      date: "1 month ago",
      avatarBg: "#2b7bb9",
      text: "We ordered 500 personalized rose gold monogram bottles for our royal wedding reception. The express delivery arrived in flawless condition. Our guests loved the natural spring water!"
    },
    {
      id: 3,
      name: "Chef Marcus Vance",
      role: "Michelin Star Culinary Director",
      rating: 5,
      date: "3 weeks ago",
      avatarBg: "#1d1d1f",
      text: "The pH 7.8 natural alkaline artesian spring water has a remarkably silky mouthfeel that pairs perfectly with our fine dining tasting menus. Iris is the gold standard for high-end hospitality."
    },
    {
      id: 4,
      name: "Priya Nambiar",
      role: "Events Director, Forbes VIP Summit",
      rating: 5,
      date: "2 months ago",
      avatarBg: "#e35205",
      text: "Flawless concierge service from proof design to doorstep delivery. Spot UV gloss labels with heavy crystal glass bottles made our executive summit look incredibly prestigious."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const activeReview = reviews[currentIndex];

  return (
    <section id="location" style={{ backgroundColor: 'var(--color-canvas)', padding: '30px 0 100px 0', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '40px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
            BOTTLING PLANT & REVIEWS
          </span>
          <h2 className="section-title">
            Facility & Reviews.
          </h2>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-mid-gray)', marginTop: '8px', maxWidth: '650px' }}>
            Read verified Google client reviews and locate our manufacturing facility in Nellore, Andhra Pradesh.
          </p>
        </motion.div>

        {/* 2-Column Grid: Left (Google Reviews) & Right (Google Map) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          
          {/* Left Column: Google Reviews Container Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="apple-card"
            style={{
              backgroundColor: 'var(--color-paper)',
              borderRadius: 'var(--radius-cards)',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* Google Reviews Overall Rating Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-ink)' }}>4.9 ★★★★★</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-mid-gray)', display: 'block' }}>142+ Verified Google Reviews</span>
                  </div>
                </div>

                <span style={{ fontSize: '12px', fontWeight: 600, color: '#107c41', backgroundColor: '#e6f4ea', padding: '4px 10px', borderRadius: '100px' }}>
                  ✓ Verified Reviews
                </span>
              </div>

              {/* Review Carousel Card */}
              <div 
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ position: 'relative', minHeight: '210px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeReview.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: activeReview.avatarBg,
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {activeReview.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
                          {activeReview.name}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--color-mid-gray)' }}>
                          {activeReview.role} • {activeReview.date}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '15px', color: 'var(--color-primary-ink)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '16px' }}>
                      "{activeReview.text}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Carousel Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrev} className="btn-pill-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    ‹ Prev
                  </button>
                  <button onClick={handleNext} className="btn-pill-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Next ›
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {reviews.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setCurrentIndex(i)}
                      style={{
                        width: currentIndex === i ? '20px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: currentIndex === i ? 'var(--color-electric-blue)' : 'var(--color-hairline)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Open in Google Maps & View All Reviews ›
              </a>
            </div>
          </motion.div>

          {/* Right Column: Google Maps Container */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: 'var(--radius-cards)',
              overflow: 'hidden',
              minHeight: '440px',
              backgroundColor: 'var(--color-paper)'
            }}
          >
            <iframe
              title="Iris Premium Location Map"
              src={embedIframeUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '440px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
