import "./App.css";
import { type BoardState } from "./board.class";
import Board from "./board";
import GameControls from "./game-controls";
import { useState } from "react";
import {
  createBoard,
  hasSameColor,
  isCheckmate,
  markCheckedKing,
  moveInBoard,
  piecesMap,
  type Piece,
  type Square,
} from "./utils";
import findValidMoves from "./valid-moves";
import PromotionUI from "./promotion";
import GameOverUI from "./components/game-over";

type IsPromoting = Square & { targetSquareId: string };

export interface CastleState {
  wKingMoved: boolean;
  wRookKingsideMoved: boolean;
  wRookQueensideMoved: boolean;
  bKingMoved: boolean;
  bRookKingsideMoved: boolean;
  bRookQueensideMoved: boolean;
}

export interface GameOver {
  winner: string;
  reason: "checkmate" | "abandonment" | "resignation" | "timeout";
}

function App() {
  const [board, setBoard] = useState<BoardState>(createBoard(piecesMap));
  const [currentPlayer, setCurrentPlayer] = useState<"w" | "b">("w");
  const [viewLabel, setViewLabel] = useState(false);
  const [clickedPiece, setclickedPiece] = useState<{
    selectedPieceColor: string;
    squareId: string;
  } | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [isPromoting, setIsPromoting] = useState<IsPromoting | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    squareId: string;
    coordinate: [number, number];
    piece: { name: string; icon: string } | null;
  } | null>(null);
  const [castleState, setCastleState] = useState<CastleState>({
    bKingMoved: false,
    bRookKingsideMoved: false,
    bRookQueensideMoved: false,
    wKingMoved: false,
    wRookKingsideMoved: false,
    wRookQueensideMoved: false,
  });
  const [enPassantTarget, setEnPassantTarget] = useState<[number, number]>();
  const [gameOver, setGameOver] = useState<GameOver>();

  let NEW_PIECE: Piece = null;

  function movePiece(from: string, to: string) {
    setBoard((prevBoard) => {
      let newBoard = [...prevBoard];

      const fromSquare = newBoard.flat().find((sq) => sq.squareId === from);
      if (!fromSquare?.piece) return prevBoard;

      const piece = fromSquare.piece;
      const color = piece.name[0];
      const isPawn = piece.name[1] === "P";

      // -------------------------
      // Update castle state if King or Rook moves
      setCastleState((prev) => {
        let updated = { ...prev };

        if (piece.name[1] === "K") {
          if (color === "w") updated.wKingMoved = true;
          else updated.bKingMoved = true;
        }

        if (piece.name[1] === "R") {
          if (color === "w") {
            if (from === "h1") updated.wRookKingsideMoved = true;
            if (from === "a1") updated.wRookQueensideMoved = true;
          } else {
            if (from === "h8") updated.bRookKingsideMoved = true;
            if (from === "a8") updated.bRookQueensideMoved = true;
          }
        }

        return updated;
      });

      // Parse coordinates once
      const fromCoord = fromSquare.coordinate;
      const toSquare = newBoard.flat().find((sq) => sq.squareId === to);
      if (!toSquare) return prevBoard;
      const toCoord = toSquare.coordinate;

      // Handle en passant capture
      if (
        isPawn &&
        toSquare.piece === null &&
        fromCoord[0] !== toCoord[0] // diagonal move without piece (en passant)
      ) {
        const captureRank = color === "w" ? toCoord[1] - 1 : toCoord[1] + 1;
        const captureCoord: [number, number] = [toCoord[0], captureRank];

        newBoard = newBoard.map((row) =>
          row.map((sq) => {
            if (
              sq.coordinate[0] === captureCoord[0] &&
              sq.coordinate[1] === captureCoord[1]
            ) {
              return { ...sq, piece: null };
            }
            return sq;
          })
        );
      }

      // Set en passant target if pawn moved two squares
      // en passant target is the square behind it
      let newEnPassantTarget: [number, number] | undefined = undefined;
      if (isPawn && Math.abs(toCoord[1] - fromCoord[1]) === 2) {
        const epRank = (toCoord[1] + fromCoord[1]) / 2;
        newEnPassantTarget = [toCoord[0], epRank];
      }

      // Normal move logic
      newBoard = newBoard.map((row) =>
        row.map((sq) => {
          if (sq.squareId === to) return { ...sq, piece };
          if (sq.squareId === from) return { ...sq, piece: null };
          return sq;
        })
      );

      setEnPassantTarget(newEnPassantTarget);

      // Checkmate
      const nextPlayer = currentPlayer === "w" ? "b" : "w";
      if (isCheckmate(newBoard, nextPlayer, castleState)) {
        setGameOver({ winner: currentPlayer, reason: "checkmate" });
      }

      return newBoard;
    });

    setCurrentPlayer(currentPlayer === "w" ? "b" : "w");
    setSelectedPiece(null);
    setIsPromoting(null);
    setValidMoves([]);
    setclickedPiece(null);
    setEnPassantTarget(undefined);
  }

  function handleCastleMove(isKingside: boolean) {
    const color = selectedPiece?.piece!.name[0];
    const yRow = color === "w" ? 1 : 8; // rank for white or black
    const rookFrom = isKingside ? `h${yRow}` : `a${yRow}`;
    const rookTo = isKingside ? `f${yRow}` : `d${yRow}`;
    const kingFrom = `e${yRow}`;
    const kingTo = isKingside ? `g${yRow}` : `c${yRow}`;

    setBoard((prevBoard) => {
      let newBoard = [...prevBoard];
      // Move king
      newBoard = moveInBoard(newBoard, kingFrom, kingTo);
      // Move rook
      newBoard = moveInBoard(newBoard, rookFrom, rookTo);
      return newBoard;
    });

    setCastleState((prev) => ({
      ...prev,
      ...(color === "w" ? { wKingMoved: true } : { bKingMoved: true }),
      ...(isKingside
        ? color === "w"
          ? { wRookKingsideMoved: true }
          : { bRookKingsideMoved: true }
        : color === "w"
        ? { wRookQueensideMoved: true }
        : { bRookQueensideMoved: true }),
    }));

    setCurrentPlayer((p) => (p === "w" ? "b" : "w"));
    setSelectedPiece(null);
    setValidMoves([]);
  }

  function handleClick(square: Square, promotingTo?: string) {
    // =====================
    // Promotion has highest priority
    // =====================
    if (isPromoting && promotingTo) {
      const newPiece = Object.entries(piecesMap).find(
        ([key]) => key === promotingTo
      );
      if (!newPiece) return;

      NEW_PIECE = {
        name: promotingTo,
        icon: newPiece[1] as string,
      };

      // Replace the target with the new piece and clear the pawn's old square
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((row) =>
          row.map((sq) => {
            if (sq.squareId === isPromoting.targetSquareId) {
              return { ...sq, piece: NEW_PIECE };
            }
            if (sq.squareId === isPromoting.squareId) {
              return { ...sq, piece: null };
            }
            return sq;
          })
        );

        // Checkmate
        const nextPlayer = currentPlayer === "w" ? "b" : "w";
        if (isCheckmate(newBoard, nextPlayer, castleState)) {
          setGameOver({ winner: currentPlayer, reason: "checkmate" });
        }
        return newBoard;
      });

      setIsPromoting(null);
      setCurrentPlayer((p) => (p === "w" ? "b" : "w"));
      setSelectedPiece(null);
      setValidMoves([]);
      return;
    }

    const isSelecting = !selectedPiece; // no piece selected yet
    const isMoving = !!selectedPiece; // we already have a piece selected

    if (isSelecting) {
      // Only allow selecting your own pieces
      if (!square.piece || square.piece.name[0] !== currentPlayer) return;

      setSelectedPiece({
        coordinate: square.coordinate,
        squareId: square.squareId,
        piece: square.piece,
      });

      setValidMoves(
        findValidMoves(board, square.coordinate, castleState, enPassantTarget)
      );
      return;
    }

    if (isMoving) {
      // Block moving onto your own piece
      if (square.piece && square.piece.name[0] === currentPlayer) {
        // Clicking your own piece = reselect it
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        setValidMoves(
          findValidMoves(board, square.coordinate, castleState, enPassantTarget)
        );
        return;
      }

      // Allow empty squares or opponent's piece (capture)
      const [x, y] = square.coordinate;
      const isValid = validMoves.some(
        (dest) => dest.coordinate[0] === x && dest.coordinate[1] === y
      );
      if (!isValid) return;
    }

    setclickedPiece({
      selectedPieceColor: square.piece?.name[0] as string,
      squareId: square.squareId,
    });

    let nextValidMoves: Square[] = [];

    if (square.piece) {
      nextValidMoves = findValidMoves(
        board,
        square.coordinate,
        castleState,
        enPassantTarget
      );
      setValidMoves(nextValidMoves);
    }

    const updatedBoard = markCheckedKing(
      board,
      square.piece?.name[0] as "w" | "b"
    );
    setBoard(updatedBoard);

    if (selectedPiece) {
      nextValidMoves = findValidMoves(
        board,
        selectedPiece.coordinate,
        castleState,
        enPassantTarget
      );

      console.log("Next valid moves", nextValidMoves);
      console.log("Valid moves", validMoves);

      if (square.piece) {
        setSelectedPiece({
          coordinate: square.coordinate,
          squareId: square.squareId,
          piece: square.piece,
        });
        setValidMoves(
          findValidMoves(board, square.coordinate, castleState, enPassantTarget)
        );
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
          setIsPromoting({
            ...selectedPiece,
            color: color,
            targetSquareId: square.squareId,
          });
          //console.log("//////////", selectedPiece);
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

        // Castling: Check if the move is 2 squares horizontally
        const isKingsideCastle =
          Math.abs(square.coordinate[0] - selectedPiece.coordinate[0]) === 2 &&
          square.coordinate[0] > selectedPiece.coordinate[0];

        const isQueensideCastle =
          Math.abs(square.coordinate[0] - selectedPiece.coordinate[0]) === 2 &&
          square.coordinate[0] < selectedPiece.coordinate[0];

        if (isKingsideCastle || isQueensideCastle) {
          handleCastleMove(isKingsideCastle);
          return;
        }
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
    setCurrentPlayer("w");
    setCastleState({
      bKingMoved: false,
      bRookKingsideMoved: false,
      bRookQueensideMoved: false,
      wKingMoved: false,
      wRookKingsideMoved: false,
      wRookQueensideMoved: false,
    });
    setEnPassantTarget(undefined);
    setGameOver(undefined);
    NEW_PIECE = null;
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

      {gameOver && <GameOverUI gameDetails={gameOver} />}
    </main>
  );
}

export default App;
