import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../adminApi';
import { API_BASE_URL, authHeaders } from '../../config';

// ---- WhatsApp marketing design tokens (exact FMCG CRM theme) --------------
// Warm-cream canvas, near-black ink, voltage-green CTA, pill-everywhere
// radius, WhatsApp Sans Var (falls back to Inter / system).
const FONT = '"WhatsApp Sans Var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif';
const C = {
  canvas: '#fcf5eb',
  surface: '#ffffff',
  ink: '#1c1e21',
  inkMuted: '#5e5e5e',
  green: '#25d366',
  greenDeep: '#0f7a37',
  mint: '#e6ffda',
  link: '#0373e9',
  danger: '#c0322b',
  hairline: 'rgba(28,30,33,0.12)',
  hairlineSoft: 'rgba(28,30,33,0.06)'
};

// ---- helpers ---------------------------------------------------------------

function dayLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const that = new Date(d); that.setHours(0, 0, 0, 0);
  const diff = Math.round((today - that) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Escape HTML then apply *bold* and _italics_ (XSS-safe).
function formatText(txt) {
  if (!txt) return '';
  let s = String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
  s = s.replace(/_(.+?)_/g, '<em>$1</em>');
  return s;
}

const money = (n, cur = 'INR') => {
  const sym = cur === 'INR' ? '₹' : (cur + ' ');
  return `${sym}${Number(n || 0).toLocaleString('en-IN')}`;
};

// WhatsApp-style delivery ticks for outgoing messages:
//   sent        single grey ✓
//   delivered   double grey ✓✓
//   read        double BLUE ✓✓ (customer has seen it)
//   failed      red ✕
function DeliveryMark({ status }) {
  const Tick = ({ color, style }) => (
    <svg viewBox="0 0 16 11" width="15" height="11" style={{ display: 'block', ...style }} aria-hidden="true">
      <path d="M1 6.2 L4.1 9.3 L10.3 1.6" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const label = { sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed to send' }[status] || 'Delivered';

  if (status === 'failed') {
    return <span title="Failed to send" style={{ color: C.danger, fontWeight: 600, marginLeft: 3 }}>✕</span>;
  }
  const isRead = status === 'read';
  const isDouble = isRead || status === 'delivered' || !status;
  const color = isRead ? '#53bdeb' : '#8696a0'; // WhatsApp blue vs grey
  return (
    <span title={label} style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4, height: 11, width: isDouble ? 19 : 15, position: 'relative' }}>
      <Tick color={color} style={{ position: 'absolute', left: 0 }} />
      {isDouble && <Tick color={color} style={{ position: 'absolute', left: 4 }} />}
    </span>
  );
}

// ---- rich renderers (ink text on light bubbles) ----------------------------

function OrderCard({ rich }) {
  if (!rich || !rich.items) return null;
  return (
    <div style={{ minWidth: 260, maxWidth: 340, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>
        🧾 Order • {rich.items.length} item{rich.items.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rich.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {it.image ? (
              <img src={it.image} alt="" style={{ width: 38, height: 38, borderRadius: 9999, objectFit: 'cover', flexShrink: 0, background: '#fff' }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: 9999, background: 'rgba(28,30,33,0.08)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {it.name}{it.variantLabel ? ` • ${it.variantLabel}` : ''}
              </div>
              <div style={{ fontSize: 11.5, color: C.inkMuted }}>{it.qty} x {money(it.price, it.currency)}</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{money(it.lineTotal, it.currency)}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.hairline}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 14 }}>
        <span>Total</span>
        <span>{money(rich.total, rich.currency)}</span>
      </div>
      {rich.note && <div style={{ fontSize: 11.5, color: C.inkMuted, marginTop: 6, whiteSpace: 'pre-wrap' }}>{rich.note}</div>}
    </div>
  );
}

function LocationCard({ rich }) {
  if (!rich) return null;
  const label = rich.address || rich.name || (rich.latitude != null ? `${rich.latitude}, ${rich.longitude}` : 'Location');
  return (
    <div style={{ minWidth: 220, maxWidth: 300, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>📍 Shared location</div>
      {rich.name && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{rich.name}</div>}
      <div style={{ fontSize: 12.5, color: C.inkMuted, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{label}</div>
      {rich.latitude != null && <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{rich.latitude}, {rich.longitude}</div>}
      {rich.mapUrl && (
        <a href={rich.mapUrl} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 600, color: C.greenDeep, textDecoration: 'none' }}>
          🗺️ Open in Google Maps
        </a>
      )}
    </div>
  );
}

function FlowCard({ rich }) {
  if (!rich || !rich.fields?.length) return <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>📋 Form response</div>;
  return (
    <div style={{ minWidth: 240, maxWidth: 320, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>📋 Form response</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rich.fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
            <span style={{ color: C.inkMuted, flexShrink: 0 }}>{f.label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Outbound bot/agent message: image/doc header + body + reply/CTA/flow buttons.
function BotCard({ rich }) {
  if (!rich) return null;
  const btnStyle = { display: 'block', textAlign: 'center', padding: '7px 10px', fontSize: 13, fontWeight: 600, color: C.link, textDecoration: 'none', borderRadius: 8 };
  const iconFor = (kind) => (kind === 'flow' ? '⚡ ' : kind === 'list' ? '📋 ' : kind === 'location' ? '📍 ' : kind === 'pay' ? '💳 ' : '💬 ');
  return (
    <div style={{ minWidth: 220, maxWidth: 330, color: C.ink }}>
      {rich.headerImageUrl && (
        <img src={rich.headerImageUrl} alt="" style={{ width: '100%', borderRadius: 14, marginBottom: 8, display: 'block', maxHeight: 220, objectFit: 'cover' }} />
      )}
      {rich.headerDocName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(28,30,33,0.05)', borderRadius: 12, padding: '8px 10px', marginBottom: 8, fontSize: 12.5, fontWeight: 600 }}>
          📄 {rich.headerDocName}
        </div>
      )}
      {rich.body && (
        <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: formatText(rich.body) }} />
      )}
      {rich.footer && <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 5 }}>{rich.footer}</div>}
      {rich.listSections?.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {rich.listSections.map((s, i) => (
            <div key={i}>
              {s.title && <div style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginTop: 6 }}>{s.title}</div>}
              {s.rows?.map((r, j) => <div key={j} style={{ fontSize: 12.5, color: C.ink }}>• {r}</div>)}
            </div>
          ))}
        </div>
      )}
      {(rich.buttons?.length > 0 || rich.cta) && (
        <div style={{ marginTop: 8, borderTop: `1px solid ${C.hairline}`, paddingTop: 4, display: 'flex', flexDirection: 'column' }}>
          {rich.cta && (
            rich.cta.url
              ? <a href={rich.cta.url} target="_blank" rel="noreferrer" style={btnStyle}>🔗 {rich.cta.text}</a>
              : <div style={btnStyle}>🔗 {rich.cta.text}</div>
          )}
          {rich.buttons?.map((b, i) => (
            <div key={i} style={{ ...btnStyle, borderTop: (i > 0 || rich.cta) ? `1px solid ${C.hairlineSoft}` : 'none' }}>
              {iconFor(b.kind)}{b.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminWhatsAppCRM({ isFullView = true }) {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  const chatScrollRef = useRef(null);
  const activeRef = useRef(null);
  useEffect(() => { activeRef.current = active; }, [active]);

  async function loadThreads() {
    try {
      const res = await api.get('/crm/threads');
      setThreads(res.data || []);
      // If none selected, auto-select first
      if (!activeRef.current && res.data?.length > 0) {
        openThread(res.data[0]._id, false);
      }
    } catch (e) {
      console.error('Failed to load threads:', e);
    }
  }

  async function loadTemplates() {
    try {
      const res = await api.get('/crm/templates');
      setTemplates(res.data || []);
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  }

  async function openThread(phone, smoothScroll = true) {
    setActive(phone);
    try {
      const res = await api.get(`/crm/messages/${phone}`);
      setMessages(res.data || []);
      scrollToBottom(smoothScroll);
    } catch (e) {
      console.error('Failed to open thread:', e);
    }
  }

  // Scroll to bottom without moving or jumping the window!
  function scrollToBottom(smooth = true) {
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 60);
  }

  useEffect(() => {
    loadThreads();
    loadTemplates();
  }, []);

  // Live polling - refresh threads + open chat every 5s safely
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const tr = await api.get('/crm/threads');
        setThreads(tr.data || []);
      } catch { /* ignore */ }

      const phone = activeRef.current;
      if (phone) {
        try {
          const res = await api.get(`/crm/messages/${phone}`);
          const next = res.data || [];
          setMessages((prev) => {
            const changed = next.length !== prev.length || next[next.length - 1]?._id !== prev[prev.length - 1]?._id;
            if (changed) {
              scrollToBottom(true);
              return next;
            }
            return prev;
          });
        } catch { /* ignore */ }
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);

  async function send() {
    if ((!text.trim() && !mediaUrl) || !active) return;
    try {
      await api.post('/crm/send', { phone: active, body: text, mediaUrl });
      setText('');
      setMediaUrl('');
      await openThread(active, true);
      await loadThreads();
    } catch (e) {
      alert(e.message || 'Failed to send message');
    }
  }

  async function handleMediaUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.postForm('/crm/templates/upload', form);
      if (res.url) {
        setMediaUrl(res.url);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  }

  async function downloadContacts() {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crm/contacts/export`, { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const dispo = res.headers.get('Content-Disposition') || '';
      const m = /filename="?([^"]+)"?/.exec(dispo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = m ? m[1] : `iris-whatsapp-contacts-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const activeThread = threads.find((t) => t._id === active);
  const activeName = activeThread?.name || active || '';
  const lastInboundAt = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].direction === 'in') return messages[i].createdAt;
    }
    return activeThread?.lastInboundAt || null;
  })();

  const filteredThreads = threads.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (t.name && t.name.toLowerCase().includes(q)) || (t._id && t._id.includes(q)) || (t.lastBody && t.lastBody.toLowerCase().includes(q));
  });

  return (
    <div style={{
      fontFamily: FONT,
      fontWeight: 400,
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: C.canvas,
      color: C.ink,
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Top Header Bar */}
      <header style={{
        padding: '14px 28px',
        background: C.canvas,
        borderBottom: `1px solid ${C.hairline}`,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        minHeight: 74,
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src="/logo.png" alt="Iris Logo" style={{ height: 34, width: 'auto', display: 'block' }} />
          <span style={{ fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: '-0.3px' }}>CRM</span>
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.greenDeep,
          background: C.mint,
          border: `1px solid ${C.green}`,
          padding: '5px 12px',
          borderRadius: 9999,
          flexShrink: 0
        }}>
          WhatsApp
        </span>

        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, marginLeft: 4, borderLeft: `1px solid ${C.hairline}`, minWidth: 0 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 9999,
              background: C.green,
              color: C.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 16,
              flexShrink: 0
            }}>
              {(String(activeName || '#').replace(/[^A-Za-z0-9]/g, '').charAt(0) || '#').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeName}
              </div>
              <div style={{ fontSize: 11.5, color: C.inkMuted }}>+{active}</div>
            </div>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          {active && <WindowTimer lastInboundAt={lastInboundAt} />}
          <button type="button" onClick={downloadContacts} disabled={exporting} style={excelBtn}>
            📊 {exporting ? 'Preparing...' : 'Download Excel'}
          </button>
        </div>
      </header>

      {/* Main Workspace (Left Sidebar + Right Active Chat) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Contacts / Threads Sidebar */}
        <aside style={{
          width: 330,
          background: C.surface,
          borderRight: `1px solid ${C.hairline}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {/* Search Box */}
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.hairlineSoft}`, flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: 9999,
                border: `1px solid ${C.hairline}`,
                fontSize: 13,
                background: C.canvas,
                color: C.ink,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Threads List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredThreads.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>
                No WhatsApp conversations found.
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isActive = active === t._id;
                const name = t.name || t._id;
                const initial = (String(name || '#').replace(/[^A-Za-z0-9]/g, '').charAt(0) || '#').toUpperCase();
                const lastTime = t.lastAt ? new Date(t.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div
                    key={t._id}
                    onClick={() => openThread(t._id, true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${C.hairlineSoft}`,
                      background: isActive ? '#f3ede1' : 'transparent',
                      borderLeft: isActive ? `4px solid ${C.greenDeep}` : '4px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9999,
                      background: isActive ? C.green : '#e6ffda',
                      color: C.ink,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: 15,
                      flexShrink: 0
                    }}>
                      {initial}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name}
                        </span>
                        <span style={{ fontSize: 11, color: C.inkMuted, flexShrink: 0 }}>
                          {lastTime}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: C.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>
                          {t.lastBody || 'Interactive session'}
                        </span>
                        {t.unreadCount > 0 && (
                          <span style={{
                            background: C.green,
                            color: C.ink,
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 9999,
                            padding: '1px 6px',
                            minWidth: 16,
                            textAlign: 'center'
                          }}>
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Active Chat Window */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: C.canvas,
          overflow: 'hidden',
          minWidth: 0,
          position: 'relative'
        }}>
          {active ? (
            <>
              {/* Messages Stream Container (Contained Scroll, NEVER Scrolls Window) */}
              <div
                ref={chatScrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxSizing: 'border-box'
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: C.inkMuted, fontSize: 13, background: C.surface, padding: '16px 24px', borderRadius: 16, border: `1px solid ${C.hairlineSoft}` }}>
                    No messages logged yet for +{active}. Type below to send a reply!
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isOut = m.direction === 'out' || m.direction === 'outbound';
                    const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    const showDay = i === 0 || dayLabel(m.createdAt) !== dayLabel(messages[i - 1].createdAt);

                    return (
                      <React.Fragment key={m._id || i}>
                        {showDay && (
                          <div style={{ alignSelf: 'center', margin: '8px 0', fontSize: 11, fontWeight: 600, color: C.inkMuted, background: 'rgba(28,30,33,0.06)', padding: '4px 12px', borderRadius: 9999 }}>
                            {dayLabel(m.createdAt)}
                          </div>
                        )}

                        <div style={{
                          alignSelf: isOut ? 'flex-end' : 'flex-start',
                          maxWidth: '72%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOut ? 'flex-end' : 'flex-start'
                        }}>
                          {/* Bubble Container */}
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isOut ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                            background: isOut ? C.mint : C.surface,
                            color: C.ink,
                            border: `1px solid ${C.hairlineSoft}`,
                            boxShadow: '0 1px 2px rgba(28,30,33,0.06)',
                            position: 'relative',
                            wordBreak: 'break-word',
                            fontSize: 13.5,
                            lineHeight: 1.45
                          }}>
                            {/* Rich Cards if available */}
                            {m.raw?.order && <OrderCard rich={m.raw.order} />}
                            {m.raw?.location && <LocationCard rich={m.raw.location} />}
                            {m.raw?.flow && <FlowCard rich={m.raw.flow} />}
                            {m.raw?.bot && <BotCard rich={m.raw.bot} />}

                            {/* Media Attachment if present */}
                            {m.mediaUrl && !m.raw && (
                              <div style={{ marginBottom: 6, borderRadius: 10, overflow: 'hidden' }}>
                                {m.mediaUrl.endsWith('.pdf') ? (
                                  <a href={m.mediaUrl} target="_blank" rel="noreferrer" style={{ color: C.link, fontWeight: 600, fontSize: 12.5, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    📄 Attached PDF Document
                                  </a>
                                ) : (
                                  <img src={m.mediaUrl} alt="" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'cover', display: 'block', borderRadius: 10 }} />
                                )}
                              </div>
                            )}

                            {/* Plain Text Body */}
                            {!m.raw && m.body && (
                              <div dangerouslySetInnerHTML={{ __html: formatText(m.body) }} />
                            )}

                            {/* Timestamp & WhatsApp Delivery Tick */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 3,
                              marginTop: 4,
                              fontSize: 10.5,
                              color: C.inkMuted
                            }}>
                              <span>{time}</span>
                              {isOut && <DeliveryMark status={m.status} />}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Media Preview Banner if attached */}
              {mediaUrl && (
                <div style={{ padding: '8px 20px', background: C.surface, borderTop: `1px solid ${C.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.greenDeep }}>
                    📎 Media ready to send: {mediaUrl}
                  </span>
                  <button type="button" onClick={() => setMediaUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontWeight: 'bold' }}>✕</button>
                </div>
              )}

              {/* Bottom Message Input Bar */}
              <div style={{
                display: 'flex',
                gap: 10,
                padding: '14px 20px',
                background: C.surface,
                borderTop: `1px solid ${C.hairline}`,
                alignItems: 'center',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  onClick={() => { setShowTemplates(true); loadTemplates(); }}
                  style={templatesBtn}
                  title="Message templates"
                >
                  📄 Templates
                </button>

                {/* Media Attachment Upload Button */}
                <input
                  type="file"
                  id="crm-msg-file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleMediaUpload}
                  disabled={uploadingMedia}
                />
                <label
                  htmlFor="crm-msg-file"
                  style={{
                    cursor: 'pointer',
                    color: C.inkMuted,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: 9999,
                    border: `1px solid ${C.hairline}`,
                    background: C.surface,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                  title="Attach Image or PDF"
                >
                  {uploadingMedia ? '...' : '📎'}
                </label>

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message (within 24h window)..."
                  style={msgInput}
                />

                <button type="button" onClick={send} style={sendBtn}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: C.inkMuted }}>
              Select a conversation on the left to start live chat
            </div>
          )}
        </main>
      </div>

      {/* Templates Drawer (Exact FMCG Drawer) */}
      {showTemplates && (
        <TemplatesDrawer
          templates={templates}
          reload={loadTemplates}
          activePhone={active}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}

// ---- 24h customer-service window timer (red when under 10h) -----------------
function WindowTimer({ lastInboundAt }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 9999,
    fontFamily: FONT,
    flexShrink: 0
  };

  if (!lastInboundAt) {
    return (
      <span style={{ ...base, background: 'rgba(28,30,33,0.06)', color: C.inkMuted, border: `1px solid ${C.hairline}` }}>
        ⏳ No window
      </span>
    );
  }

  const remaining = new Date(lastInboundAt).getTime() + 24 * 3600 * 1000 - Date.now();
  if (remaining <= 0) {
    return (
      <span style={{ ...base, background: '#fde4e6', color: C.danger, border: '1px solid rgba(192,50,43,0.4)' }}>
        ⛔ Window closed
      </span>
    );
  }

  const danger = remaining < 10 * 3600 * 1000; // turn red under 10 hours
  const total = Math.floor(remaining / 1000);
  const hh = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  const skin = danger
    ? { background: '#fde4e6', color: C.danger, border: '1px solid rgba(192,50,43,0.5)' }
    : { background: C.mint, color: C.greenDeep, border: `1px solid ${C.green}` };

  return (
    <span style={{ ...base, ...skin }} title="WhatsApp customer-service window (24h). Turns red under 10h left.">
      ⏱ {hh}:{mm}:{ss}
    </span>
  );
}

// ---- Template status badge colors (light theme) ----------------------------
const STATUS_BADGE = {
  APPROVED: { background: C.mint, color: C.greenDeep, border: `1px solid ${C.green}` },
  PENDING: { background: '#fff5d6', color: '#9a7a1c', border: '1px solid rgba(154,122,28,0.4)' },
  REJECTED: { background: '#fde4e6', color: C.danger, border: '1px solid rgba(192,50,43,0.4)' },
  DRAFT: { background: 'rgba(28,30,33,0.05)', color: C.inkMuted, border: `1px solid ${C.hairline}` },
  PAUSED: { background: '#ffefd9', color: '#b26a00', border: '1px solid rgba(178,106,0,0.4)' },
  DISABLED: { background: '#fde4e6', color: C.danger, border: '1px solid rgba(192,50,43,0.4)' },
  IN_APPEAL: { background: '#fff5d6', color: '#9a7a1c', border: '1px solid rgba(154,122,28,0.4)' }
};

// ---- WhatsApp-style preview of a template ----------------------------------
function TemplatePreview({ t }) {
  return (
    <div style={{ background: C.canvas, borderRadius: 18, padding: 10, marginTop: 8 }}>
      <div style={{ background: C.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.hairlineSoft}` }}>
        {t.headerType === 'image' && t.headerUrl && (
          <img src={t.headerUrl} alt="" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', display: 'block' }} />
        )}
        {t.headerType === 'video' && t.headerUrl && (
          <video src={t.headerUrl} controls style={{ width: '100%', maxHeight: 160 }} />
        )}
        {t.headerType === 'document' && t.headerUrl && (
          <div style={{ padding: '8px 10px', fontSize: 12, color: C.link }}>📄 Document</div>
        )}
        {t.headerType === 'text' && t.headerText && (
          <div style={{ padding: '8px 10px 0', fontWeight: 600, fontSize: 13, color: C.ink }}>{t.headerText}</div>
        )}
        {t.body && <div style={{ padding: '8px 10px', fontSize: 13, whiteSpace: 'pre-wrap', color: C.ink }}>{t.body}</div>}
        {t.footer && <div style={{ padding: '0 10px 8px', fontSize: 11, color: C.inkMuted }}>{t.footer}</div>}
      </div>
      {(t.buttons || []).length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {t.buttons.map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 7, fontSize: 12.5, fontWeight: 600, color: C.greenDeep, background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 9999 }}>
              {b.type === 'URL' ? '🔗 ' : b.type === 'PHONE_NUMBER' ? '📞 ' : '💬 '}{b.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Templates drawer (list + create + submit/refresh/delete/send) ---------
function TemplatesDrawer({ templates, reload, activePhone, onClose }) {
  const [editing, setEditing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  async function sync() {
    setSyncing(true);
    try {
      await api.post('/crm/templates/sync', {});
      await reload();
      showToast('success', 'Synced templates from Meta.');
    } catch (e) {
      showToast('error', e.message);
    } finally {
      setSyncing(false);
    }
  }

  async function submit(id) {
    setBusyId(id);
    try {
      await api.post(`/crm/templates/${id}/submit`, {});
      await reload();
      showToast('success', 'Submitted to Meta. Approval usually takes a few minutes.');
    } catch (e) {
      showToast('error', 'Submit failed: ' + e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function refresh(id) {
    setBusyId(id);
    try {
      await api.post(`/crm/templates/${id}/refresh`, {});
      await reload();
      showToast('success', 'Refreshed status from Meta.');
    } catch (e) {
      showToast('error', 'Refresh failed: ' + e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this template?\n\nThis removes it from Meta and the panel.')) return;
    setBusyId(id);
    try {
      await api.del(`/crm/templates/${id}`);
      await reload();
      showToast('success', 'Template deleted.');
    } catch (e) {
      showToast('error', 'Delete failed: ' + e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function sendToChat(t) {
    if (!activePhone) {
      showToast('error', 'Open a chat first, then send.');
      return;
    }
    setBusyId(t._id);
    try {
      await api.post(`/crm/templates/${t._id}/send`, { phone: activePhone });
      showToast('success', 'Template sent to chat.');
      setTimeout(onClose, 600);
    } catch (e) {
      showToast('error', 'Send failed: ' + e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={drawer} onMouseDown={(e) => e.stopPropagation()}>
        <div style={drawerHeader}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Templates</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={sync} disabled={syncing} style={iconRound} title="Sync from Meta">
              {syncing ? '...' : '🔄'}
            </button>
            <button type="button" onClick={() => setEditing(true)} style={{ ...iconRound, background: C.green, color: C.ink, border: `1px solid ${C.green}` }} title="New template">
              +
            </button>
            <button type="button" onClick={onClose} style={iconRound} title="Close">
              ✕
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>
              No templates found. Click <strong>+</strong> to create a new template or 🔄 to sync from Meta.
            </div>
          )}

          {templates.map((t) => {
            const badge = STATUS_BADGE[t.status] || STATUS_BADGE.DRAFT;
            const isOpen = expandedId === t._id;

            return (
              <div key={t._id} style={{ background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpandedId(isOpen ? null : t._id)}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title || t.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.inkMuted }}>
                      {t.name} • {t.category || 'MARKETING'}
                    </div>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, ...badge }}>
                    {t.status || 'DRAFT'}
                  </span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 10 }}>
                    <TemplatePreview t={t} />

                    {t.rejectedReason && (
                      <div style={{ marginTop: 8, fontSize: 11.5, color: C.danger, background: '#fde4e6', padding: '6px 10px', borderRadius: 8 }}>
                        Reason: {t.rejectedReason}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      {(t.status === 'DRAFT' || t.status === 'REJECTED') && (
                        <button type="button" onClick={() => submit(t._id)} disabled={busyId === t._id} style={primaryMini}>
                          {busyId === t._id ? 'Submitting...' : 'Submit to Meta'}
                        </button>
                      )}
                      {t.status !== 'DRAFT' && t.status !== 'APPROVED' && (
                        <button type="button" onClick={() => refresh(t._id)} disabled={busyId === t._id} style={ghostMini}>
                          🔄 Refresh
                        </button>
                      )}
                      {t.status === 'APPROVED' && (
                        <button type="button" onClick={() => sendToChat(t)} disabled={busyId === t._id} style={primaryMini}>
                          {busyId === t._id ? 'Sending...' : 'Send to chat'}
                        </button>
                      )}
                      <button type="button" onClick={() => remove(t._id)} disabled={busyId === t._id} style={{ ...ghostMini, color: C.danger, marginLeft: 'auto' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {editing && (
          <TemplateEditor
            onClose={() => setEditing(false)}
            onCreated={async () => {
              setEditing(false);
              await reload();
            }}
          />
        )}

        {toast && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: toast.type === 'error' ? C.danger : C.greenDeep,
            zIndex: 10
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Template create form --------------------------------------------------
const TPL_LANGS = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'en', label: 'English' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' }
];

function TemplateEditor({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en_US');
  const [category, setCategory] = useState('MARKETING');
  const [headerType, setHeaderType] = useState('none');
  const [headerText, setHeaderText] = useState('');
  const [headerUrl, setHeaderUrl] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await api.postForm('/crm/templates/upload', form);
      setHeaderUrl(r.url);
    } catch (ex) {
      setErr('Upload failed: ' + ex.message);
    } finally {
      setUploading(false);
    }
  }

  function addButton() {
    if (buttons.length >= 3) return;
    setButtons((p) => [...p, { type: 'QUICK_REPLY', text: '' }]);
  }

  function updBtn(i, patch) {
    setButtons((p) => p.map((b, x) => (x === i ? { ...b, ...patch } : b)));
  }

  function rmBtn(i) {
    setButtons((p) => p.filter((_, x) => x !== i));
  }

  function validate() {
    if (!/^[a-z0-9_]{1,512}$/.test(name)) return 'Name must be lowercase letters, numbers & underscores only.';
    if (!body.trim()) return 'Body is required.';
    if (['image', 'video', 'document'].includes(headerType) && !headerUrl) return 'Upload the header media file.';
    if (headerType === 'text' && !headerText) return 'Header text is required.';
    for (const b of buttons) {
      if (!b.text) return 'All buttons need text.';
      if (b.type === 'URL' && !b.url) return 'URL button needs a URL.';
      if (b.type === 'PHONE_NUMBER' && !b.phone_number) return 'Call button needs a phone number.';
    }
    return '';
  }

  async function save(andSubmit) {
    setErr('');
    const v = validate();
    if (v) return setErr(v);
    setSubmitting(true);
    try {
      const created = await api.post('/crm/templates', {
        name,
        title: name,
        language,
        category,
        headerType,
        headerText,
        headerUrl,
        body,
        footer,
        buttons
      });
      const id = created.data?._id;
      if (andSubmit && id) {
        try {
          await api.post(`/crm/templates/${id}/submit`, {});
        } catch (ex) {
          setErr('Saved as DRAFT but Meta submission failed: ' + ex.message);
          await onCreated();
          return;
        }
      }
      await onCreated();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSubmitting(false);
    }
  }

  const chip = (on) => ({
    padding: '6px 14px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: on ? `1px solid ${C.green}` : `1px solid ${C.hairline}`,
    background: on ? C.green : C.surface,
    color: on ? C.ink : C.inkMuted
  });
  const fld = { width: '100%', marginTop: 6, padding: '10px 14px', background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 12, color: C.ink, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: FONT };
  const lbl = { fontSize: 11, color: C.inkMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.canvas, display: 'flex', flexDirection: 'column', zIndex: 8 }}>
      <div style={drawerHeader}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>New Template</div>
        <button type="button" onClick={onClose} style={iconRound}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={lbl}>Template Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              placeholder="e.g. order_confirmed"
              style={fld}
            />
          </div>
          <div style={{ width: 150 }}>
            <div style={lbl}>Language</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={fld}>
              {TPL_LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div style={lbl}>Category</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {['MARKETING', 'UTILITY', 'AUTHENTICATION'].map((c) => (
              <div key={c} onClick={() => setCategory(c)} style={chip(category === c)}>
                {c}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={lbl}>Header</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {['none', 'text', 'image', 'video', 'document'].map((h) => (
              <div key={h} onClick={() => setHeaderType(h)} style={chip(headerType === h)}>
                {h.toUpperCase()}
              </div>
            ))}
          </div>
          {headerType === 'text' && (
            <input
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              maxLength={60}
              placeholder="Header text (max 60 chars)"
              style={fld}
            />
          )}
          {['image', 'video', 'document'].includes(headerType) && (
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                📁 {uploading ? 'Uploading...' : headerUrl ? 'Replace file' : `Upload ${headerType}`}
                <input type="file" hidden accept={headerType === 'image' ? 'image/*' : headerType === 'video' ? 'video/mp4' : '.pdf'} onChange={onFile} />
              </label>
              {headerUrl && headerType === 'image' && (
                <img src={headerUrl} alt="" style={{ display: 'block', marginTop: 8, maxHeight: 130, borderRadius: 12 }} />
              )}
              {headerUrl && headerType !== 'image' && (
                <div style={{ marginTop: 8, fontSize: 12, color: C.greenDeep }}>✓ File uploaded</div>
              )}
            </div>
          )}
        </div>

        <div>
          <div style={lbl}>Body *</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Hello {{1}}, your Iris Premium water bottle order is confirmed."
            style={{ ...fld, resize: 'vertical' }}
          />
        </div>

        <div>
          <div style={lbl}>Footer (optional)</div>
          <input
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            maxLength={60}
            placeholder="e.g. Iris Premium Bottling Co."
            style={fld}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={lbl}>Buttons (up to 3)</div>
            {buttons.length < 3 && (
              <button type="button" onClick={addButton} style={{ ...ghostMini, padding: '5px 12px' }}>
                + Add
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {buttons.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={b.type} onChange={(e) => updBtn(i, { type: e.target.value })} style={{ ...fld, width: 130, marginTop: 0 }}>
                  <option value="QUICK_REPLY">Quick reply</option>
                  <option value="URL">URL</option>
                  <option value="PHONE_NUMBER">Call</option>
                </select>
                <input
                  value={b.text || ''}
                  onChange={(e) => updBtn(i, { text: e.target.value })}
                  maxLength={25}
                  placeholder="Button text"
                  style={{ ...fld, marginTop: 0, flex: 1 }}
                />
                {b.type === 'URL' && (
                  <input
                    value={b.url || ''}
                    onChange={(e) => updBtn(i, { url: e.target.value })}
                    placeholder="https://..."
                    style={{ ...fld, marginTop: 0, flex: 1 }}
                  />
                )}
                {b.type === 'PHONE_NUMBER' && (
                  <input
                    value={b.phone_number || ''}
                    onChange={(e) => updBtn(i, { phone_number: e.target.value })}
                    placeholder="+9199..."
                    style={{ ...fld, marginTop: 0, flex: 1 }}
                  />
                )}
                <button type="button" onClick={() => rmBtn(i)} style={{ ...iconRound, color: C.danger }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {err && (
          <div style={{ fontSize: 13, color: C.danger, background: '#fde4e6', border: '1px solid rgba(192,50,43,0.3)', borderRadius: 12, padding: 10 }}>
            {err}
          </div>
        )}
      </div>

      <div style={{ padding: 14, borderTop: `1px solid ${C.hairline}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={onClose} style={ghostMini}>Cancel</button>
        <button type="button" onClick={() => save(false)} disabled={submitting} style={ghostMini}>Save as Draft</button>
        <button type="button" onClick={() => save(true)} disabled={submitting} style={primaryMini}>
          {submitting ? 'Submitting...' : 'Create & Verify'}
        </button>
      </div>
    </div>
  );
}

// ---- shared styles (exact WhatsApp styling: pill radius, ink hairline, green CTA) ---------
const excelBtn = {
  background: C.green,
  color: C.ink,
  border: `1px solid ${C.ink}`,
  borderRadius: 9999,
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  fontFamily: FONT,
  whiteSpace: 'nowrap'
};

const templatesBtn = {
  background: 'transparent',
  color: C.ink,
  border: `1px solid ${C.ink}`,
  borderRadius: 9999,
  padding: '10px 18px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const msgInput = {
  flex: 1,
  padding: '11px 20px',
  background: C.canvas,
  border: `1px solid ${C.hairline}`,
  borderRadius: 9999,
  color: C.ink,
  fontSize: 13.5,
  outline: 'none',
  fontFamily: FONT
};

const sendBtn = {
  background: C.green,
  color: C.ink,
  border: `1px solid ${C.ink}`,
  borderRadius: 9999,
  padding: '11px 22px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  fontFamily: FONT
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(28,30,33,0.35)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end'
};

const drawer = {
  width: '100%',
  maxWidth: 460,
  height: '100%',
  background: C.canvas,
  borderLeft: `1px solid ${C.hairline}`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '-8px 0 24px rgba(28,30,33,0.15)',
  fontFamily: FONT,
  color: C.ink
};

const drawerHeader = {
  padding: '14px 18px',
  background: C.surface,
  borderBottom: `1px solid ${C.hairline}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: C.ink
};

const iconRound = {
  width: 36,
  height: 36,
  borderRadius: 9999,
  background: C.surface,
  color: C.ink,
  border: `1px solid ${C.hairline}`,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: FONT
};

const primaryMini = {
  background: C.green,
  color: C.ink,
  border: `1px solid ${C.ink}`,
  borderRadius: 9999,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 12.5,
  cursor: 'pointer',
  fontFamily: FONT
};

const ghostMini = {
  background: 'transparent',
  color: C.ink,
  border: `1px solid ${C.ink}`,
  borderRadius: 9999,
  padding: '8px 16px',
  fontWeight: 600,
  fontSize: 12.5,
  cursor: 'pointer',
  fontFamily: FONT
};
