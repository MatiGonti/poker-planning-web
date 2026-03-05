import { useState } from 'react';
import './JoinScreen.css';

// Lord of the Rings inspired color palette with heraldic styles
const AVATAR_COLORS = [
  { bg: '#2F4F2F', text: '#E8F5E9', name: 'Forest', heraldic: 'shield' },
  { bg: '#8B4513', text: '#FFF8DC', name: 'Earth', heraldic: 'banner' },
  { bg: '#4A5568', text: '#E2E8F0', name: 'Mithril', heraldic: 'crown' },
  { bg: '#7C2D12', text: '#FEF2F2', name: 'Gondor', heraldic: 'tower' },
  { bg: '#1E3A5F', text: '#DBEAFE', name: 'Rivendell', heraldic: 'star' },
  { bg: '#92400E', text: '#FEF3C7', name: 'Bronze', heraldic: 'diamond' },
  { bg: '#5D4E37', text: '#FEF3C7', name: 'Rohan', heraldic: 'chevron' },
  { bg: '#6B4423', text: '#FFF7ED', name: 'Dwarven', heraldic: 'double' },
  { bg: '#3F3F46', text: '#E4E4E7', name: 'Iron', heraldic: 'cross' },
  { bg: '#4C1D95', text: '#EDE9FE', name: 'Wizard', heraldic: 'ornate' },
  { bg: '#831843', text: '#FCE7F3', name: 'Wine', heraldic: 'royal' },
  { bg: '#064E3B', text: '#D1FAE5', name: 'Emerald', heraldic: 'leaf' },
];

function JoinScreen({ onJoin, socketConnected }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!selectedAvatar) {
      setError('Please select a heraldic color');
      return;
    }

    if (!socketConnected) {
      setError('Connecting to server... Please wait');
      return;
    }
    
    onJoin(name.trim(), selectedAvatar);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="join-screen">
      <div className="join-container">
        <div className="join-header">
          <h1>⚔️ Poker Planning</h1>
          <p className="subtitle">Forge your estimates together</p>
        </div>
        
        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Choose Your Heraldic Banner</label>
            {name && selectedAvatar && (
              <div className="avatar-preview-section">
                <div className="avatar-preview">
                  <div 
                    className={`preview-avatar heraldic-${selectedAvatar.heraldic}`}
                    style={{ 
                      backgroundColor: selectedAvatar.bg,
                      color: selectedAvatar.text
                    }}
                  >
                    <div className="heraldic-inner">
                      {getInitials(name)}
                    </div>
                  </div>
                  <span className="preview-label">{selectedAvatar.name} Banner</span>
                </div>
              </div>
            )}
            <div className="color-grid">
              {AVATAR_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`color-option heraldic-${color.heraldic} ${selectedAvatar === color ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAvatar(color);
                    setError('');
                  }}
                  style={{ 
                    backgroundColor: color.bg,
                    color: color.text
                  }}
                  title={`${color.name} Banner`}
                >
                  <div className="heraldic-inner">
                    {name ? getInitials(name) : '•'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="connection-status">
            {socketConnected ? (
              <span className="status-connected">● Connected to server</span>
            ) : (
              <span className="status-connecting">● Connecting to server...</span>
            )}
          </div>

          <button type="submit" className="join-button" disabled={!socketConnected}>
            {socketConnected ? 'Join Session' : 'Connecting...'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinScreen;
