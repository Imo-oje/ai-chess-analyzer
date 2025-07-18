function GameControls({
  resetGame,
  toggleLabels,
}: {
  resetGame: Function;
  toggleLabels: Function;
}) {
  return (
    <section className="game-controls">
      <div className="btn-container">
        <button onClick={() => resetGame()}>New Game</button>
        <button onClick={() => toggleLabels()}>Toggle label</button>
      </div>
    </section>
  );
}
export default GameControls;
