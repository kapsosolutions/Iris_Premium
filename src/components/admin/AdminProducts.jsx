import React, { useState, useEffect } from 'react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    bottleQuantity: 750,
    bottleUnit: 'ml',
    description: '',
    price: 95,
    mainImage: '',
    galleryImages: [],
    active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/products/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, targetType) => {
    if (!file) return;
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    if (targetType === 'mainImage') setUploadingMain(true);
    if (targetType === 'galleryImage') setUploadingGallery(true);

    const form = new FormData();
    form.append('image', file);

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: form
      });
      const data = await res.json();

      if (data.success) {
        const uploadedUrl = data.url;

        if (targetType === 'mainImage') {
          setFormData(prev => ({ ...prev, mainImage: uploadedUrl }));
        } else if (targetType === 'galleryImage') {
          setFormData(prev => ({
            ...prev,
            galleryImages: [...(prev.galleryImages || []), uploadedUrl]
          }));
        }
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingMain(false);
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingId(prod._id);
      const loadedCats = (prod.categories && prod.categories.length > 0)
        ? prod.categories
        : (prod.category ? [prod.category] : []);

      setFormData({
        name: prod.name || '',
        category: prod.category || 'PET Bottles',
        categories: loadedCats,
        bottleQuantity: prod.bottleQuantity || Number(parseInt(prod.bottleSize)) || 750,
        bottleUnit: prod.bottleUnit || (prod.bottleSize?.includes('Litre') ? 'Litre' : prod.bottleSize?.includes('L') ? 'L' : 'ml'),
        description: prod.description || '',
        price: prod.price || 95,
        mainImage: prod.mainImage || '',
        galleryImages: prod.galleryImages || [],
        active: prod.active !== undefined ? prod.active : true
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'PET Bottles',
        categories: [],
        bottleQuantity: 750,
        bottleUnit: 'ml',
        description: '',
        price: 95,
        mainImage: '',
        galleryImages: [],
        active: true
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    const formattedBottleSize = `${formData.bottleQuantity} ${formData.bottleUnit}`;
    const selectedCats = formData.categories || [];

    const payload = {
      ...formData,
      category: selectedCats[0] || formData.category || 'PET Bottles',
      categories: selectedCats,
      badge: 'BESPOKE BOTTLE',
      bottleQuantity: Number(formData.bottleQuantity),
      bottleUnit: formData.bottleUnit,
      bottleSize: formattedBottleSize,
      price: Number(formData.price)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Product saved & automatically synced to Meta Commerce Catalog!');
        setShowModal(false);
        fetchProducts();
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bottle product? It will also be removed from Meta Commerce Catalog.')) return;
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSyncMeta = async () => {
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');
    try {
      const res = await fetch('/api/products/sync-meta', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Started syncing all products & additional gallery photos to Meta Commerce Catalog!');
      } else {
        alert(data.message || 'Sync failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
            PRODUCT CATALOGUE & META COMMERCE SYNC
          </span>
          <h1 className="section-title" style={{ margin: 0 }}>
            Products.
          </h1>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '15px', marginTop: '4px' }}>
            Manage water bottles with 1:1 square photo aspect ratio, main & additional carousel photos, bottle size, starting price, and auto-sync to Meta WhatsApp Commerce Catalog.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSyncMeta}
            className="btn-pill-ghost"
            style={{ padding: '12px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🔄 Sync Meta Catalog
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-pill-primary"
            style={{ padding: '12px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Bottle Product
          </button>
        </div>
      </div>

      {/* Product Cards Grid in 3-Column Layout */}
      {loading ? (
        <div style={{ fontSize: '15px', color: 'var(--color-mid-gray)' }}>Loading bottle products...</div>
      ) : products.length === 0 ? (
        <div className="apple-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-mid-gray)', backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block', color: 'var(--color-electric-blue)' }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: '0 0 8px' }}>No Products in Catalogue</h3>
          <p style={{ fontSize: '14px', margin: '0 0 20px' }}>Click the "+ Add New Bottle Product" button to create your first bottle listing.</p>
          <button onClick={() => handleOpenModal()} className="btn-pill-primary" style={{ padding: '10px 20px', fontSize: '14px', margin: '0 auto' }}>
            + Add New Bottle Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {products.map(prod => {
            const displaySize = prod.bottleSize || `${prod.bottleQuantity || 750} ${prod.bottleUnit || 'ml'}`;
            const galleryList = Array.isArray(prod.galleryImages) ? prod.galleryImages : [];

            return (
              <div
                key={prod._id}
                className="apple-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  {/* Main Product Image Container with 1:1 Aspect Ratio */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#fbfbfd',
                    borderBottom: '1px solid var(--color-hairline)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    {prod.mainImage ? (
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ color: 'var(--color-mid-gray)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        No Main Photo
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Carousel Row (If Additional Images exist) */}
                  {galleryList.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '12px 20px 4px',
                      overflowX: 'auto',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-mid-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Carousel ({galleryList.length}):
                      </span>
                      {galleryList.map((gUrl, gIdx) => (
                        <img
                          key={gIdx}
                          src={gUrl}
                          alt={`Gallery ${gIdx}`}
                          style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid var(--color-hairline)',
                            backgroundColor: '#ffffff'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Details Body */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0, lineHeight: 1.3 }}>
                        {prod.name}
                      </h3>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-electric-blue)', whiteSpace: 'nowrap' }}>
                        ₹{prod.price}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        backgroundColor: 'rgba(0, 113, 227, 0.08)',
                        color: 'var(--color-electric-blue)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Bottle Size: {displaySize}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-mid-gray)', margin: '0', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prod.description || 'Natural Alpine Artesian Spring Water with 24K gold foil labeling.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleOpenModal(prod)}
                    className="btn-pill-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Product
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod._id)}
                    className="btn-pill-ghost"
                    style={{ color: '#c5221f', borderColor: 'rgba(197, 34, 31, 0.2)', padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="apple-card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
                {editingId ? 'Edit Bottle Product' : 'Add New Bottle Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-mid-gray)' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Heavy Glass Reserve Bottle"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', backgroundColor: 'var(--color-canvas)' }}
                />
              </div>

              {/* Bottle Size Quantity (Integer) & Unit Dropdown & Starting Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>Bottle Size Qty *</label>
                  <input
                    type="number"
                    value={formData.bottleQuantity}
                    onChange={e => setFormData({ ...formData, bottleQuantity: e.target.value })}
                    required
                    placeholder="e.g. 750"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', backgroundColor: 'var(--color-canvas)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>Unit *</label>
                  <select
                    value={formData.bottleUnit}
                    onChange={e => setFormData({ ...formData, bottleUnit: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', backgroundColor: 'var(--color-canvas)', cursor: 'pointer' }}
                  >
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="Litre">Litre</option>
                    <option value="Glass Bottle">Glass Bottle</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>Starting Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', backgroundColor: 'var(--color-canvas)' }}
                  />
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>Product Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter detailed description of bottle craftsmanship, pH balance, and 24K gold foil embossed labeling..."
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', fontFamily: 'sans-serif', backgroundColor: 'var(--color-canvas)' }}
                />
              </div>

              {/* Product Categories (Multi-Select) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>
                  🏷️ Product Categories (Select All Applicable Categories)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
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
                  ].map(cat => {
                    const isSelected = (formData.categories || []).includes(cat) || formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const currentCats = formData.categories || (formData.category ? [formData.category] : []);
                          let nextCats;
                          if (currentCats.includes(cat)) {
                            nextCats = currentCats.filter(c => c !== cat);
                          } else {
                            nextCats = [...currentCats, cat];
                          }
                          setFormData({
                            ...formData,
                            category: nextCats[0] || 'PET Bottles',
                            categories: nextCats
                          });
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: isSelected ? '1.5px solid var(--color-electric-blue)' : '1px solid var(--color-hairline)',
                          backgroundColor: isSelected ? 'rgba(0, 102, 255, 0.1)' : 'var(--color-canvas)',
                          color: isSelected ? 'var(--color-electric-blue)' : 'var(--color-primary-ink)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Main Product Image Upload */}
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-ink)' }}>
                  📷 1. Main Product Cover Image (1:1 Ratio) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e.target.files[0], 'mainImage')}
                  disabled={uploadingMain}
                  style={{ fontSize: '14px' }}
                />
                {uploadingMain && <div style={{ fontSize: '13px', color: 'var(--color-electric-blue)', marginTop: '4px' }}>Uploading main photo...</div>}
                {formData.mainImage && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={formData.mainImage} alt="Main Preview" style={{ height: '80px', width: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--color-hairline)', padding: '4px', backgroundColor: '#ffffff' }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-mid-gray)' }}>Main Cover Image active (1:1 Square)</span>
                  </div>
                )}
              </div>

              {/* 2. Additional Gallery Images Upload */}
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: 0 }}>
                    🖼️ 2. Additional Gallery Photos (For WhatsApp Carousel ‹ ›)
                  </label>
                  <input
                    type="file"
                    id="additional-image-input"
                    accept="image/*"
                    onChange={e => handleFileUpload(e.target.files[0], 'galleryImage')}
                    disabled={uploadingGallery}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="additional-image-input"
                    className="btn-pill-ghost"
                    style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', margin: 0 }}
                  >
                    {uploadingGallery ? 'Uploading Photo...' : '+ Add Carousel Photo'}
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-mid-gray)', marginTop: 0, marginBottom: '12px' }}>
                  Upload extra angles & bottle closeups. Meta WhatsApp renders these in the native ‹ › carousel drawer!
                </p>

                {formData.galleryImages && formData.galleryImages.length > 0 ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {formData.galleryImages.map((gUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', border: '1px solid var(--color-hairline)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                        <img src={gUrl} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'rgba(195, 34, 31, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--color-mid-gray)', fontStyle: 'italic', padding: '12px', backgroundColor: 'var(--color-canvas)', borderRadius: '8px', border: '1px dashed var(--color-hairline)', textAlign: 'center' }}>
                    No additional carousel photos uploaded yet. Click "+ Add Carousel Photo" to attach photos.
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--color-hairline)', paddingTop: '20px' }}>
                <button type="submit" className="btn-pill-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Product & Sync to Meta Catalog ›
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-pill-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
