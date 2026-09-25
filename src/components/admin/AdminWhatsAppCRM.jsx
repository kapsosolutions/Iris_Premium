import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../adminApi';
import { API_BASE_URL, authHeaders } from '../../config';

// ---- WhatsApp marketing design tokens (exact FMCG CRM theme) --------------
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

// ---- Crisp Professional SVG Icons (replacing all emojis) -------------------

const IconTimer = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconAlertCircle = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconExcel = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M8 13l3 4"></path>
    <path d="M11 13l-3 4"></path>
    <path d="M15 13h2"></path>
    <path d="M15 17h2"></path>
  </svg>
);

const IconTemplate = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const IconPaperclip = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const IconSend = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const IconZap = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const IconExternalLink = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const IconList = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <circle cx="4" cy="6" r="1.5" fill="currentColor"></circle>
    <circle cx="4" cy="12" r="1.5" fill="currentColor"></circle>
    <circle cx="4" cy="18" r="1.5" fill="currentColor"></circle>
  </svg>
);

const IconPhone = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const IconMessage = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconMapPin = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconReceipt = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconFile = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const IconRefresh = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const IconPlus = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconX = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconUpload = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconCheck = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconTrash = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

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

// Clean emojis from button strings so SVG icon displays crisply
function cleanButtonText(str) {
  if (!str) return '';
  const cleaned = String(str)
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, '')
    .replace(/[📱⚡🏷️🧾💬🔗📞📋]/g, '')
    .trim();
  return cleaned || str;
}

// Escape HTML then apply *bold* and _italics_ (XSS-safe)
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

// WhatsApp-style delivery ticks for outgoing messages
function DeliveryMark({ status }) {
  const Tick = ({ color, style }) => (
    <svg viewBox="0 0 16 11" width="15" height="11" style={{ display: 'block', ...style }} aria-hidden="true">
      <path d="M1 6.2 L4.1 9.3 L10.3 1.6" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const label = { sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed to send' }[status] || 'Delivered';

  if (status === 'failed') {
    return (
      <span title="Failed to send" style={{ color: C.danger, display: 'inline-flex', alignItems: 'center', marginLeft: 3 }}>
        <IconX size={11} color={C.danger} />
      </span>
    );
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

// ---- Client-side rich payload parser (ensures any message renders as rich) ---
function parseRich(m) {
  if (m.rich && typeof m.rich === 'object' && m.rich.kind) return m.rich;
  const raw = m.raw || {};
  if (raw.order) return { kind: 'order', ...raw.order };
  if (raw.location) return { kind: 'location', ...raw.location };
  if (raw.flow) return { kind: 'flow', ...raw.flow };
  if (raw.bot) return { kind: 'bot', ...raw.bot };

  const isOut = m.direction === 'out' || m.direction === 'outbound';
  const body = String(m.body || '').trim();
  const mediaUrl = m.mediaUrl || '';
  const messageType = m.messageType || m.type || '';

  if (isOut) {
    const buttons = [];
    let cta = null;
    let cleanBody = body;

    // 1. Extract [Interactive Flow Button: Title]
    const flowMatch = cleanBody.match(/\[Interactive Flow Button:\s*([^\]]+)\]/i);
    if (flowMatch) {
      buttons.push({ kind: 'flow', text: flowMatch[1].trim() });
      cleanBody = cleanBody.replace(/\[Interactive Flow Button:\s*[^\]]+\]/gi, '').trim();
    }

    // 2. Extract [Interactive Button: Title]
    const btnMatches = cleanBody.matchAll(/\[Interactive Button:\s*([^\]]+)\]/gi);
    for (const bm of btnMatches) {
      buttons.push({ kind: 'reply', text: bm[1].trim() });
    }
    cleanBody = cleanBody.replace(/\[Interactive Button:\s*[^\]]+\]/gi, '').trim();

    // 3. Extract [Interactive List: Title]
    const listMatch = cleanBody.match(/\[Interactive List:\s*([^\]]+)\]/i);
    if (listMatch) {
      buttons.push({ kind: 'list', text: listMatch[1].trim() });
      cleanBody = cleanBody.replace(/\[Interactive List:\s*[^\]]+\]/gi, '').trim();
    }

    // 4. Extract [CTA: Title | URL]
    const ctaMatch = cleanBody.match(/\[CTA:\s*([^\|\]]+)(?:\|\s*([^\]]+))?\]/i);
    if (ctaMatch) {
      cta = { text: ctaMatch[1].trim(), url: ctaMatch[2]?.trim() || '' };
      cleanBody = cleanBody.replace(/\[CTA:\s*[^\]]+\]/gi, '').trim();
    }

    // Fallback: If messageType is 'flow' and no button parsed yet
    if (messageType === 'flow' && buttons.length === 0) {
      buttons.push({ kind: 'flow', text: 'Choose Service' });
    }

    const isDoc = mediaUrl.toLowerCase().endsWith('.pdf');
    const isImg = Boolean(mediaUrl && !isDoc);

    if (isImg || isDoc || buttons.length > 0 || cta || messageType === 'flow' || messageType === 'template') {
      return {
        kind: 'bot',
        headerImageUrl: isImg ? mediaUrl : '',
        headerDocName: isDoc ? (mediaUrl.split('/').pop() || 'Document.pdf') : '',
        body: cleanBody || body,
        footer: 'Iris Premium',
        buttons,
        cta,
        listSections: raw.outbound?.listSections || []
      };
    }
  }

  // Inbound media without text
  if (!isOut && mediaUrl) {
    const isDoc = mediaUrl.toLowerCase().endsWith('.pdf');
    return {
      kind: 'bot',
      headerImageUrl: !isDoc ? mediaUrl : '',
      headerDocName: isDoc ? (mediaUrl.split('/').pop() || 'Document.pdf') : '',
      body: body,
      buttons: []
    };
  }

  return null;
}

