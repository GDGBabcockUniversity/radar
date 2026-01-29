"use client";

import { useState, useEffect, useCallback } from "react";

// Puzzle data for "new-year-new-lies"
// Grid: 25 columns × 19 rows (converted to 0-based indexing)
const GRID_COLS = 25;
const GRID_ROWS = 19;

const PUZZLE_DATA = {
  id: "new-year-new-lies",
  words: [
    // Converting 1-based to 0-based: subtract 1 from all coordinates
    {
      id: 1,
      direction: "down",
      answer: "DEBUGGING",
      row: 0,
      col: 13,
      clue: "The art of hunting invisible mistakes",
    },
    {
      id: 2,
      direction: "down",
      answer: "ALGORITHM",
      row: 1,
      col: 22,
      clue: "The invisible recipe behind every computation",
    },
    {
      id: 3,
      direction: "across",
      answer: "FRAMEWORK",
      row: 4,
      col: 16,
      clue: "Opinionated structure that dictates how code is written",
    },
    {
      id: 4,
      direction: "down",
      answer: "REPOSITORY",
      row: 4,
      col: 17,
      clue: "Versioned home for collaborative code",
    },
    {
      id: 5,
      direction: "down",
      answer: "MICROSERVICES",
      row: 5,
      col: 9,
      clue: "Architecture where applications are split into independent services",
    },
    {
      id: 6,
      direction: "down",
      answer: "ENCRYPTION",
      row: 5,
      col: 15,
      clue: "What keeps intercepted data useless to attackers",
    },
    {
      id: 7,
      direction: "across",
      answer: "COMPILATION",
      row: 6,
      col: 5,
      clue: "Process that translates human readable code to machine instructions",
    },
    {
      id: 8,
      direction: "down",
      answer: "REFACTORING",
      row: 8,
      col: 5,
      clue: "Cleaning code without changing what it does",
    },
    {
      id: 9,
      direction: "across",
      answer: "AUTHENTICATION",
      row: 11,
      col: 5,
      clue: "Gatekeeper of user access",
    },
    {
      id: 10,
      direction: "across",
      answer: "CONTAINER",
      row: 14,
      col: 4,
      clue: "Isolated environment for running packaged software",
    },
    {
      id: 11,
      direction: "across",
      answer: "DEPLOYMENT",
      row: 16,
      col: 8,
      clue: "Final step before users touch your app",
    },
    {
      id: 12,
      direction: "across",
      answer: "BACKEND",
      row: 17,
      col: 0,
      clue: "Logic layer users never directly see",
    },
  ],
};

interface CellData {
  letter: string;
  userInput: string;
  wordIds: number[];
  isBlocked: boolean;
  number?: number;
}

interface CrosswordPuzzleProps {
  puzzleId: string;
}

