import React, { useState, useEffect } from 'react';

export default function AdminFlowImages() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultKeys = [
    {
      key: 'welcome_banner',
      title: 'Welcome Flow Banner & Message (Sent on Hi)',
      defaultText: `👋 *Welcome to Iris Premium Bottling Co.* ✨\n\nWe craft bespoke natural Alpine artesian spring water (pH 7.8) with 24K embossed gold foil labeling for premier hotels, luxury weddings, and VIP galas.\n\nClick the button below to open our interactive Concierge Service Flow:`
    },
    {
      key: 'icon_book_order',
      title: '1:1 Square Logo Icon — "Book Order" Option',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'icon_my_orders',
      title: '1:1 Square Logo Icon — "My Orders" Option',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'icon_track_order',
      title: '1:1 Square Logo Icon — "Track Order" Option',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'icon_contact_us',
      title: '1:1 Square Logo Icon — "Contact Us" Option',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_weddings',
      title: '1:1 Square Icon — Marriages / Weddings',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_family',
      title: '1:1 Square Icon — Family Functions',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_hotels',
      title: '1:1 Square Icon — Hotels & Resorts',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_restaurants',
      title: '1:1 Square Icon — Restaurants & Cafes',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_bus',
      title: '1:1 Square Icon — Bus Travels',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_hospitals',
      title: '1:1 Square Icon — Hospitals',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_malls',
      title: '1:1 Square Icon — Shopping Malls',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_house',
      title: '1:1 Square Icon — House Purpose',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_political',
      title: '1:1 Square Icon — Political Events',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_jewelry',
      title: '1:1 Square Icon — Jewelry Shops',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_car',
      title: '1:1 Square Icon — Car / Bike Showrooms',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_corporates',
      title: '1:1 Square Icon — Corporates & Summits',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_caterings',
      title: '1:1 Square Icon — Caterings & Events',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_small_shops',
      title: '1:1 Square Icon — Small Shops & Outlets',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_schools',
      title: '1:1 Square Icon — Schools & Colleges',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    {
      key: 'purpose_icon_festivals',
      title: '1:1 Square Icon — Festivals & Celebrations',
      isSquare: true,
      defaultUrl: 'https://res.cloudinary.com/zavohueh/image/upload/v1787909086/iris_flow_images/n0gayi4xt3drdb1anow2.png'
    },
    { key: 'choose_service_header', title: 'Choose Service Header Image' },
    { key: 'catalog_header', title: 'Catalogue List Header Image' },
    { key: 'my_orders_header', title: 'My Orders Header Image' },
    { key: 'track_order_header', title: 'Track Order Header Image' },
    { key: 'contact_header', title: 'Contact Us Header Image' }
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flow-assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (assetKey, title, file) => {
    if (!file) return;
    let token = localStorage.getItem('adminToken');
    if (!token) {
      token = 'iris_admin_session_token';
      localStorage.setItem('adminToken', token);
    }
    const csrfToken = localStorage.getItem('csrfToken');

    const form = new FormData();
    form.append('assetKey', assetKey);
    form.append('title', title);
    form.append('image', file);

    try {
      const res = await fetch('/api/flow-assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: form
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully updated asset photo for: ${title}`);
        fetchAssets();
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (err) {
      alert('Error uploading flow image: ' + err.message);
    }
  };

  const handleSaveTextContent = async (assetKey, textContent) => {
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    try {
      const res = await fetch('/api/flow-assets/text', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ assetKey, textContent })
      });
      const data = await res.json();
      if (data.success) {
        alert('Welcome message text content updated live!');
        fetchAssets();
      } else {
        alert(data.message || 'Error updating text content');
      }
    } catch (err) {
      alert('Error updating text content: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
          META CLOUD API BANNER & CONTENT ASSETS
        </span>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          WhatsApp Flow Banners, 1:1 Logos & Content.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)' }}>
          Upload new Welcome Banner photos, 1:1 square ratio dropdown logos & edit message content sent dynamically during customer WhatsApp interactions.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: '15px', color: 'var(--color-mid-gray)' }}>Loading Meta flow banner assets...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {defaultKeys.map(item => {
            const existing = assets.find(a => a.assetKey === item.key);
            const currentUrl = existing?.imageUrl || item.defaultUrl || 'https://res.cloudinary.com/zavohueh/image/upload/v1787627656/iris_premium_bottles/iris_reserve.jpg';
            const currentText = existing?.textContent || item.defaultText || '';

            return (
              <FlowCard
                key={item.key}
                assetKey={item.key}
                title={item.title}
                currentUrl={currentUrl}
                currentText={currentText}
                isSquare={item.isSquare}
                hasTextSupport={Boolean(item.defaultText || item.key === 'welcome_banner')}
                onFileUpload={handleFileUpload}
                onSaveTextContent={handleSaveTextContent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function FlowCard({ assetKey, title, currentUrl, currentText, isSquare, hasTextSupport, onFileUpload, onSaveTextContent }) {
  const [uploading, setUploading] = useState(false);
  const [textVal, setTextVal] = useState(currentText);
  const [savingText, setSavingText] = useState(false);

  useEffect(() => {
    setTextVal(currentText);
  }, [currentText]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await onFileUpload(assetKey, title, file);
    setUploading(false);
  };

  const handleTextSave = async () => {
    setSavingText(true);
    await onSaveTextContent(assetKey, textVal);
    setSavingText(false);
  };

  return (
    <div className="apple-card" style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-cards)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-ink)', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-electric-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          {title}
        </h3>

        <div style={{
          marginBottom: '20px',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isSquare ? '16px' : '0'
        }}>
          <img
            src={currentUrl}
            alt={title}
            style={{
              width: isSquare ? '140px' : '100%',
              height: isSquare ? '140px' : '190px',
              objectFit: isSquare ? 'contain' : 'cover',
              borderRadius: isSquare ? '12px' : '0'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="file"
            id={`file-input-${assetKey}`}
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          <label
            htmlFor={`file-input-${assetKey}`}
            className="btn-pill-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              cursor: 'pointer',
              borderWidth: '1px',
              padding: '12px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {uploading ? 'Uploading Photo...' : (isSquare ? 'Replace 1:1 Square Logo ›' : 'Replace Banner Photo ›')}
          </label>
        </div>

        {hasTextSupport && (
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: '16px', marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit WhatsApp Welcome Message Text:
            </label>
            <textarea
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--color-hairline)',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                lineHeight: '1.4',
                outline: 'none',
                backgroundColor: 'var(--color-canvas)',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleTextSave}
              disabled={savingText}
              className="btn-pill-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '10px',
                fontSize: '14px',
                marginTop: '10px'
              }}
            >
              {savingText ? 'Saving Text...' : 'Save Welcome Text Content ›'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
