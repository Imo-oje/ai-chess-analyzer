import type { CastleState } from "./App";
import type { BoardState } from "./board.class";
import type { Square } from "./utils";
import { getEnemyAttackingSquare, getKingSquares } from "./utils";

export function getPawnMoves(
  board: BoardState,
  coordinate: [number, number],
  color: string,
  enPassantTarget?: [number, number]
): Square[] {
  const [x, y] = coordinate;
  const direction = color === "w" ? 1 : -1;
  const startRank = color === "w" ? 2 : 7;
  const moves: Square[] = [];

  const isEmpty = ([cx, cy]: [number, number]) =>
    board.some((sqRow) =>
      sqRow.some(
        (sq) =>
          sq.coordinate[0] === cx &&
          sq.coordinate[1] === cy &&
          sq.piece === null
      )
    );

  const findSquare = ([cx, cy]: [number, number]) =>
    board
      .flat()
      .find((sq) => sq.coordinate[0] === cx && sq.coordinate[1] === cy);

  // Forward one
  if (isEmpty([x, y + direction])) {
    const sq = findSquare([x, y + direction]);
    if (sq) moves.push(sq);
  }

  // Forward two
  if (
    y === startRank &&
    isEmpty([x, y + direction]) &&
    isEmpty([x, y + 2 * direction])
  ) {
    const sq = findSquare([x, y + 2 * direction]);
    if (sq) moves.push(sq);
  }

  // Normal Captures
  for (const dx of [-1, 1]) {
    const tx = x + dx;
    const ty = y + direction;

    const sq = board
      .flat()
      .find(
        (s) =>
          s.coordinate[0] === tx &&
          s.coordinate[1] === ty &&
          s.piece &&
          s.piece.name[0].toLowerCase() !== color &&
          s.piece.name[1] !== "K"
      );
    if (sq) moves.push(sq);
  }

  // En Passant Capture
  if (enPassantTarget) {
    const [ex, ey] = enPassantTarget;
    // Must be exactly one file away and one rank forward
    if (ey === y + direction && Math.abs(ex - x) === 1) {
      const sq = findSquare(enPassantTarget);
      if (sq) moves.push(sq);
    }
  }

  return moves;
}

export function getKnightMoves(
  board: BoardState,
  [x, y]: [number, number]
): // color: string
Square[] {
  const offsets = [
    [2, 1],
    [1, 2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
    [1, -2],
    [2, -1],
  ];
  return offsets
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(([nx, ny]) => nx >= 1 && nx <= 8 && ny >= 1 && ny <= 8)
    .map(([nx, ny]) =>
      board.flat().find(
        (s) => s.coordinate[0] === nx && s.coordinate[1] === ny
        // (!s.piece || s.piece.name[0].toLowerCase() !== color)
      )
    )
    .filter(Boolean) as Square[];
}

export function getSlidingMoves(
  board: BoardState,
  [x, y]: [number, number],
  color: string,
  directions: [number, number][]
): Square[] {
  const moves: Square[] = [];

  for (const [dx, dy] of directions) {
    let cx = x + dx;
    let cy = y + dy;

    while (cx >= 1 && cx <= 8 && cy >= 1 && cy <= 8) {
      const square = board
        .flat()
        .find((sq) => sq.coordinate[0] === cx && sq.coordinate[1] === cy);
      // sq.piece?.name[0] !== color

      if (!square) break;

      moves.push(square);

      // Stop if we hit any piece that is not the enemy piece
      if (square.piece) {
        const isEnemyKing =
          square.piece.name === (color === "w" ? "bK" : "wK") ||
          square.piece.name === (color === "b" ? "wK" : "bK");

        if (!isEnemyKing) break;
        // else: keep going through the king so squares behind king is attacked.
      }

      cx += dx;
      cy += dy;
    }
  }

  return moves;
}

export function getKingMoves(
  board: BoardState,
  coordinate: [number, number],
  color: string,
  oppKingId: string,
  castleState: CastleState
): Square[] {
  const [x, y] = coordinate;
  const directions = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const kingHasMoved = castleState[`${color}KingMoved` as keyof CastleState];
  const rookKingsideHasMoved =
    castleState[`${color}RookKingside` as keyof CastleState];
  const rookQueensideHasMoved =
    castleState[`${color}RookQueenside` as keyof CastleState];

  const oppKingSquares = getKingSquares(oppKingId, board);
  const enemyColor = color === "w" ? "b" : "w";
  const attackedSquares = getEnemyAttackingSquare(board, enemyColor).map(
    (sq) => sq.squareId
  );

  const moves: Square[] = [];

  // 1-square moves
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 1 || nx > 8 || ny < 1 || ny > 8) continue;

    const sq = board
      .flat()
      .find(
        (sq) =>
          sq.coordinate[0] === nx &&
          sq.coordinate[1] === ny &&
          sq.piece?.name[0].toLowerCase() !== color &&
          !oppKingSquares.includes(sq.squareId) &&
          !attackedSquares.includes(sq.squareId)
      );

    if (sq) moves.push(sq);
  }

  // Castling
  if (!kingHasMoved) {
    // Kingside castling
    if (!rookKingsideHasMoved) {
      const pathSquares = [
        [x + 1, y],
        [x + 2, y],
      ];
      const pathClear = pathSquares.every(([px, py]) => {
        const sq = board
          .flat()
          .find((s) => s.coordinate[0] === px && s.coordinate[1] === py);
        return sq && !sq.piece;
      });
      const pathSafe = pathSquares.every(([px, py]) => {
        const sqId = board
          .flat()
          .find(
            (s) => s.coordinate[0] === px && s.coordinate[1] === py
          )?.squareId;
        return sqId && !attackedSquares.includes(sqId);
      });
      const kingSafe = !attackedSquares.includes(
        board
          .flat()
          .find((s) => s.coordinate[0] === x && s.coordinate[1] === y)!.squareId
      );
      if (pathClear && pathSafe && kingSafe) {
        const destSq = board
          .flat()
          .find((s) => s.coordinate[0] === x + 2 && s.coordinate[1] === y);
        if (destSq) moves.push(destSq);
      }
    }

    // Queenside castling
    if (!rookQueensideHasMoved) {
      const pathSquares = [
        [x - 1, y],
        [x - 2, y],
        [x - 3, y], // This square must also be empty
      ];
      const pathClear = pathSquares.every(([px, py]) => {
        const sq = board
          .flat()
          .find((s) => s.coordinate[0] === px && s.coordinate[1] === py);
        return sq && !sq.piece;
      });
      const pathSafe = pathSquares
        .slice(0, 2) // Only squares the king passes through (x-1, x-2) must be safe
        .every(([px, py]) => {
          const sqId = board
            .flat()
            .find(
              (s) => s.coordinate[0] === px && s.coordinate[1] === py
            )?.squareId;
          return sqId && !attackedSquares.includes(sqId);
        });
      const kingSafe = !attackedSquares.includes(
        board
          .flat()
          .find((s) => s.coordinate[0] === x && s.coordinate[1] === y)!.squareId
      );
      if (pathClear && pathSafe && kingSafe) {
        const destSq = board
          .flat()
          .find((s) => s.coordinate[0] === x - 2 && s.coordinate[1] === y);
        if (destSq) moves.push(destSq);
      }
    }
  }

  return moves;
}
