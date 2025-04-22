import React from 'react';

type MazePreviewProps = {
  map: string[][];
  cellSize: number;
};

const MazePreview: React.FC<MazePreviewProps> = ({ map, cellSize }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${map[0].length}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${map.length}, ${cellSize}px)`,
        gap: '0px',
        border: '2px solid #333',
      }}
    >
      {map.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor:
                cell === '#' ? '#444' : cell === 'X' ? 'lightgreen' : cell === 'E' ? 'lightblue' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              border: '1px solid #ccc',
            }}
          >
            {cell === 'X' ? '🚪' : ''}
          </div>
        ))
      )}
    </div>
  );
};

export default MazePreview;
