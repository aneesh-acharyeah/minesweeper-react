import React, { useState, useEffect } from "react";

const SIZE = 8; 
const MINES_COUNT = 10;

const generateEmptyBoard = () =>
  Array(SIZE)
    .fill(null)
    .map(() =>
      Array(SIZE).fill({
        isRevealed: false,
        isMine: false,
        isFlagged: false,
        adjacentMines: 0,
      })
    );

const cloneBoard = (board) => board.map((row) => row.map((cell) => ({ ...cell })));

const placeMines = (board, initialRow, initialCol) => {
  let minesPlaced = 0;
  while (minesPlaced < MINES_COUNT) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (
      (r === initialRow && c === initialCol) ||
      board[r][c].isMine
    )
      continue;
    board[r][c].isMine = true;
    minesPlaced++;
  }
};

const countAdjacentMines = (board, row, col) => {
  let count = 0;
  for (let r = Math.max(0, row - 1); r <= Math.min(SIZE - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(SIZE - 1, col + 1); c++) {
      if (board[r][c].isMine) count++;
    }
  }
  return count;
};

const revealEmptyCells = (board, row, col) => {
  let queue = [[row, col]];
  while (queue.length) {
    const [r, c] = queue.shift();
    if (board[r][c].isRevealed) continue;
    board[r][c].isRevealed = true;
    if (board[r][c].adjacentMines === 0) {
      for (
        let rr = Math.max(0, r - 1);
        rr <= Math.min(SIZE - 1, r + 1);
        rr++
      ) {
        for (
          let cc = Math.max(0, c - 1);
          cc <= Math.min(SIZE - 1, c + 1);
          cc++
        ) {
          if (!board[rr][cc].isRevealed) queue.push([rr, cc]);
        }
      }
    }
  }
};

export default function Minesweeper() {
  const [board, setBoard] = useState(generateEmptyBoard());
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  const revealCell = (r, c) => {
    if (gameOver || win) return;
    const newBoard = cloneBoard(board);
    if (newBoard[r][c].isFlagged || newBoard[r][c].isRevealed) return;

    if (firstClick) {
      placeMines(newBoard, r, c);
      // Calculate adjacent mines after placing mines
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          newBoard[row][col].adjacentMines = countAdjacentMines(
            newBoard,
            row,
            col
          );
        }
      }
      setFirstClick(false);
    }

    if (newBoard[r][c].isMine) {
      newBoard[r][c].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    if (newBoard[r][c].adjacentMines === 0) {
      revealEmptyCells(newBoard, r, c);
    } else {
      newBoard[r][c].isRevealed = true;
    }

    setBoard(newBoard);

    // Check win (all non-mine cells revealed)
    let safeCells = 0;
    newBoard.forEach((row) =>
      row.forEach((cell) => {
        if (!cell.isMine && cell.isRevealed) safeCells++;
      })
    );
    if (safeCells === SIZE * SIZE - MINES_COUNT) {
      setWin(true);
      setGameOver(true);
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (gameOver || win || firstClick) return;
    const newBoard = cloneBoard(board);
    if (newBoard[r][c].isRevealed) return;
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
    setBoard(newBoard);
  };

  const resetGame = () => {
    setBoard(generateEmptyBoard());
    setGameOver(false);
    setWin(false);
    setFirstClick(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <h1>Minesweeper</h1>
      <button onClick={resetGame} style={{ padding: "8px 16px", marginBottom: 16 }}>
        New Game
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 40px)`,
          gap: 4,
          justifyContent: "center",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            let content = "";
            let bgColor = "#bbb";
            if (cell.isRevealed) {
              bgColor = cell.isMine ? "red" : "#ddd";
              if (cell.adjacentMines > 0 && !cell.isMine) {
                content = cell.adjacentMines;
              }
            } else if (cell.isFlagged) {
              content = "🚩";
              bgColor = "#ccc";
            }
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: bgColor,
                  border: "1px solid #999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                  userSelect: "none",
                  fontSize: 18,
                  color: cell.adjacentMines === 1 && cell.isRevealed ? "blue" : 
                         cell.adjacentMines === 2 && cell.isRevealed ? "green" : 
                         cell.adjacentMines > 2 && cell.isRevealed ? "red" : "black"
                }}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
      {gameOver && !win && <h2 style={{ color: "red" }}>Game Over!</h2>}
      {win && <h2 style={{ color: "green" }}>You Win!</h2>}
      <p>Left click to reveal, Right click to flag/unflag</p>
    </div>
  );
}
