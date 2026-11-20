export interface GridCoord {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  coords: GridCoord[];
}

export interface WordSearchBoard {
  size: number;
  grid: string[][];
  placedWords: PlacedWord[];
}

type Direction = [number, number];

// Horizontal, Vertical, and Diagonal (forward only so 9-10 year olds have a fair, fun puzzle)
const DIRECTIONS: Direction[] = [
  [0, 1], // right
  [1, 0], // down
  [1, 1], // diagonal down-right
  [0, -1], // left (used as fallback if needed)
];

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateWordSearchBoard(
  words: string[],
  size: 8 | 10,
  seed = 42
): WordSearchBoard {
  const rand = createSeededRandom(seed);
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords: PlacedWord[] = [];

  // Sort longest first for reliable placement
  const sortedWords = [...words]
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;

    // Prioritize right/down/diagonal first for kids, fallback to left
    const candidateDirs = [...DIRECTIONS];

    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = candidateDirs[Math.floor(rand() * (attempt < 140 ? 3 : 4))];
      const [dr, dc] = dir;
      const startRow = Math.floor(rand() * size);
      const startCol = Math.floor(rand() * size);

      const endRow = startRow + dr * (word.length - 1);
      const endCol = startCol + dc * (word.length - 1);

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
        continue;
      }

      let fits = true;
      const coords: GridCoord[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        const existing = grid[r][c];
        if (existing !== '' && existing !== word[i]) {
          fits = false;
          break;
        }
        coords.push({ row: r, col: c });
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const { row, col } = coords[i];
          grid[row][col] = word[i];
        }
        placedWords.push({ word, coords });
        placed = true;
      }
    }

    // Deterministic scan fallback if random attempts missed
    if (!placed) {
      outer: for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          for (const [dr, dc] of DIRECTIONS) {
            const endRow = r + dr * (word.length - 1);
            const endCol = c + dc * (word.length - 1);
            if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

            let fits = true;
            const coords: GridCoord[] = [];
            for (let i = 0; i < word.length; i++) {
              const nr = r + dr * i;
              const nc = c + dc * i;
              if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) {
                fits = false;
                break;
              }
              coords.push({ row: nr, col: nc });
            }
            if (fits) {
              for (let i = 0; i < word.length; i++) {
                grid[coords[i].row][coords[i].col] = word[i];
              }
              placedWords.push({ word, coords });
              placed = true;
              break outer;
            }
          }
        }
      }
    }
  }

  // Fill empty cells with common English letters
  const filler = 'AEIOURSTLNCDMPBHGFWY';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = filler[Math.floor(rand() * filler.length)];
      }
    }
  }

  return { size, grid, placedWords };
}

// Returns list of straight-line coordinates between start and end (horizontal, vertical, or 45deg diagonal)
export function getLineCoords(start: GridCoord, end: GridCoord): GridCoord[] {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  // Must be horizontal, vertical, or exact diagonal
  if (dr !== 0 && dc !== 0 && absR !== absC) {
    return [];
  }

  const steps = Math.max(absR, absC);
  const stepR = dr === 0 ? 0 : dr / absR;
  const stepC = dc === 0 ? 0 : dc / absC;

  const coords: GridCoord[] = [];
  for (let i = 0; i <= steps; i++) {
    coords.push({
      row: start.row + stepR * i,
      col: start.col + stepC * i,
    });
  }
  return coords;
}

export function extractWordFromCoords(grid: string[][], coords: GridCoord[]): string {
  return coords.map(({ row, col }) => grid[row]?.[col] ?? '').join('');
}

export function matchWordSelection(
  grid: string[][],
  coords: GridCoord[],
  targetWords: string[],
  alreadyFound: Set<string>
): string | null {
  if (coords.length < 2) return null;
  const forward = extractWordFromCoords(grid, coords);
  const backward = forward.split('').reverse().join('');
  const normalizedTargets = targetWords.map((w) => w.toUpperCase());

  if (normalizedTargets.includes(forward) && !alreadyFound.has(forward)) {
    return forward;
  }
  if (normalizedTargets.includes(backward) && !alreadyFound.has(backward)) {
    return backward;
  }
  return null;
}
