import React, { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    officeAddress: '',
    phoneNumbersText: '',
    whatsappNumber: '',
    email: '',
    googleMapsUrl: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          officeAddress: data.data.officeAddress || '',
          phoneNumbersText: (data.data.phoneNumbers || []).join('\n'),
          whatsappNumber: data.data.whatsappNumber || '',
          email: data.data.email || '',
          googleMapsUrl: data.data.googleMapsUrl || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

    const phoneNumbers = settings.phoneNumbersText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...settings,
      phoneNumbers
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Plant location & contact settings saved successfully!');
        fetchSettings();
      }
    } catch (err) {
      alert('Error saving contact settings');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <span className="apple-badge-ember" style={{ display: 'block', marginBottom: '8px' }}>
          BOTTLING FACILITY CONFIGURATION
        </span>
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Plant Location & Contact Settings.
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-mid-gray)' }}>
          Manage your bottling plant address, concierge phone numbers, email & Google Maps location pin link.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: '15px', color: 'var(--color-mid-gray)' }}>Loading plant settings...</div>
      ) : (
        <form onSubmit={handleSave} className="apple-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-cards)',
          padding: '36px',
          maxWidth: '650px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>
              BOTTLING PLANT OFFICE ADDRESS
            </label>
            <textarea
              value={settings.officeAddress}
              onChange={e => setSettings({ ...settings, officeAddress: e.target.value })}
              rows={3}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>
              CONCIERGE PHONE NUMBERS (1 PER LINE)
            </label>
            <textarea
              value={settings.phoneNumbersText}
              onChange={e => setSettings({ ...settings, phoneNumbersText: e.target.value })}
              rows={2}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>WHATSAPP NUMBER</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary-ink)' }}>
              GOOGLE MAPS LOCATION PIN LINK
            </label>
            <input
              type="text"
              value={settings.googleMapsUrl}
              onChange={e => setSettings({ ...settings, googleMapsUrl: e.target.value })}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            className="btn-pill-primary"
            style={{
              padding: '14px',
              fontSize: '16px',
              justifyContent: 'center',
              marginTop: '12px'
            }}
          >
            Save Location & Contact Settings ›
          </button>
        </form>
      )}
    </div>
  );
}
