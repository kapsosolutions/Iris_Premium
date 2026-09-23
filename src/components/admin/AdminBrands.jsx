import React, { useState, useEffect } from 'react';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Form states for Add/Edit
  const [brandName, setBrandName] = useState('');
  const [brandOrder, setBrandOrder] = useState(1);
  const [brandActive, setBrandActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || 'iris_admin_session_token';
      const res = await fetch('/api/brands/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBrands(data.data || []);
      } else {
        // Fallback to public endpoint
        const pubRes = await fetch('/api/brands');
        const pubData = await pubRes.json();
        if (pubData.success) {
          setBrands(pubData.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandOrder(brands.length + 1);
    setBrandActive(true);
    setSelectedFile(null);
    setFilePreview('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandOrder(brand.order || 1);
    setBrandActive(brand.active !== false);
    setSelectedFile(null);
    setFilePreview(brand.imageUrl);
    setShowAddModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      alert('Please enter a brand name');
      return;
    }
    if (!editingBrand && !selectedFile) {
      alert('Please select a brand logo image to upload');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('adminToken') || 'iris_admin_session_token';
    const csrfToken = localStorage.getItem('csrfToken') || '';

    try {
      let imageUrl = editingBrand ? editingBrand.imageUrl : '';

      // 1. If a new file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadRes = await fetch('/api/brands/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.url) {
          throw new Error(uploadData.message || 'Image upload failed');
        }
        imageUrl = uploadData.url;
      }

      // 2. Create or Update Brand document
      if (editingBrand) {
        const updateRes = await fetch(`/api/brands/${editingBrand._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            name: brandName.trim(),
            imageUrl,
            order: Number(brandOrder) || 1,
            active: brandActive
          })
        });
        const updateData = await updateRes.json();
        if (!updateData.success) throw new Error(updateData.message || 'Update failed');
        showToast(`Brand "${brandName}" updated successfully!`);
      } else {
        const createRes = await fetch('/api/brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            name: brandName.trim(),
            imageUrl,
            order: Number(brandOrder) || 1,
            active: brandActive
          })
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error(createData.message || 'Creation failed');
        showToast(`Brand "${brandName}" uploaded and added live to website!`);
      }

      setShowAddModal(false);
      fetchBrands();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (brand) => {
    const token = localStorage.getItem('adminToken') || 'iris_admin_session_token';
    const csrfToken = localStorage.getItem('csrfToken') || '';
    const newStatus = !brand.active;

    try {
      const res = await fetch(`/api/brands/${brand._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ active: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBrands(prev => prev.map(b => b._id === brand._id ? { ...b, active: newStatus } : b));
        showToast(`Brand "${brand.name}" is now ${newStatus ? 'visible' : 'hidden'} on website`);
      }
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDeleteBrand = async (brand) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brand.name}"?`)) return;

    const token = localStorage.getItem('adminToken') || 'iris_admin_session_token';
    const csrfToken = localStorage.getItem('csrfToken') || '';

    try {
      const res = await fetch(`/api/brands/${brand._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        }
      });
      const data = await res.json();
      if (data.success) {
        setBrands(prev => prev.filter(b => b._id !== brand._id));
        showToast(`Brand "${brand.name}" removed successfully`);
      }
    } catch (err) {
      alert('Failed to delete brand: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--color-hairline)',
        paddingBottom: '24px'
      }}>
        <div>
          <span className="apple-badge-ember" style={{ display: 'inline-block', marginBottom: '8px' }}>
            HOMEPAGE CLIENT BRANDS
          </span>
          <h1 className="section-title" style={{ fontSize: '28px', fontWeight: 700, margin: '4px 0' }}>
            Brand Showcase Management
          </h1>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '15px', margin: 0 }}>
            Upload client and partner logos to dynamically showcase in the infinite ticker below the Hero section.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchBrands}
            className="btn-pill-ghost"
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </button>

          <button
            onClick={handleOpenAddModal}
            className="btn-pill"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Upload New Brand
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid var(--color-hairline)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-mid-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Brands
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-ink)', marginTop: '4px' }}>
            {brands.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid var(--color-hairline)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-mid-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live on Website
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {brands.filter(b => b.active).length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid var(--color-hairline)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-mid-gray)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hidden / Inactive
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#94a3b8', marginTop: '4px' }}>
            {brands.filter(b => !b.active).length}
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: 'var(--color-mid-gray)',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-hairline)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>Loading brand logos...</div>
        </div>
      ) : brands.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--color-hairline)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--color-mid-gray)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>No brands added yet</h3>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Upload client and partner logos here. They will appear live on your website's moving ticker immediately.
          </p>
          <button onClick={handleOpenAddModal} className="btn-pill" style={{ padding: '10px 24px' }}>
            Upload First Brand
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {brands.map((brand, idx) => (
            <div
              key={brand._id || idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '1px solid var(--color-hairline)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Order Badge & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-charcoal-press)',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}>
                  #{brand.order || idx + 1}
                </span>

                <button
                  onClick={() => handleToggleActive(brand)}
                  style={{
                    backgroundColor: brand.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.15)',
                    color: brand.active ? '#10b981' : '#64748b',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Click to toggle live website visibility"
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: brand.active ? '#10b981' : '#64748b'
                  }}></span>
                  {brand.active ? 'Live' : 'Hidden'}
                </button>
              </div>

              {/* Logo Preview Canvas */}
              <div style={{
                height: '110px',
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <img
                  src={brand.imageUrl}
                  alt={brand.name}
                  style={{
                    maxHeight: '80px',
                    maxWidth: '180px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Brand Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-ink)', marginBottom: '2px' }}>
                  {brand.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-mid-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {brand.imageUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid var(--color-hairline)',
                paddingTop: '14px'
              }}>
                <button
                  onClick={() => handleOpenEditModal(brand)}
                  className="btn-pill-ghost"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    justifyContent: 'center'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete brand"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {editingBrand ? 'Edit Client Brand' : 'Upload New Brand Logo'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: 'var(--color-mid-gray)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Brand Name Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Brand / Company Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahindra, Taj Hotels, Biriyani Zone..."
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-hairline)',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#fafafa'
                  }}
                />
              </div>

              {/* Logo File Upload & Preview */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Brand Logo Image (PNG / SVG / JPG / WebP):
                </label>
                
                <input
                  type="file"
                  id="brand-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <label
                  htmlFor="brand-file-input"
                  style={{
                    display: 'block',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {filePreview ? (
                    <div>
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{
                          maxHeight: '90px',
                          maxWidth: '180px',
                          objectFit: 'contain',
                          margin: '0 auto 10px',
                          display: 'block'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#0071e3', fontWeight: 600 }}>
                        Click to change image
                      </span>
                    </div>
                  ) : (
                    <div>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ margin: '0 auto 8px', display: 'block' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span style={{ fontSize: '13px', color: 'var(--color-primary-ink)', fontWeight: 600 }}>
                        Choose Logo Image File
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--color-mid-gray)', margin: '4px 0 0' }}>
                        Transparent background PNG or SVG recommended
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Order & Active Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Display Order:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={brandOrder}
                    onChange={(e) => setBrandOrder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-hairline)',
                      fontSize: '14px',
                      backgroundColor: '#fafafa'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '16px' }}>
                    <input
                      type="checkbox"
                      checked={brandActive}
                      onChange={(e) => setBrandActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#0071e3', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      Live on Website
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-pill-ghost"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill"
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving Brand...' : (editingBrand ? 'Update Brand' : 'Upload & Publish')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
