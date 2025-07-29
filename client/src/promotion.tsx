import { piecesMap, type Square } from "./utils";

export default function PromotionUI({
  color,
  handleClick,
  promotingSquare,
}: {
  color: string;
  handleClick: Function;
  promotingSquare: Square;
}) {
  //const pieces = Object.entries(piecesMap);
  const pieces = Object.entries(piecesMap);
  const promotionPieces = pieces.filter(
    ([key]) => key[1] !== "P" && key[1] !== "K" && key[0] === color
  );

  return (
    <div className="promotion_tray">
      {promotionPieces.map(([key, val]) => (
        <img
          onClick={() => handleClick(promotingSquare, key)}
          key={key}
          src={val as string}
          alt={key}
        />
      ))}
    </div>
  );
}
