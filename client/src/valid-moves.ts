import type { BoardState } from "./board.class";
import type { Square } from "./utils";
import {
  getPawnMoves,
  getKnightMoves,
  getSlidingMoves,
  getKingMoves,
} from "./piece-moves";

export default function findValidMoves(
  board: BoardState,
  coordinate: [number, number]
): Square[] | false {
  const square = board
    .flat()
    .find(
      (sq) =>
        sq.coordinate[0] === coordinate[0] && sq.coordinate[1] === coordinate[1]
    );
  if (!square || !square.piece) return false;

  const piece = square.piece;
  const color = piece.name[0].toLowerCase();
  const pieceType = piece.name[1].toUpperCase();

  const oppKing = board
    .flat()
    .find(
      (sq) =>
        sq.piece?.name[1] === "K" && sq.piece.name[0].toLowerCase() !== color
    );
  if (!oppKing) return false;

  switch (pieceType) {
    case "P":
      return getPawnMoves(board, coordinate, color) || false;
    case "N":
      return getKnightMoves(board, coordinate) || false;
    case "B":
      return (
        getSlidingMoves(board, coordinate, color, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ]) || false
      );
    case "R":
      return (
        getSlidingMoves(board, coordinate, color, [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || false
      );
    case "Q":
      return (
        getSlidingMoves(board, coordinate, color, [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) || false
      );
    case "K":
      return getKingMoves(board, coordinate, color, oppKing.squareId) || false;
    default:
      return false;
  }
}
