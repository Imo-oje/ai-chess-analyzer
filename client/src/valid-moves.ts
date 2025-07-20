import type { BoardState } from "./board.class";
import type { Square } from "./utils";

export default function findValidMoves(
  board: BoardState,
  coordinate: [number, number]
): Square[] | false | false {
  // Find the piece
  const piece = board
    .flat()
    .find((square) => square.coordinate === coordinate)?.piece;

  const color = piece?.name[0].toLowerCase();

  const VALID_MOVES: (typeof board)[number][number][] = [];

  switch (piece?.name[1].toUpperCase()) {
    case "P":
      // Determine direction: white moves up (+y), black moves down (-y)
      const [x, y] = coordinate;
      const [direction, startRank] = [
        color === "w" ? 1 : -1,
        color === "w" ? 2 : 7,
      ];

      const isPawnSquareEmpty = (board: BoardState, coord: [number, number]) =>
        board
          .flat()
          .some(
            (square) =>
              square.coordinate[0] === coord[0] &&
              square.coordinate[1] === coord[1] &&
              square.piece === null
          );

      // Move forward (one square)
      const forwardOne = { x, y: y + direction };
      if (forwardOne.y >= 1 && forwardOne.y <= 8) {
        // check if the square in front is empty
        if (isPawnSquareEmpty(board, [forwardOne.x, forwardOne.y])) {
          const forwardOneSquare = board
            .flat()
            .find(
              (square) =>
                square.coordinate[0] === forwardOne.x &&
                square.coordinate[1] === forwardOne.y
            );
          if (forwardOneSquare) VALID_MOVES.push(forwardOneSquare);
        }
      }

      // Move forward (two squares from starting rank)
      if (y === startRank) {
        const forwardTwo = { x, y: y + 2 * direction };
        if (
          forwardTwo.y >= 1 &&
          forwardTwo.y <= 8 &&
          isPawnSquareEmpty(board, [forwardOne.x, forwardOne.y]) &&
          isPawnSquareEmpty(board, [forwardTwo.x, forwardTwo.y])
        ) {
          const forwardTwoSquare = board
            .flat()
            .find(
              (square) =>
                square.coordinate[0] === forwardTwo.x &&
                square.coordinate[1] === forwardTwo.y
            );
          if (forwardTwoSquare) VALID_MOVES.push(forwardTwoSquare);
        }
      }

      // Captures (diagonal moves)

      const captureOffsets = [
        [-1, direction], // left capture
        [1, direction], // right capture
      ];

      for (const [dx, dy] of captureOffsets) {
        const targetX = x + dx;
        const targetY = y + dy;

        if (targetX >= 1 && targetX <= 8 && targetY >= 1 && targetY <= 8) {
          const captureSquare = board.flat().find(
            (square) =>
              square.coordinate[0] === targetX &&
              square.coordinate[1] === targetY &&
              square.piece !== null &&
              square.piece.name[0].toLowerCase() !== color // opponent piece
          );

          if (captureSquare) {
            VALID_MOVES.push(captureSquare);
          }
        }
      }

      return VALID_MOVES.length > 0 ? VALID_MOVES : false;

    case "N":
      const [knightX, knightY] = coordinate;

      const knightMoves = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
      ];

      const validMoves = knightMoves
        .map(([dx, dy]) => [knightX + dx, knightY + dy])
        .filter(([x, y]) => x >= 1 && x <= 8 && y >= 1 && y <= 8) //filter moves within board
        .map(([x, y]) =>
          board
            .flat()
            .find(
              (square) =>
                square.coordinate[0] === x &&
                square.coordinate[1] === y &&
                (square.piece === null ||
                  square.piece?.name[0].toLowerCase() !== color)
            )
        )
        .filter(Boolean) as Square[]; // remove nulls or undefined

      if (validMoves) VALID_MOVES.push(...validMoves);

      console.log(
        "valid knight squares:",
        validMoves.map((sq) => sq?.squareId)
      );

      return VALID_MOVES.length > 0 ? VALID_MOVES : false;

    default:
      return false;
  }
}
