import "./App.css";
import { type NewBoardState } from "./board.class";
import Board from "./board";
import GameControls from "./game-controls";
import { useState } from "react";
import { createBoard, hasSameColor, piecesMap, type Square } from "./utils";
function App() {
  const [board, setBoard] = useState<NewBoardState>(createBoard(piecesMap));
  const [viewLabel, setViewLabel] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string | null;
    piece: { name: string; icon: string } | null;
  } | null>(null);

  function movePiece(_color: string, _name: string, from: string, to: string) {
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((square) => {
          if (square.squareId === from) {
            return { ...square, piece: null }; // clear origin square
          }

          if (square.squareId === to) {
            const fromSquare = prevBoard
              .flat()
              .find((sq) => sq.squareId === from);
            return {
              ...square,
              piece: fromSquare?.piece || null,
            }; // set target
          }

          return square;
        })
      )
    );
    setSelectedPiece(null);
  }

  function handleClick(square: Square) {
    if (selectedPiece) {
      // Don't capture yourself / move yourself to yourself
      if (square.squareId === selectedPiece.squareId) {
        setSelectedPiece(null);
        return;
      }

      // Don't capture pieces with the same color
      if (hasSameColor(square.piece, selectedPiece.piece)) {
        // Let last clicked piece be the selected piece
        setSelectedPiece({ squareId: square.squareId, piece: square.piece });
        return;
      }

      movePiece(
        square.color,
        square.name,
        selectedPiece.squareId as string,
        square.squareId
      );
    } else if (square.piece) {
      setSelectedPiece({ squareId: square.squareId, piece: square.piece });
    }

    console.log("SQUARE:", square);
  }

  function resetGame() {
    setBoard(createBoard(piecesMap));
  }

  function toggleLabels() {
    setViewLabel(!viewLabel);
  }

  return (
    <main>
      <Board board={board} handleClick={handleClick} viewLabel={viewLabel} />
      <GameControls resetGame={resetGame} toggleLabels={toggleLabels} />
    </main>
  );
}

export default App;
