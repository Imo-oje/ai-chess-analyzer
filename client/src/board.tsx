import type { NewBoardState } from "./board.class";

function Board({
  board,
  handleClick,
  viewLabel,
  effects,
}: {
  board: NewBoardState;
  handleClick: Function;
  viewLabel: boolean;
  effects: { shakingSquareId: string | null };
}) {
  return (
    <div className="board">
      {board.map((row, index) => (
        <div key={index} className="row">
          {row.map((square) => (
            <div
              onClick={() => handleClick(square)}
              key={square.squareId}
              className={`square ${square.color} ${
                effects.shakingSquareId === square.squareId ? "shake" : ""
              }`}
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
  );
}

export default Board;
