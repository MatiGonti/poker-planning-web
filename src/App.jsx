import { useState, useEffect } from 'react';
import JoinScreen from './components/JoinScreen';
import GameScreen from './components/GameScreen';
import { initializeSocket } from './socket';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [gameDisplayName, setGameDisplayName] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [results, setResults] = useState(null);

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

    newSocket.on('game-state', (state) => {
      console.log('Received game-state:', state);
      if (state.gameCode) setGameCode(state.gameCode);
      if (state.displayName) setGameDisplayName(state.displayName);
      setParticipants(state.participants || []);
      setCurrentTask(state.currentTask || '');
      setVotesRevealed(state.votesRevealed || false);
      setResults(state.results || null);
      setJoined(true);
    });

    newSocket.on('join-error', ({ message }) => {
      console.error('Join error:', message);
      setJoined(false);
      setCurrentUser(null);
      setGameCode(null);
      setGameDisplayName(null);
      alert(message || 'Could not join game.');
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
    });

    // Don't disconnect on unmount during development
    // return () => {
    //   console.log('Disconnecting socket...');
    //   newSocket.disconnect();
    // };
  }, []);

  const handleJoin = (name, avatar, gameCodeToJoin) => {
    if (!socket) {
      console.error('Socket is null!');
      alert('Connection error. Please refresh the page.');
      return;
    }

    setCurrentUser({ name, avatar });
    const payload = gameCodeToJoin
      ? { name, avatar, gameCode: gameCodeToJoin }
      : { name, avatar };

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
    return <JoinScreen onJoin={handleJoin} socketConnected={socketConnected} />;
  }

  return (
    <GameScreen
      socket={socket}
      socketConnected={socketConnected}
      currentUser={currentUser}
      gameCode={gameCode}
      gameDisplayName={gameDisplayName}
      participants={participants}
      currentTask={currentTask}
      votesRevealed={votesRevealed}
      results={results}
    />
  );
}

export default App;
