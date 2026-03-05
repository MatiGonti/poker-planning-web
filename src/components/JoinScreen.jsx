import { useState } from 'react';
import './JoinScreen.css';

// Avatar configurations - individual image files
const AVATARS = [
  // 🌍 25 Countries
  { id: 1, img: 'avatar-01-uk.png', name: 'UK Bulldog' },
  { id: 2, img: 'avatar-02-france.png', name: 'French Mime' },
  { id: 3, img: 'avatar-03-germany.png', name: 'German Beer' },
  { id: 4, img: 'avatar-04-usa.png', name: 'USA Tourist' },
  { id: 5, img: 'avatar-05-canada.png', name: 'Canadian Beaver' },
  { id: 6, img: 'avatar-06-italy.png', name: 'Italian Chef' },
  { id: 7, img: 'avatar-07-japan.png', name: 'Japanese Zen' },
  { id: 8, img: 'avatar-08-mexico.png', name: 'Mexican Mariachi' },
  { id: 9, img: 'avatar-09-brazil.png', name: 'Brazilian Soccer' },
  { id: 10, img: 'avatar-10-australia.png', name: 'Aussie Ranger' },
  { id: 11, img: 'avatar-11-spain.png', name: 'Spanish Siesta' },
  { id: 12, img: 'avatar-12-china.png', name: 'Chinese Tea' },
  { id: 13, img: 'avatar-13-india.png', name: 'Indian Cricket' },
  { id: 14, img: 'avatar-14-sweden.png', name: 'Swedish Viking' },
  { id: 15, img: 'avatar-15-netherlands.png', name: 'Dutch Cyclist' },
  { id: 16, img: 'avatar-16-ireland.png', name: 'Irish Leprechaun' },
  { id: 17, img: 'avatar-17-greece.png', name: 'Greek Philosopher' },
  { id: 18, img: 'avatar-18-egypt.png', name: 'Egyptian Camel' },
  { id: 19, img: 'avatar-19-switzerland.png', name: 'Swiss Hiker' },
  { id: 20, img: 'avatar-20-thailand.png', name: 'Thai Tiger' },
  { id: 21, img: 'avatar-21-norway.png', name: 'Norwegian Penguin' },
  { id: 22, img: 'avatar-22-argentina.png', name: 'Argentine Tango' },
  { id: 23, img: 'avatar-23-turkey.png', name: 'Turkish Kebab' },
  { id: 24, img: 'avatar-24-peru.png', name: 'Peruvian Llama' },
  { id: 25, img: 'avatar-25-korea.png', name: 'Korean K-Pop' },
  // 💢 5 Angry Slavic Persons
  { id: 26, img: 'avatar-26-tracksuit.png', name: 'Tracksuit Boss' },
  { id: 27, img: 'avatar-27-babushka.png', name: 'Angry Babushka' },
  { id: 28, img: 'avatar-28-woodsman.png', name: 'Grumpy Woodsman' },
  { id: 29, img: 'avatar-29-pierogi.png', name: 'Pierogi Guard' },
  { id: 30, img: 'avatar-30-no-neighbor.png', name: 'No Neighbor' },
  // 🤡 5 Funny Animals (IT/Work Set)
  { id: 31, img: 'avatar-31-bug-hunter-cat.png', name: 'Bug Hunter Cat' },
  { id: 32, img: 'avatar-32-fine-dog.png', name: 'Fine Dog' },
  { id: 33, img: 'avatar-33-log-squirrel.png', name: 'Log Squirrel' },
  { id: 34, img: 'avatar-34-release-sloth.png', name: 'Release Sloth' },
  { id: 35, img: 'avatar-35-rubber-duck-boss.png', name: 'Rubber Duck Boss' },
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
      setError('Please select an avatar');
      return;
    }

    if (!socketConnected) {
      setError('Connecting to server... Please wait');
      return;
    }
    
    onJoin(name.trim(), selectedAvatar);
  };

  const getAvatarImageUrl = (avatar) => {
    return `/avatars/${avatar.img}`;
  };

  return (
    <div className="join-screen">
      <div className="join-container">
        <div className="join-header">
          <h1>⚔️ Poker Planning</h1>
          <p className="subtitle">Choose your character</p>
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
            <label>Choose Your Avatar</label>
            {selectedAvatar && (
              <div className="avatar-preview-section">
                <div className="avatar-preview">
                  <img 
                    src={getAvatarImageUrl(selectedAvatar)} 
                    alt={selectedAvatar.name}
                    className="preview-avatar"
                  />
                  <span className="preview-label">{selectedAvatar.name}</span>
                </div>
              </div>
            )}
            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`avatar-option ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setError('');
                  }}
                  title={avatar.name}
                >
                  <img 
                    src={getAvatarImageUrl(avatar)} 
                    alt={avatar.name}
                    className="avatar-image"
                  />
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
