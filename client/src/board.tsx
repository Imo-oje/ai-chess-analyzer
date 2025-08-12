import type { BoardState } from "./board.class";
import SquareTile from "./square-tile";
import type { Square } from "./utils";

function Board({
  board,
  handleClick,
  viewLabel,
  effects,
}: {
  board: BoardState;
  handleClick: (square: Square) => void;
  viewLabel: boolean;
  effects: {
    shakingSquareId: string | null;
    validMoves: Square[];
    sourcePieceColor: string | null;
  };
}) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((square) => {
            const isShaking = effects.shakingSquareId === square.squareId;
            const isHighlighted = effects.validMoves.some(
              (move) =>
                move.coordinate[0] === square.coordinate[0] &&
                move.piece?.name[1] !== "K" &&
                move.coordinate[1] === square.coordinate[1] &&
                (!square.piece ||
                  square.piece.name[0] !== effects.sourcePieceColor)
            );

            return (
              <SquareTile
                key={square.squareId}
                square={square}
                onClick={handleClick}
                isChecked={square.isChecked as boolean}
                isShaking={isShaking}
                isHighlighted={isHighlighted}
                viewLabel={viewLabel}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Board;
