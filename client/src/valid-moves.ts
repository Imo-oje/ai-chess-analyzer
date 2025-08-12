import type { BoardState } from "./board.class";
import type { Square } from "./utils";
import {
  getPawnMoves,
  getKnightMoves,
  getSlidingMoves,
  getKingMoves,
} from "./piece-moves";
import { isInCheck, simulateMove } from "./utils";
import type { CastleState } from "./App";

export default function findValidMoves(
  board: BoardState,
  coordinate: [number, number],
  castleState: CastleState,
  enPassantTarget?: [number, number]
): Square[] | [] {
  const square = board
    .flat()
    .find(
      (sq) =>
        sq.coordinate[0] === coordinate[0] && sq.coordinate[1] === coordinate[1]
    );
  if (!square || !square.piece) return [];

  const piece = square.piece;
  const color = piece.name[0].toLowerCase();
  const pieceType = piece.name[1].toUpperCase();

  const oppKing = board
    .flat()
    .find(
      (sq) =>
        sq.piece?.name[1] === "K" && sq.piece.name[0].toLowerCase() !== color
    );
  if (!oppKing) return [];

  let normalMoves: Square[] = [];

  switch (pieceType) {
    case "P":
      normalMoves =
        getPawnMoves(board, coordinate, color, enPassantTarget) || [];
      break;
    case "N":
      normalMoves = getKnightMoves(board, coordinate) || [];
      break;
    case "B":
      normalMoves =
        getSlidingMoves(board, coordinate, color, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ]) || [];
      break;
    case "R":
      normalMoves =
        getSlidingMoves(board, coordinate, color, [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || [];
      break;
    case "Q":
      normalMoves =
        getSlidingMoves(board, coordinate, color, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || [];
      break;
    case "K":
      return (
        getKingMoves(board, coordinate, color, oppKing.squareId, castleState) ||
        []
      );
  }
  const legalMoves = normalMoves.filter((targetSquare) => {
    const newBoard = simulateMove(board, coordinate, targetSquare.coordinate);
    return !isInCheck(newBoard, color as "w" | "b");
  });

  return legalMoves;
}
