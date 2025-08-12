import type { Square } from "./utils";

interface SquareTileProps {
  square: Square;
  onClick: (square: Square) => void;
  isChecked: boolean;
  isShaking: boolean;
  isHighlighted: boolean;
  viewLabel: boolean;
}

export default function SquareTile({
  square,
  onClick,
  isChecked,
  isShaking,
  isHighlighted,
  viewLabel,
}: SquareTileProps) {
  return (
    <div
      onClick={() => onClick(square)}
      className={`${isChecked ? "checked_king" : ""} square ${square.color} 
        ${isShaking ? "shake" : ""} 
        ${isHighlighted ? "square_highlight" : ""}`}
    >
      {square.piece ? (
        <img src={square.piece.icon} alt={square.piece.name} />
      ) : viewLabel ? (
        square.squareId
      ) : null}
    </div>
  );
}
