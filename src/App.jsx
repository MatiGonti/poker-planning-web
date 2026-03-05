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
      setParticipants(state.participants);
      setCurrentTask(state.currentTask);
      setVotesRevealed(state.votesRevealed);
      setResults(state.results);
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

  const handleJoin = (name, avatar) => {
    if (!socket) {
      console.error('Socket is null!');
      alert('Connection error. Please refresh the page.');
      return;
    }

    console.log('Attempting to join game. Socket connected:', socket.connected);
    setCurrentUser({ name, avatar });
    
    if (socket.connected) {
      // Already connected, join immediately
      console.log('Socket already connected, emitting join-game');
      socket.emit('join-game', { name, avatar });
      setJoined(true);
    } else {
      // Wait for connection before joining
      console.log('Socket not connected yet, waiting for connection...');
      
      const connectTimeout = setTimeout(() => {
        alert('Could not connect to server. Please check if the backend is running on port 3000 and refresh the page.');
        setCurrentUser(null);
      }, 10000);
      
      socket.once('connect', () => {
        clearTimeout(connectTimeout);
        console.log('Socket connected! Now emitting join-game');
        socket.emit('join-game', { name, avatar });
        setJoined(true);
      });
    }
  };

  if (!joined) {
    return <JoinScreen onJoin={handleJoin} socketConnected={socketConnected} />;
  }

  return (
    <GameScreen
      socket={socket}
      currentUser={currentUser}
      participants={participants}
      currentTask={currentTask}
      votesRevealed={votesRevealed}
      results={results}
    />
  );
}

export default App;
