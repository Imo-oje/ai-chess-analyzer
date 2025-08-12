import type { GameOver } from "../App";

function GameOverUI({ gameDetails }: { gameDetails: GameOver }) {
  return (
    <>
      <div className="gameover_tray">
        <p>{gameDetails.reason}!</p>
        <div>Winner: {gameDetails.winner === "w" ? "white" : "black"}</div>
      </div>
    </>
  );
}
export default GameOverUI;
