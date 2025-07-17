import { ChildProcessWithoutNullStreams, spawn } from "child_process";

class Stockfish {
  private engine: ChildProcessWithoutNullStreams;
  constructor(engine: string) {
    this.engine = spawn("stockfish", [], { stdio: "pipe" });
    this.setupListeners();
  }

  setupListeners() {
    this.engine.stdout.on("data", (data) => process.stdout.write(data));
    this.engine.stderr.on("data", (data) => process.stderr.write(data));
  }

  sendCommand(command: string) {
    this.engine.stdin.write(`${command}\n`);
  }

  init() {
    this.sendCommand("uci");
    this.sendCommand("isready");
  }

  newGame() {
    this.sendCommand("ucinewgame");
    this.sendCommand("isready");
  }

  setPosition(fen: string) {
    this.sendCommand(`position fen ${fen}`);
  }

  go(depth: number) {
    this.sendCommand(`go depth ${depth}`);
  }

  quit() {
    this.sendCommand("quit");
  }
}

const eng = new Stockfish("stockfish");

eng.init();
eng.newGame();
eng.setPosition("r2k4/pppb3p/5p2/2b1r3/8/6P1/PPP4P/R1B2K1R b - - 1 16");
eng.go(15);
eng.quit();
