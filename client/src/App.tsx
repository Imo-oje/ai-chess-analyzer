import "./App.css";
import { type BoardState } from "./board.class";
import Board from "./board";
import GameControls from "./game-controls";
import { useState } from "react";
import {
  createBoard,
  hasSameColor,
  markCheckedKing,
  piecesMap,
  type Piece,
  type Square,
} from "./utils";
import findValidMoves from "./valid-moves";
import PromotionUI from "./promotion";

function App() {
  const [board, setBoard] = useState<BoardState>(createBoard(piecesMap));
  const [viewLabel, setViewLabel] = useState(false);
  const [clickedPiece, setclickedPiece] = useState<{
    selectedPieceColor: string;
    squareId: string;
  } | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [isPromoting, setIsPromoting] = useState<Square | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string;
    coordinate: [number, number];
    piece: { name: string; icon: string } | null;
  } | null>(null);

  let NEW_PIECE: Piece = null;

  function movePiece(from: string, to: string) {
    console.log("while moving", isPromoting);
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((square) => {
          if (square.squareId === to) {
            const fromSquare = prevBoard
              .flat()
              .find((sq) => sq.squareId === from);
            return {
              ...square,
              piece: isPromoting ? NEW_PIECE : fromSquare?.piece || null,
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
    setIsPromoting(null);
    setValidMoves([]);
  }

  function handleClick(square: Square, promotingTo?: string) {
    setclickedPiece({
      selectedPieceColor: square.piece?.name[0] as string,
      squareId: square.squareId,
    });

    let nextValidMoves: Square[] = [];

    if (square.piece) {
      nextValidMoves = findValidMoves(board, square.coordinate);
      setValidMoves(nextValidMoves);
    }

    const updatedBoard = markCheckedKing(
      board,
      square.piece?.name[0] as "w" | "b"
    );
    setBoard(updatedBoard);

    if (selectedPiece) {
      nextValidMoves = findValidMoves(board, selectedPiece.coordinate);

      if (square.piece) {
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        setValidMoves(findValidMoves(board, square.coordinate));
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }

      //===========
      // Restrict movement for all invalid moves attempt
      //===========

      // Don't capture yourself / move yourself to yourself
      if (square.squareId === selectedPiece.squareId) {
        setSelectedPiece(null);
        setValidMoves([]);
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

      // Don't capture king
      if (selectedPiece.piece && square.piece?.name[1] === "K") return;

      if (isPromoting) {
        console.log("promoting from", square);
        console.log("promoting to", promotingTo);
        console.log("promotion happens on", selectedPiece);
      }

      console.log("currently selected", selectedPiece);

      // Handle Promotion
      if (isPromoting) {
        const newPiece = Object.entries(piecesMap).filter(
          ([key]) => key === promotingTo
        );

        const replceMent: Piece = {
          name: promotingTo as string,
          icon: newPiece[0][1] as string,
        };

        NEW_PIECE = replceMent;
        console.log("newwwwwwwwwwwww", NEW_PIECE);
        return movePiece(square.squareId, selectedPiece.squareId);
      }

      // If its a knight
      if (selectedPiece.piece?.name[1] === "N") {
        const [x, y] = square.coordinate;
        const isKnightMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!isKnightMove) return;
        //console.log("Knight detected", isKnightMove);
      }

      // If its a pawn
      if (selectedPiece.piece?.name[1] === "P") {
        const [x, y] = square.coordinate;
        const color = selectedPiece.piece?.name[0];
        const isPawnMove =
          nextValidMoves &&
          nextValidMoves.some(
            (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
          );

        if (!isPawnMove) return;

        if (square.coordinate[1] === 8 || square.coordinate[1] === 1) {
          setIsPromoting({ ...selectedPiece, color: color });
          console.log("//////////", selectedPiece);

          console.log(`${color} about to promote.........`);
          console.log("...........", selectedPiece);

          // todo: place game state on hold while promoting
          return;
        }

        console.log("..................,", square.piece);
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
      movePiece(selectedPiece.squareId as string, square.squareId);
    } else if (square.piece) {
      setSelectedPiece({
        coordinate: square.coordinate,
        squareId: square.squareId,
        piece: square.piece,
      });
    }

    console.log("SQUARE:", square);
    //console.log("valid moves:", validMoves);
    setTimeout(
      () =>
        setclickedPiece((prev) => (prev ? { ...prev, squareId: "" } : null)),
      300
    );
  }

  function resetGame() {
    setBoard(createBoard(piecesMap));
    setValidMoves([]);
    setViewLabel(false);
    setSelectedPiece(null);
    setclickedPiece(null);
    setIsPromoting(null);
  }

  function toggleLabels() {
    setViewLabel(!viewLabel);
  }

  return (
    <main className="main">
      <div>
        <h2 className="love">Made with love by savvy</h2>
      </div>
      <Board
        board={board}
        handleClick={handleClick}
        viewLabel={viewLabel}
        effects={{
          shakingSquareId: clickedPiece?.squareId as string,
          sourcePieceColor: clickedPiece?.selectedPieceColor as string,
          validMoves,
        }}
      />
      <GameControls resetGame={resetGame} toggleLabels={toggleLabels} />
      {isPromoting && (
        <PromotionUI
          color={isPromoting.color}
          handleClick={handleClick}
          promotingSquare={isPromoting}
        />
      )}
    </main>
  );
}

export default App;
