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
  const [validMoves, setValidMoves] = useState<Square[] | false>(false);
  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string | null;
    coordinate: [number, number];
    piece: { name: string; icon: string } | null;
  } | null>(null);

  function movePiece(_color: string, from: string, to: string) {
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
    setValidMoves(false);
  }

  function handleClick(square: Square) {
    setShakingSquareId(square.squareId);

    let nextValidMoves: Square[] | false = false;

    if (square.piece) {
      nextValidMoves = findValidMoves(board, square.coordinate);
      setValidMoves(nextValidMoves);
    }

    console.log("NextvalidMovesTop", nextValidMoves);
    // console.log("valid mocesssssss", validMoves);

    //console.log("selected:", selectedPiece);

    if (selectedPiece) {
      nextValidMoves = findValidMoves(board, selectedPiece.coordinate);

      if (square.piece) {
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        setValidMoves(findValidMoves(board, square.coordinate));
      }

      //===========
      // Restrict movement for all invalid moves attempt
      //===========

      // Don't capture yourself / move yourself to yourself
      if (square.squareId === selectedPiece.squareId) {
        setSelectedPiece(null);
        setValidMoves(false);
        return;
      }

      // Don't capture pieces with the same color
      if (hasSameColor(square.piece, selectedPiece.piece)) {
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
        //console.log("Knight detected", isKnightMove);
      }

      // If its a pawn
      if (selectedPiece.piece?.name[1] === "P") {
        const [x, y] = square.coordinate;
        const isPawnMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!isPawnMove) return;
      }

      // If its a Bishop
      if (selectedPiece.piece?.name[1] === "B") {
        const [x, y] = square.coordinate;
        const isBishopMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!isBishopMove) return;
      }

      // If its a Rook
      if (selectedPiece.piece?.name[1] === "R") {
        const [x, y] = square.coordinate;
        const isRookMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!isRookMove) return;
      }

      // If its a Queen
      if (selectedPiece.piece?.name[1] === "Q") {
        const [x, y] = square.coordinate;
        const queenMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!queenMove) return;
      }

      // If its a King
      if (selectedPiece.piece?.name[1] === "K") {
        const [x, y] = square.coordinate;
        const kingMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!kingMove) return;
      }

      // Move the piece if its a valid move
      movePiece(
        square.color,
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

    //console.log("SQUARE:", square);
    //console.log("valid moves:", validMoves);
    setTimeout(() => setShakingSquareId(null), 300);
  }

  function resetGame() {
    setBoard(createBoard(piecesMap));
    setValidMoves(false);
    setViewLabel(false);
    setShakingSquareId(null);
    setSelectedPiece(null);
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
        effects={{
          shakingSquareId: shakingSquareId,
          validMoves: validMoves,
        }}
      />
      <GameControls resetGame={resetGame} toggleLabels={toggleLabels} />
    </main>
  );
}

export default App;
