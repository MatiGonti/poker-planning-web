import { useState, useEffect } from 'react';
import { APP_VERSION } from '../version';
import './GameScreen.css';

const DEFAULT_VOTING_OPTIONS = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '7', '8', '10', '20', '?'];

function GameScreen({ 
  socket,
  socketConnected,
  currentUser,
  gameCode,
  gameDisplayName,
  participants, 
  currentTask, 
  votesRevealed, 
  results,
  votingOptions: votingOptionsProp,
  votingRoundKey,
  gameLog = [],
  setGameLog
}) {
  const votingOptions = Array.isArray(votingOptionsProp) && votingOptionsProp.length > 0
    ? votingOptionsProp
    : DEFAULT_VOTING_OPTIONS;
  const [myVote, setMyVote] = useState(null);
  const [showNewVotingModal, setShowNewVotingModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [copied, setCopied] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);

  const handleCopyCode = () => {
    if (!gameCode) return;
    navigator.clipboard.writeText(gameCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Reset myVote whenever a new round starts or votes are cleared (votingRoundKey bumps on voting-started and votes-cleared)
  useEffect(() => {
    setMyVote(null);
  }, [votingRoundKey]);

  const getAvatarImageUrl = (avatar) => {
    if (avatar && avatar.img) {
      return `/avatars/${avatar.img}`;
    }
    return null;
  };

  const renderAvatar = (avatar, name) => {
    const imageUrl = getAvatarImageUrl(avatar);
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={avatar.name || name}
          className="participant-avatar"
        />
      );
    }
    // Fallback for old formats or missing avatar
    return <span className="participant-avatar fallback">{name?.[0] || '?'}</span>;
  };

  const handleVote = (value) => {
    if (myVote === value) {
      setMyVote(null);
      socket.emit('retract-vote');
    } else {
      setMyVote(value);
      socket.emit('submit-vote', value);
    }
  };

  const handleStartVoting = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Task name:', taskName);
    console.log('Task name trimmed:', taskName.trim());
    console.log('Socket exists:', !!socket);
    console.log('Socket connected:', socket?.connected);
    
    if (!taskName.trim()) {
      console.error('Task name is empty!');
      return;
    }
    
    if (!socket) {
      console.error('Socket is null or undefined!');
      alert('Connection error. Please refresh the page.');
      return;
    }

    if (!socket.connected) {
      console.error('Socket is not connected!');
      alert('Not connected to server. Please refresh the page.');
      return;
    }
    
    try {
      console.log('About to emit start-voting event...');
      socket.emit('start-voting', taskName.trim());
      console.log('Event emitted successfully');
      setTaskName('');
      setShowNewVotingModal(false);
      setMyVote(null);
    } catch (error) {
      console.error('Error emitting start-voting event:', error);
      alert('Error starting voting: ' + error.message);
    }
  };

  const handleRevealVotes = () => {
    socket.emit('reveal-votes');
  };

  const handleClearVotes = () => {
    socket.emit('clear-votes');
    setMyVote(null);
  };

  const votedCount = participants.filter(p => p.voted).length;
  const totalCount = participants.length;

  return (
    <div className="game-screen">
      <header className="game-header">
        <div className="header-content">
          <h1>⚔️ Poker Planning</h1>
          <div className="header-right">
            <span className="app-version-header">v{APP_VERSION}</span>
            <div className="connection-status-game">
              {socketConnected ? (
                <span className="status-connected">● Connected</span>
              ) : (
                <span className="status-disconnected">● Disconnected</span>
              )}
            </div>
            <div className="user-info">
              {renderAvatar(currentUser.avatar, currentUser.name)}
              <span className="user-name">{currentUser.name}</span>
            </div>
          </div>
        </div>
      </header>

      {gameCode && (
        <div className="game-code-bar" title="Share this code so others can join">
          <span className="game-code-label">{gameDisplayName || gameCode}</span>
          <code className="game-code-value">{gameCode}</code>
          <button type="button" className="game-code-copy" onClick={handleCopyCode} title="Copy code">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div className="game-content">
        <aside className="participants-panel">
          <h2>
            Participants ({totalCount})
            <span className="vote-count">{votedCount}/{totalCount} voted</span>
          </h2>
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-card">
                {renderAvatar(participant.avatar, participant.name)}
                <span className="participant-name">{participant.name}</span>
                <span className={`vote-status ${participant.voted ? 'voted' : 'pending'}`}>
                  {participant.voted ? '✓' : '⏳'}
                </span>
              </div>
            ))}
          </div>
        </aside>

        <main className="voting-area">
          {currentTask ? (
            <>
              <div className="task-section">
                <h2>Current Task</h2>
                <div className="task-name">{currentTask}</div>
              </div>

              {!votesRevealed ? (
                <>
                  <div className="voting-section">
                    <h3>Cast Your Vote</h3>
                    <div className="voting-buttons">
                      {votingOptions.map((option) => (
                        <button
                          key={option}
                          className={`vote-button ${myVote === option ? 'selected' : ''}`}
                          onClick={() => handleVote(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {myVote && (
                      <p className="vote-confirmation">
                        You voted: <strong>{myVote}</strong>
                        <span className="vote-unvote-hint"> — click it again to unvote</span>
                      </p>
                    )}
                  </div>

                  <div className="controls">
                    <button 
                      className="control-button reveal"
                      onClick={handleRevealVotes}
                      disabled={votedCount === 0}
                    >
                      Show Results
                    </button>
                    <button 
                      className="control-button clear"
                      onClick={handleClearVotes}
                    >
                      Cancel voting
                    </button>
                    <button 
                      className="control-button new"
                      onClick={() => setShowNewVotingModal(true)}
                    >
                      New Voting Round
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="results-section">
                    <h2>Results</h2>
                    
                    <div className="stats">
                      <div className="stat-card">
                        <div className="stat-label">Average</div>
                        <div className="stat-value">{results?.average || 'N/A'}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Median</div>
                        <div className="stat-value">{results?.median || 'N/A'}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Total Votes</div>
                        <div className="stat-value">{results?.totalVotes || 0}</div>
                      </div>
                    </div>

                    <div className="votes-list">
                      <h3>All Votes</h3>
                      {results?.votes.map((vote) => (
                        <div key={vote.id} className="vote-item">
                          {renderAvatar(vote.avatar, vote.name)}
                          <span className="vote-name">{vote.name}</span>
                          <span className="vote-value">{vote.vote}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="controls">
                    <button 
                      className="control-button clear"
                      onClick={handleClearVotes}
                    >
                      Clear Results
                    </button>
                    <button 
                      className="control-button new"
                      onClick={() => setShowNewVotingModal(true)}
                    >
                      New Voting Round
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="no-task">
              <h2>No Active Voting</h2>
              <p>Start a new voting round to begin</p>
              <button 
                className="control-button new large"
                onClick={() => setShowNewVotingModal(true)}
              >
                Start New Voting Round
              </button>
            </div>
          )}
        </main>
      </div>

      <div className="game-log-section">
        <button
          type="button"
          className="game-log-toggle"
          onClick={() => setLogExpanded((e) => !e)}
          aria-expanded={logExpanded}
        >
          <span className="game-log-toggle-icon">{logExpanded ? '▼' : '▶'}</span>
          Game log ({gameLog.length})
        </button>
        {logExpanded && (
          <div className="game-log-list">
            {gameLog.length === 0 ? (
              <p className="game-log-empty">No events yet.</p>
            ) : (
              gameLog.map((entry, i) => (
                <div key={i} className="game-log-entry">
                  {entry.type === 'joined' && <><span className="game-log-name">{entry.name}</span> joined</>}
                  {entry.type === 'left' && <><span className="game-log-name">{entry.name}</span> left</>}
                  {entry.type === 'voted' && <><span className="game-log-name">{entry.name}</span> voted</>}
                  {entry.type === 'retracted-vote' && <><span className="game-log-name">{entry.name}</span> revoked vote</>}
                  {entry.type === 'revealed-results' && <><span className="game-log-name">{entry.name}</span> showed results</>}
                  {entry.type === 'cleared-results' && <><span className="game-log-name">{entry.name}</span> cleared results</>}
                  {entry.type === 'started-voting' && <><span className="game-log-name">{entry.name}</span> started voting: {entry.taskName || '—'}</>}
                  {!['joined', 'left', 'voted', 'retracted-vote', 'revealed-results', 'cleared-results', 'started-voting'].includes(entry.type) && (
                    <><span className="game-log-name">{entry.name}</span>: {entry.type}</>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showNewVotingModal && (
        <div className="modal-overlay" onClick={() => setShowNewVotingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Start New Voting Round</h2>
            <form onSubmit={handleStartVoting}>
              <label htmlFor="taskName">Task Name / Story Number</label>
              <input
                type="text"
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., US-123 or Feature Name"
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" className="cancel-button" onClick={() => setShowNewVotingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Start Voting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameScreen;
