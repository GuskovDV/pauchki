import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';

const App = () => {
  const [started, setStarted] = useState(false);
  const [playerEmoji, setPlayerEmoji] = useState('🧙‍♂️');
  const [bulletEmoji, setBulletEmoji] = useState('•');
  const [cellSize, setCellSize] = useState(32);
  const [levelIndex, setLevelIndex] = useState(0);

  const handleGameStart = (character: string, weapon: string, size: number) => {
    setPlayerEmoji(character);
    setBulletEmoji(weapon);
    setCellSize(size);
    setStarted(true);
  };

  const handleGameEnd = () => {
    setStarted(false);
    setLevelIndex(0);
  };

  const handleNextLevel = () => {
    setLevelIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setStarted(false);
    setLevelIndex(0);
  };

  return started ? (
    <GameScreen
      levelIndex={levelIndex}
      playerEmoji={playerEmoji}
      bulletEmoji={bulletEmoji}
      cellSize={cellSize}
      onFinishLevel={handleNextLevel}
      onEndGame={handleGameEnd}
      onRestart={handleRestart}
    />
  ) : (
    <StartScreen onStart={handleGameStart} />
  );
};

export default App;

