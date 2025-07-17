import type { NewBoardState } from "./board.class";

function Board({
  board,
  handleClick,
}: {
  board: NewBoardState;
  handleClick: Function;
}) {
  return (
    <div className="board">
      {board.map((row, index) => (
        <div key={index} className="row">
          {row.map((square) => (
            <div
              onClick={() => handleClick(square.squareId, square.piece)}
              key={square.squareId}
              className={`square ${square.color}`}
            >
              {square.piece ? <img src={square.piece} /> : square.squareId}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
