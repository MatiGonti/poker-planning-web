import { useState, useEffect, useRef } from 'react';
import JoinScreen from './components/JoinScreen';
import GameScreen from './components/GameScreen';
import { initializeSocket, getBackendUrl } from './socket';
import './App.css';

const HEALTH_CHECK_INTERVAL_MS = 5000;

function App() {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [serverHealthy, setServerHealthy] = useState(true);
  const [joined, setJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [gameDisplayName, setGameDisplayName] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [results, setResults] = useState(null);
  const [votingOptions, setVotingOptions] = useState(null);
  const [votingRoundKey, setVotingRoundKey] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    console.log('Initializing socket...');
    const newSocket = initializeSocket();
    console.log('Socket initialized:', newSocket);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected! ID:', newSocket.id);
      setSocketConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    // Health check every 5s so we detect when backend is down even if socket still thinks it's connected
    const checkHealth = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/health`, { method: 'GET' });
        setServerHealthy(res.ok);
      } catch {
        setServerHealthy(false);
      }
    };
    checkHealth();
    const healthInterval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS);

    newSocket.on('game-state', (state) => {
      console.log('Received game-state:', state);
      if (state.gameCode) setGameCode(state.gameCode);
      if (state.displayName) setGameDisplayName(state.displayName);
      setParticipants(state.participants || []);
      setCurrentTask(state.currentTask || '');
      setVotesRevealed(state.votesRevealed || false);
      setResults(state.results || null);
      setVotingOptions(state.votingOptions || null);
      setGameLog(Array.isArray(state.gameLog) ? state.gameLog : []);
      setJoined(true);
    });

    newSocket.on('game-log', (entry) => {
      setGameLog((prev) => {
        const last = prev[prev.length - 1];
        const isDuplicate =
          last &&
          last.type === entry.type &&
          last.name === entry.name &&
          (last.taskName ?? '') === (entry.taskName ?? '');
        if (isDuplicate) return prev;
        return [...prev.slice(-99), entry];
      });
    });

    newSocket.on('join-error', ({ message }) => {
      console.error('Join error:', message);
      setJoined(false);
      setCurrentUser(null);
      setGameCode(null);
      setGameDisplayName(null);
      setJoinError(message || 'Could not join game.');
    });

    newSocket.on('game-closed', ({ message }) => {
      setJoined(false);
      setCurrentUser(null);
      setGameCode(null);
      setGameDisplayName(null);
      setParticipants([]);
      setCurrentTask('');
      setVotesRevealed(false);
      setResults(null);
      alert(message || 'The game was closed.');
    });

    newSocket.on('participants-updated', (updatedParticipants) => {
      console.log('Received participants-updated:', updatedParticipants);
      setParticipants(updatedParticipants);
    });

    newSocket.on('voting-started', (data) => {
      console.log('Received voting-started event:', data);
      setCurrentTask(data.taskName);
      setVotesRevealed(false);
      setResults(null);
      setParticipants(data.participants);
      setVotingRoundKey((k) => k + 1);
    });

    newSocket.on('votes-revealed', (revealedResults) => {
      console.log('Received votes-revealed:', revealedResults);
      setVotesRevealed(true);
      setResults(revealedResults);
    });

    newSocket.on('votes-cleared', (data) => {
      console.log('Received votes-cleared:', data);
      setCurrentTask('');
      setVotesRevealed(false);
      setResults(null);
      setParticipants(data.participants);
      setVotingRoundKey((k) => k + 1);
    });

    return () => {
      clearInterval(healthInterval);
      newSocket.off('connect').off('connect_error').off('disconnect');
      newSocket.off('game-state').off('game-log').off('join-error').off('game-closed');
      newSocket.off('participants-updated').off('voting-started').off('votes-revealed').off('votes-cleared');
    };
  }, []);

  const connectionOk = socketConnected && serverHealthy;
  const wasDisconnectedRef = useRef(false);

  // Auto-rejoin when connection is restored while on the game screen
  useEffect(() => {
    if (!connectionOk) {
      wasDisconnectedRef.current = true;
      return;
    }
    if (joined && gameCode && currentUser && socket?.connected && wasDisconnectedRef.current) {
      socket.emit('join-game', {
        gameCode,
        name: currentUser.name,
        avatar: currentUser.avatar,
      });
      wasDisconnectedRef.current = false;
    }
  }, [connectionOk, joined, gameCode, currentUser, socket]);

  const handleJoin = (name, avatar, gameCodeToJoin, scaleForCreate) => {
    if (!socket) {
      console.error('Socket is null!');
      alert('Connection error. Please refresh the page.');
      return;
    }

    setCurrentUser({ name, avatar });
    const payload = gameCodeToJoin
      ? { name, avatar, gameCode: gameCodeToJoin }
      : { name, avatar, scale: scaleForCreate };

    if (socket.connected) {
      socket.emit('join-game', payload);
    } else {
      const connectTimeout = setTimeout(() => {
        alert('Could not connect to server. Please check if the backend is running and refresh the page.');
        setCurrentUser(null);
      }, 10000);
      socket.once('connect', () => {
        clearTimeout(connectTimeout);
        socket.emit('join-game', payload);
      });
    }
  };

  if (!joined) {
    return (
      <JoinScreen
        onJoin={handleJoin}
        socketConnected={connectionOk}
        serverError={joinError}
        onClearServerError={() => setJoinError(null)}
      />
    );
  }

  return (
    <GameScreen
      socket={socket}
      socketConnected={connectionOk}
      currentUser={currentUser}
      gameCode={gameCode}
      gameDisplayName={gameDisplayName}
      participants={participants}
      currentTask={currentTask}
      votesRevealed={votesRevealed}
      results={results}
      votingOptions={votingOptions}
      votingRoundKey={votingRoundKey}
      gameLog={gameLog}
      setGameLog={setGameLog}
    />
  );
}

export default App;
