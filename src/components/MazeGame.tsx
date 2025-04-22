import React, { useEffect, useRef, useState } from 'react';

// Типы

type MazeGameProps = {
  map: string[][];
  playerEmoji: string;
  bulletEmoji: string;
  enemyCount: number;
  cellSize: number;
  onLevelComplete: () => void;
  onGameOver: () => void;
};

type Bomb = { x: number; y: number; countdown: number };
type Point = { x: number; y: number };

// Компонент

const MazeGame: React.FC<MazeGameProps> = ({
  map,
  playerEmoji,
  bulletEmoji,
  enemyCount,
  cellSize,
  onLevelComplete,
  onGameOver,
}) => {
  const [player, setPlayer] = useState({ x: 1, y: 1, hp: 100, direction: 'right', hurt: false });
  const [enemies, setEnemies] = useState<Point[]>([]);
  const [bullets, setBullets] = useState<any[]>([]);
  const [ghosts, setGhosts] = useState<Point[]>([]);
  const [wallHits, setWallHits] = useState<Point[]>([]);
  const [explosions, setExplosions] = useState<Point[]>([]);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [bombZones, setBombZones] = useState<Point[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const enemiesRef = useRef(enemies);
  const playerRef = useRef(player);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const lastMoveTimeRef = useRef<number>(0);
  const loopRef = useRef<number | null>(null);

  // Обновление ссылок
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { playerRef.current = player; }, [player]);

  const isPassable = (x: number, y: number) => map[y]?.[x] && map[y][x] !== '#';

  const findTile = (symbol: string): Point => {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === symbol) return { x, y };
      }
    }
    return { x: 1, y: 1 };
  };

  const getRandomFreeTile = (): Point => {
    const free: Point[] = [];
    map.forEach((row, y) => row.forEach((cell, x) => {
      if (cell === ' ') free.push({ x, y });
    }));
    return free[Math.floor(Math.random() * free.length)];
  };

  const createEnemies = () => Array.from({ length: enemyCount }, getRandomFreeTile);

  const movePlayer = (dx: number, dy: number, direction: string) => {
    setPlayer((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (!isPassable(nx, ny)) return { ...prev, direction };
      if (map[ny][nx] === 'X') onLevelComplete();
      return { ...prev, x: nx, y: ny, direction };
    });
  };

  const shoot = () => {
    const { x, y, direction } = playerRef.current;
    setBullets((prev) => [...prev, { x, y, direction, range: 10 }]);
  };

  const placeBomb = () => {
    const { x, y } = playerRef.current;
    const countdown = 5;
    const newBomb: Bomb = { x, y, countdown };

    const zone: Point[] = [];
    for (let dx = -5; dx <= 5; dx++) {
      for (let dy = -5; dy <= 5; dy++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        const tx = x + dx, ty = y + dy;
        if (dist <= 5 && isPassable(tx, ty)) zone.push({ x: tx, y: ty });
      }
    }

    setBombZones((prev) => [...prev, ...zone]);
    setBombs((prev) => [...prev, newBomb]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver) return;
    keysRef.current[e.key] = true;
    if (e.key === ' ') shoot();
    if (e.key === 'b' || e.key === 'и') placeBomb();
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysRef.current[e.key] = false;
  };

  const gameLoop = (time: number) => {
    if (gameOver) return;
    const keys = keysRef.current;
    const delay = 150;
    if (time - lastMoveTimeRef.current >= delay) {
      if (keys['ArrowUp']) movePlayer(0, -1, 'up');
      else if (keys['ArrowDown']) movePlayer(0, 1, 'down');
      else if (keys['ArrowLeft']) movePlayer(-1, 0, 'left');
      else if (keys['ArrowRight']) movePlayer(1, 0, 'right');
      lastMoveTimeRef.current = time;
    }
    loopRef.current = requestAnimationFrame(gameLoop);
  };

  const updateBullets = () => {
    setBullets((prev) => {
      const newBullets: typeof prev = [];
      const wallCollisions: Point[] = [];
      const hits: Point[] = [];

      for (const b of prev) {
        let { x, y, direction, range } = b;
        if (range <= 0) continue;
        if (direction === 'up') y--;
        if (direction === 'down') y++;
        if (direction === 'left') x--;
        if (direction === 'right') x++;
        if (!isPassable(x, y)) {
          wallCollisions.push({ x, y });
          continue;
        }
        newBullets.push({ x, y, direction, range: range - 1 });
      }

      wallCollisions.forEach((w) => {
        setWallHits((prev) => [...prev, w]);
        setTimeout(() => setWallHits((prev) => prev.filter((p) => p.x !== w.x || p.y !== w.y)), 300);
      });

      setEnemies((prevEnemies) => {
        const updated = prevEnemies.filter((enemy) => {
          const hit = newBullets.some((b) => b.x === enemy.x && b.y === enemy.y);
          if (hit) hits.push(enemy);
          return !hit;
        });
        hits.forEach((hit) => {
          setGhosts((g) => [...g, hit]);
          setTimeout(() => {
            setGhosts((g) => g.filter((p) => p.x !== hit.x || p.y !== hit.y));
          }, 800);
        });
        return updated;
      });

      return newBullets.filter((b) => !hits.some((h) => h.x === b.x && h.y === b.y));
    });
  };

  const moveEnemies = () => {
    setEnemies((prev) => {
      return prev.map((enemy) => {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = enemy.x + dx;
        const ny = enemy.y + dy;
        return isPassable(nx, ny) ? { x: nx, y: ny } : enemy;
      });
    });
  };

  const explodeBombs = () => {
    setBombs((prev) => {
      const toExplode = prev.filter((b) => b.countdown <= 1);
      const stillActive = prev.filter((b) => b.countdown > 1).map((b) => ({ ...b, countdown: b.countdown - 1 }));

      toExplode.forEach((b) => {
        const zone: Point[] = [];
        for (let dx = -5; dx <= 5; dx++) {
          for (let dy = -5; dy <= 5; dy++) {
            const dist = Math.abs(dx) + Math.abs(dy);
            const tx = b.x + dx, ty = b.y + dy;
            if (dist <= 5 && isPassable(tx, ty)) zone.push({ x: tx, y: ty });
          }
        }

        setExplosions((prev) => [...prev, ...zone]);
        setTimeout(() => setExplosions((prev) => prev.filter((z) => !zone.some((p) => p.x === z.x && p.y === z.y))), 500);
        setBombZones((prev) => prev.filter((z) => !zone.some((p) => p.x === z.x && p.y === z.y)));

        setEnemies((prev) => prev.filter((e) => !zone.some((z) => z.x === e.x && z.y === e.y)));
        if (zone.some((z) => z.x === playerRef.current.x && z.y === playerRef.current.y)) {
          setPlayer((prev) => {
            const newHp = prev.hp - 50;
            if (newHp <= 0) {
              setGameOver(true);
              onGameOver();
            }
            return { ...prev, hp: newHp, hurt: true };
          });
        }
      });

      return stillActive;
    });
  };

  const checkPlayerDamage = () => {
    const { x, y } = playerRef.current;
    const attackers = enemiesRef.current.filter((e) => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1);
    if (attackers.length > 0) {
      setPlayer((prev) => {
        const newHp = prev.hp - 10 * attackers.length;
        if (newHp <= 0) {
          setGameOver(true);
          onGameOver();
        }
        return { ...prev, hp: newHp, hurt: true };
      });
    }
  };

  useEffect(() => {
    setPlayer({ ...findTile('E'), direction: 'right', hp: 100, hurt: false });
    const e = createEnemies();
    setEnemies(e);
    enemiesRef.current = e;
  }, [map]);

  useEffect(() => {
    if (gameOver) return;
    const timers = [
      setInterval(updateBullets, 100),
      setInterval(moveEnemies, 500),
      setInterval(checkPlayerDamage, 1000),
      setInterval(explodeBombs, 1000),
    ];
    loopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      timers.forEach(clearInterval);
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameOver]);

  useEffect(() => {
    if (player.hurt) setTimeout(() => setPlayer((p) => ({ ...p, hurt: false })), 200);
  }, [player.hurt]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const renderEntity = (x: number, y: number, emoji: string, key: string, extra = '') => (
    <div
      key={key}
      className={`entity ${extra}`}
      style={{ transform: `translate(${x * cellSize}px, ${y * cellSize}px)` }}
    >
      {emoji}
    </div>
  );

 return (
    <div style={{ padding: 16 }}>
      <style>{`
        .grid-container {
          position: relative;
          width: ${map[0].length * cellSize}px;
          height: ${map.length * cellSize}px;
        }
        .grid-bg {
          display: grid;
          position: absolute;
          grid-template-columns: repeat(${map[0].length}, ${cellSize}px);
          grid-template-rows: repeat(${map.length}, ${cellSize}px);
        }
        .cell {
          width: ${cellSize}px;
          height: ${cellSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wall { background: #333; }
        .exit { background: lightgreen; }
        .entry { background: lightblue; }

        .entity {
          position: absolute;
          width: ${cellSize}px;
          height: ${cellSize}px;
          font-size: ${cellSize * 0.6}px;
          line-height: ${cellSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease-out;
        }

        .danger-zone {
          position: absolute;
          width: ${cellSize}px;
          height: ${cellSize}px;
          background: rgba(255, 0, 0, 0.2);
          z-index: 0;
          transform: translate(0, 0);
        }

        .ghost { opacity: 1; transition: opacity 0.8s linear; }
        .hit { opacity: 1; transition: opacity 0.3s ease-out; }
        .hurt { animation: blink 0.2s steps(1) 2; }

        .explosion {
          animation: boom 0.5s ease-out;
        }

        @keyframes boom {
          0% { transform: scale(0.5); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      <div className="grid-container">
        <div className="grid-bg">
          {map.map((row, y) => row.map((cell, x) => (
            <div key={`${x},${y}`} className={`cell ${cell === '#' ? 'wall' : ''} ${cell === 'X' ? 'exit' : ''} ${cell === 'E' ? 'entry' : ''}`}>
              {cell === 'X' ? '🚪' : ''}
            </div>
          )))}
        </div>

        {bombZones.map((z, i) => (
          <div
            key={`danger-${i}`}
            className="danger-zone"
            style={{ transform: `translate(${z.x * cellSize}px, ${z.y * cellSize}px)` }}
          />
        ))}

        {renderEntity(player.x, player.y, playerEmoji, 'player', player.hurt ? 'hurt' : '')}
        {enemies.map((e, i) => renderEntity(e.x, e.y, '🕷️', `enemy-${i}`))}
        {bullets.map((b, i) => renderEntity(b.x, b.y, bulletEmoji, `bullet-${i}`))}
        {ghosts.map((g, i) => renderEntity(g.x, g.y, '👻', `ghost-${i}`, 'ghost'))}
        {wallHits.map((h, i) => renderEntity(h.x, h.y, '💥', `wallhit-${i}`, 'hit'))}
        {bombs.map((b, i) => renderEntity(b.x, b.y, `💣${b.countdown}`, `bomb-${i}`))}
        {explosions.map((e, i) => renderEntity(e.x, e.y, '🔥', `exp-${i}`, 'explosion'))}
      </div>

      <div style={{ marginTop: 16 }}>HP: {player.hp}</div>
      {gameOver && <div style={{ color: 'red', fontSize: 20, marginTop: 8 }}>Игра закончена</div>}
    </div>
  );
};

export default MazeGame;


