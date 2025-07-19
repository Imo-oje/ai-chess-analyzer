import type { BoardState } from "./board.class";

const isPawnSquareEmpty = (board: BoardState, coord: [number, number]) =>
  board
    .flat()
    .some(
      (item) =>
        item.coordinate[0] === coord[0] &&
        item.coordinate[1] === coord[1] &&
        item.piece === null
    );

export default function findValidMoves(
  board: BoardState,
  coordinate: [number, number]
): { x: number; y: number }[] | false {
  // Find the piece
  const piece = board
    .flat()
    .find((square) => square.coordinate === coordinate)?.piece;

  const color = piece?.name[0].toLowerCase();

  const VALID_MOVES: { x: number; y: number }[] = [];

  switch (piece?.name[1].toUpperCase()) {
    case "P":
      // Determine direction: white moves up (+y), black moves down (-y)
      const [x, y] = coordinate;
      const [direction, startRank] = [
        color === "w" ? 1 : -1,
        color === "w" ? 2 : 7,
      ];

      // /============ Move forward (one square) ===============/
      const forwardOne = { x, y: y + direction };
      if (forwardOne.y >= 1 && forwardOne.y <= 8) {
        // check if the square in front is empty
        if (isPawnSquareEmpty(board, [forwardOne.x, forwardOne.y])) {
          VALID_MOVES.push(forwardOne);
        }
      }

      // /============= Move forward (two squares from starting rank) ===========/
      if (y === startRank) {
        const forwardTwo = { x, y: y + 2 * direction };
        if (
          forwardTwo.y >= 1 &&
          forwardTwo.y <= 8 &&
          isPawnSquareEmpty(board, [forwardOne.x, forwardOne.y]) &&
          isPawnSquareEmpty(board, [forwardTwo.x, forwardTwo.y])
        ) {
          VALID_MOVES.push(forwardTwo);
        }
      }

      return VALID_MOVES.length > 0 ? VALID_MOVES : false;

    default:
      return false;
  }
}
