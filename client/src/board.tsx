import type { BoardState } from "./board.class";
import type { Square } from "./utils";

function Board({
  board,
  handleClick,
  viewLabel,
  effects,
}: {
  board: BoardState;
  handleClick: Function;
  viewLabel: boolean;
  effects: {
    shakingSquareId: string | null;
    validMoves: Square[];
    sourcePieceColor: string | null;
  };
}) {
  return (
    <>
      <div className="board">
        {board.map((row, index) => (
          <div key={index} className="row">
            {row.map((square) => (
              <div
                onClick={() => handleClick(square)}
                key={square.squareId}
                className={`${square.isChecked ? "checked_king" : ""} square ${
                  square.color
                } ${
                  effects.shakingSquareId === square.squareId ? "shake" : ""
                } ${
                  effects.validMoves.some(
                    (move) =>
                      move.coordinate[0] === square.coordinate[0] &&
                      move.piece?.name[1] !== "K" &&
                      move.coordinate[1] === square.coordinate[1] &&
                      (!square.piece ||
                        square.piece.name[0] !== effects.sourcePieceColor)
                  )
                    ? "square_highlight"
                    : ""
                }
`}
              >
                {square.piece ? (
                  <img src={square.piece.icon} />
                ) : viewLabel ? (
                  square.squareId
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default Board;
