import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function QuickOrderSection() {
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    contactNumber: '',
    brandName: '',
    logoUrl: '',
    purpose: 'Marriages / Weddings',
    quantity: '500'
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const purposes = [
    'Marriages / Weddings',
    'Family Functions',
    'Hotels & Resorts',
    'Restaurants & Cafes',
    'Bus Travels',
    'Hospitals',
    'Shopping Malls',
    'House Purpose',
    'Political Events',
    'Jewelry Shops',
    'Car / Bike Showrooms',
    'Corporates & Summits',
    'Caterings & Events',
    'Small Shops & Outlets',
    'Schools & Colleges',
    'Festivals & Celebrations'
  ];

  const quantityOptions = [
    { value: '100', label: '100 Bottles' },
    { value: '250', label: '250 Bottles' },
    { value: '500', label: '500 Bottles (Popular)' },
    { value: '1000', label: '1,000 Bottles' },
    { value: '2500', label: '2,500 Bottles' },
    { value: '5000', label: '5,000+ Bulk Order' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    const uploadPayload = new FormData();
    uploadPayload.append('image', file);

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: uploadPayload
      });
      const data = await res.json();

      if (data.success && data.imageUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: data.imageUrl }));
      } else {
        setErrorMsg(data.message || 'File upload failed');
      }
    } catch (err) {
      setErrorMsg('Error uploading image file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsappNumber || !formData.brandName || !formData.purpose) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSubmittedOrder(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to submit order request');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="order-request" style={{ backgroundColor: 'var(--color-canvas)', padding: '80px 0 20px 0', boxShadow: 'none' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 50px' }}
        >
          <span className="apple-badge-ember" style={{ display: 'inline-block', marginBottom: '8px' }}>
            Book Your Custom Bottle Order
          </span>
          <h2 className="section-title">
            Promote Your Own Brand on Every Bottle.
          </h2>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-mid-gray)', marginTop: '8px' }}>
            Fill in your details below to request customized label proof & instant WhatsApp confirmation with our concierge.
          </p>
        </motion.div>

        {/* Order Form Card */}
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="apple-card"
            style={{
              backgroundColor: 'var(--color-paper)',
              borderRadius: 'var(--radius-cards)',
              padding: '48px',
              boxShadow: 'none'
            }}
          >
            {submittedOrder ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  fontSize: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '12px' }}>
                  Order Request Submitted!
                </h3>
                <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Thank you <strong>{submittedOrder.customerName}</strong>! We have received your order request for <strong>{submittedOrder.brandName}</strong> ({submittedOrder.quantity} Bottles).
                </p>
                <div style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderRadius: 'var(--radius-smallbuttons)',
                  padding: '16px 24px',
                  display: 'inline-block',
                  marginBottom: '28px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '14px', color: 'var(--color-primary-ink)' }}>
                    <strong>Order ID:</strong> #{submittedOrder.orderId}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-primary-ink)', marginTop: '4px' }}>
                    <strong>WhatsApp Sent To:</strong> {submittedOrder.whatsappNumber}
                  </div>
                </div>
                <div>
                  <button
                    className="btn-pill-primary"
                    onClick={() => {
                      setSubmittedOrder(null);
                      setFormData({
                        name: '',
                        whatsappNumber: '',
                        contactNumber: '',
                        brandName: '',
                        logoUrl: '',
                        purpose: 'Marriages / Weddings',
                        quantity: '500'
                      });
                    }}
                  >
                    Submit Another Request ›
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {errorMsg && (
                  <div style={{
                    backgroundColor: '#fce8e6',
                    color: '#c5221f',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Grid 2 Column for Contact Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      Brand / Hotel / Event Name *
                    </label>
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      placeholder="e.g. Grand Hyatt / Iris Resort"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      WhatsApp Number (for instant proof) *
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 919876543210"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      Alternative Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 9632498664"
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Purpose & Quantity Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      Purpose / Event Type *
                    </label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {purposes.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                      Estimated Bottle Quantity *
                    </label>
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-hairline)',
                        backgroundColor: 'var(--color-canvas)',
                        fontSize: '15px',
                        color: 'var(--color-primary-ink)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {quantityOptions.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Brand Logo / Label Design Container */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
                    Upload Brand Logo / Label Design <span style={{ fontWeight: 400, color: 'var(--color-mid-gray)' }}>(Optional)</span>
                  </label>

                  <input
                    type="file"
                    id="brand-logo-file-input"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  {!formData.logoUrl ? (
                    <label
                      htmlFor="brand-logo-file-input"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px 24px',
                        borderRadius: '16px',
                        border: '2px dashed #0071e3',
                        backgroundColor: '#f5f5f7',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 113, 227, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary-ink)' }}>
                        {uploading ? 'Uploading your logo...' : 'Click to Upload or Drag & Drop'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-mid-gray)', marginTop: '4px' }}>
                        High-resolution PNG, JPG, WEBP or SVG (Max 10MB)
                      </div>

                      <span
                        className="btn-pill-primary"
                        style={{ marginTop: '16px', padding: '8px 20px', fontSize: '13px', pointerEvents: 'none' }}
                      >
                        {uploading ? 'Uploading...' : 'Browse Image'}
                      </span>
                    </label>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: '1px solid #c6e1c6',
                      backgroundColor: '#f3fbf3'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img
                          src={formData.logoUrl}
                          alt="Brand Logo Preview"
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '10px',
                            objectFit: 'contain',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--color-hairline)',
                            padding: '4px'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#137333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ✓ Logo Uploaded Successfully
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-mid-gray)', marginTop: '2px' }}>
                            Ready for custom bottle proofing
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#c5221f',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '8px'
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <div style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    className="btn-pill-primary"
                    disabled={loading || uploading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '17px',
                      fontWeight: 500,
                      justifyContent: 'center'
                    }}
                  >
                    {loading ? 'Submitting Request...' : 'Book Order Request ›'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
