import React, { useState } from 'react';
import MazeGame from './MazeGame';
import { levelMaps } from '../levels';

type GameScreenProps = {
  levelIndex: number;
  playerEmoji: string;
  bulletEmoji: string;
  cellSize: number;
  onFinishLevel: () => void;
  onEndGame: () => void;
  onRestart: () => void;
};

const GameScreen: React.FC<GameScreenProps> = ({
  levelIndex,
  playerEmoji,
  bulletEmoji,
  cellSize,
  onFinishLevel,
  onEndGame,
  onRestart,
}) => {
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentMap = levelMaps[levelIndex];
  const enemyCount = (levelIndex + 1) * 5;

  const handleLevelComplete = () => setLevelComplete(true);
  const handleGameOver = () => setGameOver(true);
  const handleContinue = () => {
    setLevelComplete(false);
    onFinishLevel();
  };

  return (
    <div>
      {gameOver ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Ты проиграл</h2>
          <button onClick={onRestart} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
            Начать сначала
          </button>
        </div>
      ) : levelComplete ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>{levelIndex === levelMaps.length - 1 ? 'Игра завершена! Ты молодец!' : 'Уровень пройден!'}</h2>
          <button onClick={onEndGame} style={{ margin: '1rem', padding: '0.5rem 1rem' }}>Завершить игру</button>
          {levelIndex < levelMaps.length - 1 && (
            <button onClick={handleContinue} style={{ margin: '1rem', padding: '0.5rem 1rem' }}>Продолжить</button>
          )}
        </div>
      ) : (
        <MazeGame
          map={currentMap}
          playerEmoji={playerEmoji}
          bulletEmoji={bulletEmoji}
          cellSize={cellSize}
          enemyCount={enemyCount}
          onLevelComplete={handleLevelComplete}
          onGameOver={handleGameOver}
        />
      )}
    </div>
  );
};

export default GameScreen;