// ---- rich renderers (SVG icons instead of emojis) --------------------------

function OrderCard({ rich }) {
  if (!rich || !rich.items) return null;
  return (
    <div style={{ minWidth: 260, maxWidth: 360, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 8, color: C.greenDeep }}>
        <IconReceipt size={16} color={C.greenDeep} />
        Order • {rich.items.length} item{rich.items.length !== 1 ? 's' : ''}
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
    <div style={{ minWidth: 220, maxWidth: 320, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 6, color: C.link }}>
        <IconMapPin size={16} color={C.link} />
        Shared location
      </div>
      {rich.name && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{rich.name}</div>}
      <div style={{ fontSize: 12.5, color: C.inkMuted, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{label}</div>
      {rich.latitude != null && <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{rich.latitude}, {rich.longitude}</div>}
      {rich.mapUrl && (
        <a href={rich.mapUrl} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: C.greenDeep, textDecoration: 'none' }}>
          <IconExternalLink size={14} color={C.greenDeep} />
          Open in Google Maps
        </a>
      )}
    </div>
  );
}

function FlowCard({ rich }) {
  if (!rich || !rich.fields?.length) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: C.ink }}>
      <IconReceipt size={14} color={C.greenDeep} />
      Form response
    </div>
  );
  return (
    <div style={{ minWidth: 240, maxWidth: 340, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 8, color: C.greenDeep }}>
        <IconReceipt size={15} color={C.greenDeep} />
        Form response
      </div>
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

// Outbound bot/agent message with SVG icons
function BotCard({ rich }) {
  if (!rich) return null;
  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    textAlign: 'center',
    padding: '10px 14px',
    fontSize: 13.5,
    fontWeight: 600,
    color: C.link,
    textDecoration: 'none',
    borderRadius: 8,
    cursor: 'default',
    background: 'transparent',
    boxSizing: 'border-box'
  };

  const renderIcon = (kind) => {
    if (kind === 'flow') return <IconZap size={15} color={C.link} />;
    if (kind === 'list') return <IconList size={15} color={C.link} />;
    if (kind === 'location') return <IconMapPin size={15} color={C.link} />;
    if (kind === 'url') return <IconExternalLink size={15} color={C.link} />;
    if (kind === 'phone' || kind === 'PHONE_NUMBER') return <IconPhone size={15} color={C.link} />;
    return <IconMessage size={15} color={C.link} />;
  };

  return (
    <div style={{ minWidth: 260, maxWidth: 380, color: C.ink }}>
      {/* Header Media Banner */}
      {rich.headerImageUrl && (
        <div style={{ margin: '-4px -4px 10px -4px', borderRadius: 12, overflow: 'hidden' }}>
          <img
            src={rich.headerImageUrl}
            alt="Header Media"
            style={{
              width: '100%',
              display: 'block',
              maxHeight: 220,
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Header Document */}
      {rich.headerDocName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(28,30,33,0.05)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 12.5, fontWeight: 600, color: C.link }}>
          <IconFile size={16} color={C.link} />
          {rich.headerDocName}
        </div>
      )}

      {/* Clean Message Body */}
      {rich.body && (
        <div
          style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.45, color: C.ink }}
          dangerouslySetInnerHTML={{ __html: formatText(rich.body) }}
        />
      )}

      {/* Footer Text */}
      {rich.footer && (
        <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 6 }}>
          {rich.footer}
        </div>
      )}

      {/* List Sections */}
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

      {/* Interactive WhatsApp Buttons with SVG Icons */}
      {(rich.buttons?.length > 0 || rich.cta) && (
        <div style={{ marginTop: 10, borderTop: `1px solid ${C.hairline}`, paddingTop: 4, display: 'flex', flexDirection: 'column' }}>
          {rich.cta && (
            rich.cta.url ? (
              <a href={rich.cta.url} target="_blank" rel="noreferrer" style={btnStyle}>
                <IconExternalLink size={15} color={C.link} />
                <span>{cleanButtonText(rich.cta.text)}</span>
              </a>
            ) : (
              <div style={btnStyle}>
                <IconExternalLink size={15} color={C.link} />
                <span>{cleanButtonText(rich.cta.text)}</span>
              </div>
            )
          )}
          {rich.buttons?.map((b, i) => (
            <div
              key={i}
              style={{
                ...btnStyle,
                borderTop: (i > 0 || rich.cta) ? `1px solid ${C.hairlineSoft}` : 'none'
              }}
            >
              {renderIcon(b.kind || b.type)}
              <span>{cleanButtonText(b.text)}</span>
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
      if (messages[i].direction === 'in' || messages[i].direction === 'inbound') return messages[i].createdAt;
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
            <IconExcel size={15} color={C.ink} />
            <span>{exporting ? 'Preparing...' : 'Download Excel'}</span>
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
              {/* Messages Stream Container */}
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
                    const rich = m.rich || parseRich(m);

                    let inner;
                    if (rich?.kind === 'order') inner = <OrderCard rich={rich} />;
                    else if (rich?.kind === 'location') inner = <LocationCard rich={rich} />;
                    else if (rich?.kind === 'flow') inner = <FlowCard rich={rich} />;
                    else if (rich?.kind === 'bot') inner = <BotCard rich={rich} />;
                    else inner = <div style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: C.ink }} dangerouslySetInnerHTML={{ __html: formatText(m.body) }} />;

                    return (
                      <React.Fragment key={m._id || i}>
                        {showDay && (
                          <div style={{ alignSelf: 'center', margin: '8px 0', fontSize: 11, fontWeight: 600, color: C.inkMuted, background: 'rgba(28,30,33,0.06)', padding: '4px 12px', borderRadius: 9999 }}>
                            {dayLabel(m.createdAt)}
                          </div>
                        )}

                        <div style={{
                          alignSelf: isOut ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOut ? 'flex-end' : 'flex-start'
                        }}>
                          {/* Bubble Container */}
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isOut ? C.mint : C.surface,
                            color: C.ink,
                            border: `1px solid ${isOut ? 'rgba(37,211,102,0.35)' : C.hairlineSoft}`,
                            boxShadow: '0 1px 2px rgba(28,30,33,0.06)'
                          }}>
                            {inner}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: C.greenDeep }}>
                    <IconPaperclip size={14} color={C.greenDeep} />
                    <span>Media attached: {mediaUrl}</span>
                  </div>
                  <button type="button" onClick={() => setMediaUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, display: 'flex', alignItems: 'center' }}>
                    <IconX size={14} color={C.danger} />
                  </button>
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
                  style={{ ...templatesBtn, display: 'flex', alignItems: 'center', gap: 6 }}
                  title="Message templates"
                >
                  <IconTemplate size={15} color={C.ink} />
                  <span>Templates</span>
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
                    padding: '9px 12px',
                    borderRadius: 9999,
                    border: `1px solid ${C.hairline}`,
                    background: C.surface,
                    fontSize: 13,
                    fontWeight: 600
                  }}
                  title="Attach Image or PDF"
                >
                  {uploadingMedia ? <IconRefresh size={16} color={C.inkMuted} /> : <IconPaperclip size={16} color={C.inkMuted} />}
                </label>

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message (within 24h window)..."
                  style={msgInput}
                />

                <button type="button" onClick={send} style={{ ...sendBtn, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconSend size={14} color={C.ink} />
                  <span>Send</span>
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

      {/* Templates Drawer */}
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

// ---- 24h customer-service window timer with SVG Icons -----------------------
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
        <IconTimer size={13} color={C.inkMuted} />
        <span>No window</span>
      </span>
    );
  }

  const remaining = new Date(lastInboundAt).getTime() + 24 * 3600 * 1000 - Date.now();
  if (remaining <= 0) {
    return (
      <span style={{ ...base, background: '#fde4e6', color: C.danger, border: '1px solid rgba(192,50,43,0.4)' }}>
        <IconAlertCircle size={13} color={C.danger} />
        <span>Window closed</span>
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
      <IconTimer size={13} color={danger ? C.danger : C.greenDeep} />
      <span>{hh}:{mm}:{ss}</span>
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

// ---- WhatsApp-style preview of a template with SVG icons -------------------
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
          <div style={{ padding: '8px 10px', fontSize: 12, color: C.link, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconFile size={14} color={C.link} />
            <span>Document</span>
          </div>
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
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: 7, fontSize: 12.5, fontWeight: 600, color: C.greenDeep, background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 9999 }}>
              {b.type === 'URL' ? <IconExternalLink size={13} color={C.greenDeep} /> : b.type === 'PHONE_NUMBER' ? <IconPhone size={13} color={C.greenDeep} /> : <IconMessage size={13} color={C.greenDeep} />}
              <span>{cleanButtonText(b.text)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Templates drawer with SVG action icons --------------------------------
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
              <IconRefresh size={14} color={C.ink} />
            </button>
            <button type="button" onClick={() => setEditing(true)} style={{ ...iconRound, background: C.green, color: C.ink, border: `1px solid ${C.green}` }} title="New template">
              <IconPlus size={14} color={C.ink} />
            </button>
            <button type="button" onClick={onClose} style={iconRound} title="Close">
              <IconX size={14} color={C.ink} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {templates.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>
              No templates found. Click <strong>+</strong> to create a new template or sync from Meta.
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
                        <button type="button" onClick={() => refresh(t._id)} disabled={busyId === t._id} style={{ ...ghostMini, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <IconRefresh size={13} color={C.ink} />
                          <span>Refresh</span>
                        </button>
                      )}
                      {t.status === 'APPROVED' && (
                        <button type="button" onClick={() => sendToChat(t)} disabled={busyId === t._id} style={primaryMini}>
                          {busyId === t._id ? 'Sending...' : 'Send to chat'}
                        </button>
                      )}
                      <button type="button" onClick={() => remove(t._id)} disabled={busyId === t._id} style={{ ...ghostMini, color: C.danger, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <IconTrash size={13} color={C.danger} />
                        <span>Delete</span>
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

// ---- Template create form with SVG icons ------------------------------------
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
        <button type="button" onClick={onClose} style={iconRound}>
          <IconX size={14} color={C.ink} />
        </button>
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
                <IconUpload size={14} color={C.ink} />
                <span>{uploading ? 'Uploading...' : headerUrl ? 'Replace file' : `Upload ${headerType}`}</span>
                <input type="file" hidden accept={headerType === 'image' ? 'image/*' : headerType === 'video' ? 'video/mp4' : '.pdf'} onChange={onFile} />
              </label>
              {headerUrl && headerType === 'image' && (
                <img src={headerUrl} alt="" style={{ display: 'block', marginTop: 8, maxHeight: 130, borderRadius: 12 }} />
              )}
              {headerUrl && headerType !== 'image' && (
                <div style={{ marginTop: 8, fontSize: 12, color: C.greenDeep, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IconCheck size={14} color={C.greenDeep} />
                  <span>File uploaded</span>
                </div>
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
              <button type="button" onClick={addButton} style={{ ...ghostMini, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconPlus size={12} color={C.ink} />
                <span>Add</span>
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
                  <IconX size={14} color={C.danger} />
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
  padding: '10px 18px',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7
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
