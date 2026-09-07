import React, { useState, useEffect } from 'react';
import AboutSection from './components/AboutSection';
import BrandTickerSection from './components/BrandTickerSection';
import QuickOrderSection from './components/QuickOrderSection';
import Lenis from 'lenis';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StorySection from './components/StorySection';
import CollectionsSection from './components/CollectionsSection';
import LocationSection from './components/LocationSection';
import QuoteModal from './components/QuoteModal';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminWhatsAppCRM from './components/admin/AdminWhatsAppCRM';
import AdminFlowImages from './components/admin/AdminFlowImages';
import AdminOrders from './components/admin/AdminOrders';
import AdminSettings from './components/admin/AdminSettings';

export default function App() {
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isStandaloneCRM, setIsStandaloneCRM] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  useEffect(() => {
    // Check if URL is /admin, /admin/crm, or /admin/login
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setIsAdminPath(true);
      if (path === '/admin/crm') {
        setIsStandaloneCRM(true);
      }
      const token = localStorage.getItem('adminToken');
      if (token) setIsAdminLoggedIn(true);
    }

    // Initialize Lenis smooth scroll for main site
    if (!path.startsWith('/admin')) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      window.lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('csrfToken');
    setIsAdminLoggedIn(false);
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  };

  const handleOpenStudio = () => {
    handleOpenQuote();
  };

  const handleOpenQuote = (data = null) => {
    setPrefillData(data);
    setQuoteOpen(true);
  };

  // ADMIN ROUTE VIEW
  if (isAdminPath) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
    }

    // Dedicated Full-Screen Standalone CRM Page in New Tab (/admin/crm)
    if (isStandaloneCRM) {
      return <AdminWhatsAppCRM isFullView={true} />;
    }

    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onLogout={handleAdminLogout}
      >
        {adminTab === 'dashboard' && <AdminDashboard />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'whatsapp-crm' && <AdminWhatsAppCRM isFullView={false} />}
        {adminTab === 'flow-images' && <AdminFlowImages />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // USER LANDING WEBSITE VIEW
  return (
    <div className="site-container font-work-sans">
      
      {/* 1. Top Clean Hero Photo Banner (Navbar + Pure Photo, zero text overlay) */}
      <div style={{
        backgroundImage: 'url("/hero.jpg")',
        backgroundSize: '100% auto',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        width: '100%',
        height: '70vw',
        maxHeight: '750px',
        minHeight: '400px',
        backgroundColor: '#ffffff',
        boxShadow: 'none'
      }}>
        {/* Header Bar */}
        <Header
          onOpenStudio={handleOpenStudio}
          onOpenQuote={() => handleOpenQuote()}
        />
      </div>

      {/* Dual-Row Moving Brand Ticker Section */}
      <BrandTickerSection />

      {/* About Section (Left Matter + Background Image) */}
      <AboutSection
        onOpenStudio={handleOpenStudio}
        onOpenQuote={() => handleOpenQuote()}
      />

      {/* Quick Order Details Request Section */}
      <QuickOrderSection />

      {/* Location Map & Google Reviews Section */}
      <LocationSection />

      {/* Site Footer */}
      <Footer
        onOpenStudio={handleOpenStudio}
        onOpenQuote={() => handleOpenQuote()}
      />

      {/* Universal Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Quote & Free Sample Kit Modal */}
      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillData={prefillData}
      />

    </div>
  );
}
