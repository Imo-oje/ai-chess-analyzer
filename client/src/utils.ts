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