export default function CrosswordPuzzle({ puzzleId }: CrosswordPuzzleProps) {
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<"across" | "down">(
    "across",
  );
  const [isComplete, setIsComplete] = useState(false);

  const storageKey = `crossword-${puzzleId}`;

  const initializeGrid = useCallback(() => {
    const newGrid: CellData[][] = [];

    // Create empty blocked grid
    for (let row = 0; row < GRID_ROWS; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        newGrid[row][col] = {
          letter: "",
          userInput: "",
          wordIds: [],
          isBlocked: true,
        };
      }
    }

    // Place words on grid
    PUZZLE_DATA.words.forEach((word) => {
      for (let i = 0; i < word.answer.length; i++) {
        const row = word.direction === "down" ? word.row + i : word.row;
        const col = word.direction === "across" ? word.col + i : word.col;

        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].letter = word.answer[i];
          newGrid[row][col].isBlocked = false;
          if (!newGrid[row][col].wordIds.includes(word.id)) {
            newGrid[row][col].wordIds.push(word.id);
          }
          if (i === 0) {
            newGrid[row][col].number = word.id;
          }
        }
      }
    });

    return newGrid;
  }, []);

  useEffect(() => {
    const newGrid = initializeGrid();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedInputs = JSON.parse(saved);
        for (let row = 0; row < newGrid.length; row++) {
          for (let col = 0; col < newGrid[row].length; col++) {
            if (savedInputs[row]?.[col] && !newGrid[row][col].isBlocked) {
              newGrid[row][col].userInput = savedInputs[row][col];
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
    setGrid(newGrid);
  }, [initializeGrid, storageKey]);

  useEffect(() => {
    if (grid.length === 0) return;
    const inputs: Record<number, Record<number, string>> = {};
    for (let row = 0; row < grid.length; row++) {
      inputs[row] = {};
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col].userInput) {
          inputs[row][col] = grid[row][col].userInput;
        }
      }
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(inputs));
    } catch {
      /* ignore */
    }

    let complete = true;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (
          !grid[row][col].isBlocked &&
          grid[row][col].userInput.toUpperCase() !== grid[row][col].letter
        ) {
          complete = false;
          break;
        }
      }
    }
    setIsComplete(complete);
  }, [grid, storageKey]);

  const handleCellInput = (row: number, col: number, value: string) => {
    if (grid[row][col].isBlocked) return;
    const newGrid = [...grid];
    newGrid[row] = [...newGrid[row]];
    newGrid[row][col] = {
      ...newGrid[row][col],
      userInput: value.toUpperCase().slice(-1),
    };
    setGrid(newGrid);
    if (value) moveToNextCell(row, col);
  };

  const moveToNextCell = (row: number, col: number) => {
    let nextRow = row,
      nextCol = col;
    if (selectedDirection === "across") nextCol++;
    else nextRow++;
    if (
      nextRow < grid.length &&
      nextCol < grid[0].length &&
      !grid[nextRow][nextCol].isBlocked
    ) {
      setSelectedCell({ row: nextRow, col: nextCol });
      document.getElementById(`cell-${nextRow}-${nextCol}`)?.focus();
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlocked) return;
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    let newRow = row,
      newCol = col;
    switch (e.key) {
      case "ArrowUp":
        newRow--;
        setSelectedDirection("down");
        break;
      case "ArrowDown":
        newRow++;
        setSelectedDirection("down");
        break;
      case "ArrowLeft":
        newCol--;
        setSelectedDirection("across");
        break;
      case "ArrowRight":
        newCol++;
        setSelectedDirection("across");
        break;
      case "Backspace":
        if (!grid[row][col].userInput) {
          if (selectedDirection === "across") newCol--;
          else newRow--;
        }
        break;
      default:
        return;
    }
    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length &&
      !grid[newRow][newCol].isBlocked
    ) {
      setSelectedCell({ row: newRow, col: newCol });
      document.getElementById(`cell-${newRow}-${newCol}`)?.focus();
    }
  };

  const resetPuzzle = () => {
    setGrid(initializeGrid());
    localStorage.removeItem(storageKey);
    setSelectedCell(null);
    setIsComplete(false);
  };

  const getHighlightedCells = () => {
    if (!selectedCell) return new Set<string>();
    const highlighted = new Set<string>();
    const cell = grid[selectedCell.row]?.[selectedCell.col];
    if (!cell) return highlighted;
    const wordId = cell.wordIds.find((id) => {
      const word = PUZZLE_DATA.words.find((w) => w.id === id);
      return word?.direction === selectedDirection;
    });
    if (wordId) {
      const word = PUZZLE_DATA.words.find((w) => w.id === wordId);
      if (word) {
        for (let i = 0; i < word.answer.length; i++) {
          const r = word.direction === "down" ? word.row + i : word.row;
          const c = word.direction === "across" ? word.col + i : word.col;
          highlighted.add(`${r}-${c}`);
        }
      }
    }
    return highlighted;
  };

  const highlightedCells = getHighlightedCells();
  const acrossClues = PUZZLE_DATA.words
    .filter((w) => w.direction === "across")
    .sort((a, b) => a.id - b.id);
  const downClues = PUZZLE_DATA.words
    .filter((w) => w.direction === "down")
    .sort((a, b) => a.id - b.id);

  if (grid.length === 0) return null;

  return (
    <div className="my-8 p-4 sm:p-6 bg-[#0f0f0f] border border-white/10 rounded-xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3
          className="text-lg sm:text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🧩 Crossword Puzzle
        </h3>
        <button
          onClick={resetPuzzle}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      {isComplete && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
          <p className="text-green-400 font-semibold text-sm sm:text-base">
            🎉 Congratulations! You completed the puzzle!
          </p>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        <div className="overflow-x-auto pb-2">
          <div
            className="inline-grid gap-0 border border-white/20 rounded-lg overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 20px)` }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    relative w-5 h-5 border border-white/5
                    ${cell.isBlocked ? "bg-[#1a1a1a]" : "bg-[#2a2a2a]"}
                    ${highlightedCells.has(`${rowIndex}-${colIndex}`) ? "bg-blue-900/50!" : ""}
                    ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? "bg-primary/40!" : ""}
                  `}
                >
                  {cell.number && (
                    <span className="absolute top-0 left-px text-[5px] text-gray-400 font-medium leading-none">
                      {cell.number}
                    </span>
                  )}
                  {!cell.isBlocked && (
                    <input
                      id={`cell-${rowIndex}-${colIndex}`}
                      type="text"
                      value={cell.userInput}
                      onChange={(e) =>
                        handleCellInput(rowIndex, colIndex, e.target.value)
                      }
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      className="w-full h-full flex items-center justify-center text-center text-[10px] font-bold uppercase bg-transparent text-white focus:outline-none leading-none p-0"
                      maxLength={1}
                    />
                  )}
                </div>
              )),
            )}
          </div>
        </div>

        <div className="flex-1 grid sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
          <div>
            <h4
              className="font-bold text-white mb-2 sm:mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Across
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {acrossClues.map((clue) => (
                <li key={clue.id} className="text-gray-300">
                  <span className="font-semibold text-white">{clue.id}.</span>{" "}
                  {clue.clue}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className="font-bold text-white mb-2 sm:mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Down
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {downClues.map((clue) => (
                <li key={clue.id} className="text-gray-300">
                  <span className="font-semibold text-white">{clue.id}.</span>{" "}
                  {clue.clue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500 text-center">
        Click a cell and type. Click again to switch direction. Progress saves
        automatically.
      </p>
    </div>
  );
}
