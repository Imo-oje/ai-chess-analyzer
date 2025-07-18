import "./App.css";
import { type NewBoardState } from "./board.class";
import Board from "./board";
// import GameControls from "./game-controls";
import { useState } from "react";
import { createBoard, piecesMap } from "./utils";
function App() {
  const [board, setBoard] = useState<NewBoardState>(createBoard(piecesMap));

  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string | null;
    piece: string | null;
  } | null>(null);

  function movePiece(from: string, to: string) {
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((square) => {
          if (square.squareId === to) {
            const fromSquare = prevBoard
              .flat()
              .find((sq) => sq.squareId === from);
            return {
              ...square,
              piece: fromSquare?.piece || null,
            }; // set target
          }

          if (square.squareId === from) {
            return { ...square, piece: null }; // clear origin square
          }
          return square;
        })
      )
    );
    setSelectedPiece(null);
  }

  function handleClick(squareId: string, piece: string) {
    console.log(`PIECE: ${piece} SQUARE: ${squareId}`);

    if (selectedPiece) {
      console.log("selected true");
      movePiece(selectedPiece.squareId as string, squareId);
    } else if (piece) {
      setSelectedPiece({ squareId, piece });
    }
  }

  // function resetGame() {
  //   setBoard(createBoard(piecesMap));
  // }

  return (
    <main>
      <Board board={board} handleClick={handleClick} />
      {/* <GameControls resetGame={resetGame} /> */}
    </main>
  );
}

export default App;
