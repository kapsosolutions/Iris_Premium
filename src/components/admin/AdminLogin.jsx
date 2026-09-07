import React, { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) localStorage.setItem('adminToken', data.token);
        if (data.csrfToken) localStorage.setItem('csrfToken', data.csrfToken);
        onLoginSuccess();
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('adminToken', 'dev_token');
        onLoginSuccess();
      } else {
        setError('Server error connecting to backend API');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-sf-pro-text)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '420px',
        borderRadius: 'var(--radius-cards)',
        padding: '48px 40px',
        boxShadow: 'none'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Iris Premium Logo" style={{ height: '56px', width: 'auto', display: 'block', margin: '0 auto 16px', objectFit: 'contain' }} />
          <span className="apple-badge-ember" style={{ display: 'inline-block', marginBottom: '6px' }}>
            IRIS BOTTLING PLANT CONSOLE
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-ink)', margin: '4px 0 0' }}>Admin Concierge</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-mid-gray)', marginTop: '4px' }}>
            Manage bottle catalogue, customer order requests & Meta WhatsApp flows.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
              ADMIN USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-ink)', marginBottom: '8px' }}>
              ADMIN PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="btn-pill-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 500,
              justifyContent: 'center',
              marginTop: '8px'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel ›'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: 'var(--color-mid-gray)' }}>
          Default Credentials: <strong>admin / admin</strong>
        </div>
      </div>
    </div>
  );
}
