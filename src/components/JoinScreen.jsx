import { useState } from 'react';
import { APP_VERSION } from '../version';
import './JoinScreen.css';

const AVATARS = [
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
  { id: 26, img: 'avatar-26-tracksuit.png', name: 'Tracksuit Boss' },
  { id: 27, img: 'avatar-27-babushka.png', name: 'Angry Babushka' },
  { id: 28, img: 'avatar-28-woodsman.png', name: 'Grumpy Woodsman' },
  { id: 29, img: 'avatar-29-pierogi.png', name: 'Pierogi Guard' },
  { id: 30, img: 'avatar-30-no-neighbor.png', name: 'No Neighbor' },
  { id: 31, img: 'avatar-31-bug-hunter-cat.png', name: 'Bug Hunter Cat' },
  { id: 32, img: 'avatar-32-fine-dog.png', name: 'Fine Dog' },
  { id: 33, img: 'avatar-33-log-squirrel.png', name: 'Log Squirrel' },
  { id: 34, img: 'avatar-34-release-sloth.png', name: 'Release Sloth' },
  { id: 35, img: 'avatar-35-rubber-duck-boss.png', name: 'Rubber Duck Boss' },
  { id: 36, img: 'avatar-36-ogre.png', name: 'Hungry Ogre' },
  { id: 37, img: 'avatar-37-commando.png', name: 'Alpha Male Commando' },
  { id: 38, img: 'avatar-38-superhero.png', name: 'Galactic Superhero' }  
];

function JoinScreen({ onJoin, socketConnected }) {
  const [mode, setMode] = useState('join'); // 'join' | 'create'
  const [gameCode, setGameCode] = useState('');
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
    if (mode === 'join' && !gameCode.trim()) {
      setError('Please enter the game code');
      return;
    }
    if (!socketConnected) {
      setError('Connecting to server... Please wait');
      return;
    }
    const codeForJoin = mode === 'join' ? gameCode.trim() : null;
    onJoin(name.trim(), selectedAvatar, codeForJoin);
  };

  const getAvatarImageUrl = (avatar) => `/avatars/${avatar.img}`;

  return (
    <div className="join-screen">
      <div className="join-container">
        <div className="join-header">
          <h1>⚔️ Poker Planning</h1>
          <p className="subtitle">Choose your path</p>
        </div>

        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'join' ? 'active' : ''}`}
            onClick={() => {
              setMode('join');
              setError('');
            }}
          >
            Join game
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => {
              setMode('create');
              setError('');
            }}
          >
            Create new game
          </button>
        </div>

        <form onSubmit={handleSubmit} className="join-form">
          {mode === 'join' && (
            <div className="form-group">
              <label htmlFor="gameCode">Game code</label>
              <input
                type="text"
                id="gameCode"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value);
                  setError('');
                }}
                placeholder="e.g. second-breakfast"
                maxLength={40}
                autoComplete="off"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Your name</label>
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
              autoFocus={mode === 'create'}
            />
          </div>

          <div className="form-group">
            <label>Choose your avatar</label>
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
            {socketConnected
              ? mode === 'join'
                ? 'Join game'
                : 'Create new game'
              : 'Connecting...'}
          </button>

          <div className="app-version">v{APP_VERSION}</div>
        </form>
      </div>
    </div>
  );
}

export default JoinScreen;
