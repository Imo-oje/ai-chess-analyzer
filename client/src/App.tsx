import "./App.css";
import { type BoardState } from "./board.class";
import Board from "./board";
import GameControls from "./game-controls";
import { useState } from "react";
import { createBoard, hasSameColor, piecesMap, type Square } from "./utils";
import findValidMoves from "./valid-moves";

function App() {
  const [board, setBoard] = useState<BoardState>(createBoard(piecesMap));
  const [viewLabel, setViewLabel] = useState(false);
  const [shakingSquareId, setShakingSquareId] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string | null;
    coordinate: [number, number];
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
    setShakingSquareId(square.squareId);

    const validMoves = findValidMoves(board, square.coordinate);
    console.log("valid moves:", validMoves);

    if (selectedPiece) {
      // Don't capture yourself / move yourself to yourself
      if (square.squareId === selectedPiece.squareId) {
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        return;
      }

      // Don't capture pieces with the same color
      if (hasSameColor(square.piece, selectedPiece.piece)) {
        // Let last clicked piece be the selected piece
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        return;
      }

      // If its a knight
      if (selectedPiece.piece?.name[1] === "N") {
        const isKnightMove = (() => {
          const [dx, dy] = [
            Math.abs(square.coordinate[0] - selectedPiece.coordinate[0]),
            Math.abs(square.coordinate[1] - selectedPiece.coordinate[1]),
          ];
          return dx + dy === 3 && dx !== 0 && dy !== 0;
        })();

        if (!isKnightMove) return;

        //moveKnight();

        console.log("Knight detected", isKnightMove);
      }

      return movePiece(
        square.color,
        square.name,
        selectedPiece.squareId as string,
        square.squareId
      );
    } else if (square.piece) {
      setSelectedPiece({
        coordinate: square.coordinate,
        squareId: square.squareId,
        piece: square.piece,
      });
    }

    console.log("SQUARE:", square);
    console.log("valid moves:", validMoves);
    setTimeout(() => setShakingSquareId(null), 300);
  }

  function resetGame() {
    setBoard(createBoard(piecesMap));
  }

  function toggleLabels() {
    setViewLabel(!viewLabel);
  }

  return (
    <main>
      <Board
        board={board}
        handleClick={handleClick}
        viewLabel={viewLabel}
        effects={{ shakingSquareId: shakingSquareId }}
      />
      <GameControls resetGame={resetGame} toggleLabels={toggleLabels} />
    </main>
  );
}

export default App;
