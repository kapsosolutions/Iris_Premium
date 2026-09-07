import React, { useState, useEffect, useRef } from 'react';

export default function AdminWhatsAppCRM({ isFullView = false }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', '24h'
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  const EMOJI_LIST = ['❤️', '👍', '😂', '😮', '😢', '🙏', '👏', '🔥', '🎉', '🍾', '✨', '📦'];

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 5000); // Auto-refresh contacts every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.phone);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/crm/contacts');
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
        if (!selectedContact && data.data.length > 0) {
          setSelectedContact(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading CRM contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (phone) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/crm/messages/${phone}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedMediaUrl) || !selectedContact || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/crm/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedContact.phone,
          body: inputText,
          mediaUrl: selectedMediaUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setInputText('');
        setSelectedMediaUrl('');
        setShowEmojiPicker(false);
        fetchMessages(selectedContact.phone);
        fetchContacts();
      } else {
        alert(data.message || 'Failed to send WhatsApp message');
      }
    } catch (err) {
      alert('Error sending message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleMediaUpload = async (file) => {
    if (!file) return;
    setUploadingMedia(true);
    const token = localStorage.getItem('adminToken');
    const csrfToken = localStorage.getItem('csrfToken');

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
        setSelectedMediaUrl(data.url);
      } else {
        alert(data.message || 'Media upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddReaction = async (messageId, reaction) => {
    try {
      const res = await fetch('/api/crm/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, reaction })
      });
      const data = await res.json();
      if (data.success && selectedContact) {
        fetchMessages(selectedContact.phone);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (phone, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the complete WhatsApp chat history for +${phone}?`)) return;

    try {
      const res = await fetch(`/api/crm/chat/${phone}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (selectedContact?.phone === phone) {
          setSelectedContact(null);
          setMessages([]);
        }
        fetchContacts();
      }
    } catch (err) {
      alert('Error deleting chat history: ' + err.message);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    if (activeFilter === 'unread') return matchesSearch && c.unreadCount > 0;
    if (activeFilter === '24h') return matchesSearch && c.windowStatus?.type === '24h';
    return matchesSearch;
  });

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f0f2f5',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* Main CRM Workspace (Left Sidebar 300px + Right Chat Window) */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        overflow: 'hidden',
        height: '100%',
        margin: 0,
        borderRadius: 0,
        backgroundColor: '#ffffff'
      }}>
        
        {/* Left Contacts List Sidebar */}
        <div style={{
          borderRight: '1px solid #e9edef',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          height: '100%',
          overflow: 'hidden'
        }}>
          
          {/* Contacts Search Bar */}
          <div style={{ padding: '10px 14px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e9edef', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#00a884', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111b21' }}>WhatsApp CRM</span>
              </div>
              <button
                onClick={fetchContacts}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54656f', fontSize: '12px' }}
                title="Sync Contacts"
              >
                🔄
              </button>
            </div>

            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e9edef',
                fontSize: '12px',
                backgroundColor: '#ffffff',
                outline: 'none'
              }}
            />

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {['all', 'unread', '24h'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: activeFilter === f ? '#00a884' : '#e9edef',
                    color: activeFilter === f ? '#ffffff' : '#54656f',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : '24h Active'}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts Feed */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContacts ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#667781', fontSize: '12px' }}>Syncing chats...</div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#667781', fontSize: '12px' }}>
                No conversations found.
              </div>
            ) : (
              filteredContacts.map(c => {
                const isSelected = selectedContact?.phone === c.phone;
                const avatarInitial = (c.name || 'W').charAt(0).toUpperCase();

                return (
                  <div
                    key={c.phone}
                    onClick={() => setSelectedContact(c)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid #f0f2f5',
                      backgroundColor: isSelected ? '#f0f2f5' : '#ffffff',
                      borderLeft: isSelected ? '3px solid #00a884' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* Contact Avatar Circle */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#00a884' : '#6b7c85',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      flexShrink: 0
                    }}>
                      {avatarInitial}
                    </div>

                    {/* Contact Meta Info */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#111b21', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </h4>
                        <span style={{ fontSize: '10px', color: '#667781' }}>
                          {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#0071e3', fontWeight: 500, marginBottom: '2px' }}>
                        +{c.phone}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#667781', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                          {c.lastMessage}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {c.unreadCount > 0 && (
                            <span style={{ backgroundColor: '#25d366', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', padding: '1px 5px' }}>
                              {c.unreadCount}
                            </span>
                          )}

                          <button
                            onClick={e => handleDeleteChat(c.phone, e)}
                            title="Delete Chat Thread"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', padding: '1px', opacity: 0.7 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat View Window */}
        {selectedContact ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#efeae2', position: 'relative', overflow: 'hidden' }}>
            
            {/* Active Contact Header Bar */}
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f0f2f5',
              borderBottom: '1px solid #e9edef',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#00a884', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                  {(selectedContact.name || 'W').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111b21', margin: 0 }}>
                    {selectedContact.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#0071e3', fontWeight: 500 }}>
                    WhatsApp: +{selectedContact.phone}
                  </span>
                </div>
              </div>

              {/* Dynamic Session Window Pill Badge (Red when < 10h left!) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: `${selectedContact.windowStatus?.color}15`,
                  color: selectedContact.windowStatus?.color,
                  border: `1px solid ${selectedContact.windowStatus?.color}40`
                }}>
                  {selectedContact.windowStatus?.label}
                </span>
              </div>
            </div>

            {/* Chat Stream Bubble Wallpaper Area */}
            <div style={{
              flex: 1,
              padding: '16px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', color: '#667781', fontSize: '12px', margin: 'auto' }}>Loading chat history...</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#667781', fontSize: '12px', margin: 'auto', backgroundColor: '#ffffff', padding: '14px 20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  No messages logged yet for +{selectedContact.phone}. Type your message below to reply!
                </div>
              ) : (
                messages.map(m => {
                  const isInbound = m.direction === 'inbound';
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: isInbound ? 'flex-start' : 'flex-end',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isInbound ? 'flex-start' : 'flex-end'
                      }}
                    >
                      {/* Message Bubble Container */}
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: isInbound ? '0px 10px 10px 10px' : '10px 0px 10px 10px',
                        backgroundColor: isInbound ? '#ffffff' : '#d9fdd3',
                        color: '#111b21',
                        boxShadow: '0 1px 2px rgba(11,20,26,0.12)',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        position: 'relative'
                      }}>
                        {/* Header Image if message has Media */}
                        {m.mediaUrl && (
                          <div style={{ marginBottom: '6px', overflow: 'hidden', borderRadius: '6px' }}>
                            {m.mediaUrl.endsWith('.pdf') ? (
                              <a href={m.mediaUrl} target="_blank" rel="noreferrer" style={{ color: '#0071e3', fontWeight: 600, fontSize: '12px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📄 Attached PDF Document
                              </a>
                            ) : (
                              <img src={m.mediaUrl} alt="Attached Header Media" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                            )}
                          </div>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>

                        {/* Reaction Badge if present */}
                        {m.reaction && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: isInbound ? '6px' : 'auto',
                            left: isInbound ? 'auto' : '6px',
                            backgroundColor: '#ffffff',
                            padding: '1px 4px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                            border: '1px solid #e9edef'
                          }}>
                            {m.reaction}
                          </div>
                        )}

                        {/* Timestamp & Double Checkmarks */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px', fontSize: '10px', color: '#667781' }}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {!isInbound && (
                            <span style={{ color: '#53bdeb', fontWeight: 'bold' }}>✓✓</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Emoji Reaction Buttons */}
                      <div style={{ display: 'flex', gap: '2px', marginTop: '2px', opacity: 0.6 }}>
                        {['❤️', '👍', '😂', '😮'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(m._id, emoji)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '1px 2px' }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached Media Banner if uploaded */}
            {selectedMediaUrl && (
              <div style={{ padding: '6px 16px', backgroundColor: '#ffffff', borderTop: '1px solid #e9edef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#0071e3', fontWeight: 600 }}>
                  📷 Media Attached Ready to Send: {selectedMediaUrl}
                </span>
                <button onClick={() => setSelectedMediaUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea4335', fontWeight: 'bold' }}>✕</button>
              </div>
            )}

            {/* Emoji Quick Drawer */}
            {showEmojiPicker && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e9edef',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                flexShrink: 0
              }}>
                {EMOJI_LIST.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setInputText(prev => prev + emoji)}
                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Composer Input Bar */}
            <form onSubmit={handleSendMessage} style={{
              padding: '10px 16px',
              backgroundColor: '#f0f2f5',
              borderTop: '1px solid #e9edef',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0
            }}>
              {/* Emoji Picker Toggle */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#54656f' }}
              >
                😊
              </button>

              {/* Media Upload Attachment */}
              <input
                type="file"
                id="crm-file-input"
                accept="image/*,application/pdf"
                onChange={e => handleMediaUpload(e.target.files[0])}
                disabled={uploadingMedia}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="crm-file-input"
                style={{ cursor: 'pointer', color: '#54656f', display: 'flex', alignItems: 'center' }}
                title="Attach photo or PDF document to send on WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              </label>

              {/* Text Input Area */}
              <input
                type="text"
                placeholder={selectedContact.windowStatus?.active ? "Type message to reply directly on WhatsApp..." : "Note: 24h Window closed. Message will attempt Meta Template routing..."}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={sending || uploadingMedia}
                style={{
                  backgroundColor: '#00a884',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#667781', backgroundColor: '#f0f2f5' }}>
            Select a WhatsApp conversation on the left to start live chat
          </div>
        )}

      </div>
    </div>
  );
}
