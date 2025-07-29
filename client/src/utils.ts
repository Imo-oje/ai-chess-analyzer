import wP from "./assets/pieces/wP.svg";
import bP from "./assets/pieces/bP.svg";
import wR from "./assets/pieces/wR.svg";
import wK from "./assets/pieces/wK.svg";
import wN from "./assets/pieces/wN.svg";
import wB from "./assets/pieces/wB.svg";
import wQ from "./assets/pieces/wQ.svg";
import bK from "./assets/pieces/bK.svg";
import bQ from "./assets/pieces/bQ.svg";
import bN from "./assets/pieces/bN.svg";
import bB from "./assets/pieces/bB.svg";
import bR from "./assets/pieces/bR.svg";
import type { BoardState } from "./board.class";
import { getKnightMoves, getSlidingMoves } from "./piece-moves";

export const piecesMap: any = {
  wP,
  wB,
  wK,
  wR,
  wN,
  wQ,
  bR,
  bB,
  bN,
  bK,
  bQ,
  bP,
};

export type Piece = { name: string; icon: string } | null;

export type Square = {
  squareId: string;
  coordinate: [number, number];
  color: string;
  isChecked?: boolean;
  piece: Piece;
};

export function createBoard(piecesMap: any) {
  const bd = [];
  const files = "abcdefgh"; // Board column
  for (let rank = 8; rank >= 1; rank--) {
    const row = [];
    for (let file = 0; file < 8; file++) {
      const squareId = files[file] + rank;
      const color = (rank + file) % 2 === 0 ? "white" : "black";
      let piece = null;

      // Add all pieces to respective ranks
      if (rank === 2) piece = "wP";
      else if (rank === 7) piece = "bP";
      else if (rank === 1 || rank === 8) {
        const isWhite = rank === 1;
        const prefix = isWhite ? "w" : "b";
        const backRank = ["R", "N", "B", "Q", "K", "B", "N", "R"];
        piece = `${prefix}${backRank[file]}`;
      }

      row.push({
        squareId,
        color,
        coordinate: [file + 1, rank] as [number, number],
        piece: piece ? { icon: piecesMap[piece], name: piece as string } : null,
      });
    }
    bd.push(row);
  }
  return bd;
}

export function hasSameColor(pieceOne: Piece, PieceTwo: Piece) {
  return pieceOne?.name[0] === PieceTwo?.name[0];
}

// returns the squares around a king
export function getKingSquares(squareId: string, board: BoardState): string[] {
  const files = "abcdefgh";
  const file = squareId[0];
  const rank = parseInt(squareId[1] as string);

  const directions = [
    [1, 0],
    [-1, 0], // vertical
    [0, 1],
    [0, -1], // horizontal
    [1, 1],
    [1, -1], // diagonal
    [-1, 1],
    [-1, -1],
  ];

  const fileIndex = files.indexOf(file as string);
  const emptySquares: string[] = [];

  for (const [df, dr] of directions) {
    const newFileIndex = fileIndex + df;
    const newRank = rank + dr;

    if (newFileIndex >= 0 && newFileIndex < 8 && newRank >= 1 && newRank <= 8) {
      const newSquare = files[newFileIndex] + newRank;
      if (board.flat().some((sq) => sq.squareId === newSquare))
        emptySquares.push(newSquare);
      console.log("emptySquares: ", emptySquares);
    }
  }

  return emptySquares;
}
// returns the square containig the king
export function getKingSquare(board: BoardState, color: "w" | "b") {
  return board
    .flat()
    .find((sq) => sq.piece?.name[1] === "K" && sq.piece.name[0] === color);
}

export function getPawnAttackingSquares(
  board: BoardState,
  coordinate: [number, number],
  color: string
): Square[] {
  const [x, y] = coordinate;
  const direction = color === "w" ? 1 : -1;

  const targets: [number, number][] = [
    [x - 1, y + direction],
    [x + 1, y + direction],
  ];

  return board
    .flat()
    .filter((square) =>
      targets.some(
        ([tx, ty]) => square.coordinate[0] === tx && square.coordinate[1] === ty
      )
    );
}

export function getEnemyAttackingSquare(board: BoardState, enemyColor: string) {
  const enemyPieces = board.flat().filter((sq) => {
    if (sq.piece?.name[0] === enemyColor) return sq;
  });
  let attackedSquares: Square[] = [];

  for (let i = 0; i < enemyPieces.length; i++) {
    const coordinate = enemyPieces[i]?.coordinate as [number, number];
    if (enemyPieces[i]?.piece?.name[1] === "P") {
      const moves =
        getPawnAttackingSquares(board, coordinate, enemyColor) || false;
      attackedSquares.push(...moves);
    }

    if (enemyPieces[i]?.piece?.name[1] === "N") {
      const moves = getKnightMoves(board, coordinate) || false;
      attackedSquares.push(...moves);
    }

    if (enemyPieces[i]?.piece?.name[1] === "R") {
      const moves =
        getSlidingMoves(board, coordinate, enemyColor, [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || false;
      attackedSquares.push(...moves);
    }

    if (enemyPieces[i]?.piece?.name[1] === "B") {
      const moves =
        getSlidingMoves(board, coordinate, enemyColor, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ]) || false;
      attackedSquares.push(...moves);
    }

    if (enemyPieces[i]?.piece?.name[1] === "Q") {
      const moves =
        getSlidingMoves(board, coordinate, enemyColor, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || false;
      attackedSquares.push(...moves);
    }
  }
  return attackedSquares;
}

// function isSquareAttacked(square: Square, board: BoardState) {
//   const enemyMoves = getAllPosibleMoves(board, attackerColor);
// }

// Clone the board and simulate move manually then return simulated board
export function simulateMove(
  board: BoardState,
  from: [number, number],
  to: [number, number]
): BoardState {
  // copy board
  const newBoard: BoardState = board.map((row) =>
    row.map((square) => ({
      ...square,
      piece: square.piece ? { ...square.piece } : null,
    }))
  );

  const fromSquare = newBoard
    .flat()
    .find((sq) => sq.coordinate[0] === from[0] && sq.coordinate[1] === from[1]);
  const toSquare = newBoard
    .flat()
    .find((sq) => sq.coordinate[0] === to[0] && sq.coordinate[1] === to[1]);

  if (!fromSquare || !toSquare || !fromSquare.piece) return newBoard;

  toSquare.piece = { ...fromSquare.piece };
  fromSquare.piece = null;

  return newBoard;
}

export function isInCheck(board: BoardState, color: "w" | "b") {
  const kingSquare = getKingSquare(board, color);
  const opponentColor = color === "w" ? "b" : "w";

  const allAttackedSquares = getEnemyAttackingSquare(board, opponentColor);
  return allAttackedSquares.some(
    (sq) => sq.coordinate === kingSquare?.coordinate
  );
}

export function markCheckedKing(
  board: BoardState,
  color: "w" | "b"
): BoardState {
  const newBoard = board.map((row) =>
    row.map((sq) => ({
      ...sq,
      isChecked: false, // clear previous
    }))
  );

  if (isInCheck(newBoard, color)) {
    const king = newBoard.flat().find((sq) => sq.piece?.name === `${color}K`);
    if (king) {
      king.isChecked = true;
    }
  }

  return newBoard;
}
