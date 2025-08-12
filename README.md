# React Chess Game

A fully functional chess game built with React and TypeScript. This project supports classic chess gameplay, including castling, en passant, promotion, and check detection.

[Live preview](https://ai-chess-analyzer.vercel.app/)

---

## Features

- Full standard chessboard setup with pieces
- Player turn management (White and Black)
- Valid move calculation for all pieces (King, Queen, Rook, Bishop, Knight, Pawn)
- Pawn promotion with interactive UI
- Castling (Kingside and Queenside) with move tracking
- En Passant capture support
- Check detection with visual marking of threatened kings
- Game state management using React hooks
- Reset game functionality
- UI feedback for selected pieces and valid moves
- Clean separation of logic and UI components

---

## Getting Started

### Prerequisites

- Node.js >= 14.x
- npm

### Installation

```bash
git clone https://github.com/Imo-oje/ai-chess-analyzer.git
cd ai-chess-analyzer/client
npm install
```

### Running the App (client only for now)

```bash
npm run dev
```

### Usage

Click on a piece to select it (only your own pieces allowed)

Valid moves highlight automatically

Click on a highlighted square to move the piece

When a pawn reaches the far end, a promotion UI will appear

Kingside and Queenside castling are supported by moving the king two squares

En Passant capture is supported

Use the reset button to restart the game at any time

### State Management

Key states handled with React useState:

board: Current board layout and pieces

currentPlayer: Tracks which player's turn it is ("w" or "b")

selectedPiece: The currently selected piece (if any)

validMoves: List of valid moves for the selected piece

castleState: Tracks whether kings or rooks have moved for castling rules

enPassantTarget: Coordinates for en passant capture opportunity

isPromoting: Manages promotion UI and logic

UI helper states: selected square highlights, view toggles

### Future Improvements

Checkmate and stalemate detection

Undo and move history functionality

AI opponent or online multiplayer

Better animations and UI polish

Performance optimizations

### License

This project is open source and available under the MIT License.

### Author

Made with ❤️ by savvy

Feel free to contribute or report issues!
