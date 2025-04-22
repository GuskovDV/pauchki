import React, { useState } from 'react';
import MazePreview from './MazePreview';
import { levelMaps } from '../levels';

const characters = ['👮‍♂️', '🤖', '🧚‍♀️', '🧙‍♂️'];
const weapons = [
  { name: 'Пистолет', emoji: '•' },
  { name: 'Пулемёт', emoji: '🔹' },
  { name: 'Базука', emoji: '🚀' },
  { name: 'Волшебная палочка', emoji: '💫' },
];

const StartScreen: React.FC<{
  onStart: (character: string, weapon: string, cellSize: number) => void;
}> = ({ onStart }) => {
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const [selectedWeapon, setSelectedWeapon] = useState(weapons[0].emoji);
  const [cellSize, setCellSize] = useState(32);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Выбери персонажа</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
        {characters.map((char) => (
          <button
            key={char}
            onClick={() => setSelectedChar(char)}
            style={{ fontSize: '2rem', padding: '0.5rem', border: selectedChar === char ? '2px solid blue' : '1px solid gray' }}
          >
            {char}
          </button>
        ))}
      </div>

      <h2>Выбери оружие</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
        {weapons.map((w) => (
          <button
            key={w.name}
            onClick={() => setSelectedWeapon(w.emoji)}
            style={{ padding: '0.5rem 1rem', border: selectedWeapon === w.emoji ? '2px solid green' : '1px solid gray' }}
          >
            {w.name} {w.emoji}
          </button>
        ))}
      </div>

      <h2>Масштаб ячеек</h2>
      <input
        type="range"
        min={16}
        max={64}
        step={4}
        value={cellSize}
        onChange={(e) => setCellSize(Number(e.target.value))}
      />
      <div>Текущий масштаб: {cellSize}px</div>

      <h3>Предпросмотр карты</h3>
      <div style={{ display: 'inline-block', transform: `scale(${cellSize / 32})`, transformOrigin: 'top center' }}>
        <MazePreview map={levelMaps[0]} cellSize={32} />
      </div>

      <button
        onClick={() => onStart(selectedChar, selectedWeapon, cellSize)}
        style={{ padding: '0.75rem 2rem', fontSize: '1rem', marginTop: '1.5rem' }}
      >
        Начать игру
      </button>
    </div>
  );
};

export default StartScreen;
