//import { createBoard, piecesMap } from "./utils";

export type BoardState = {
  squareId: string;
  color: string;
  coordinate: [number, number];
  piece: { name: string; icon: string } | null;
}[][];

//const BOARD: NewBoardState = createBoard(piecesMap);

// type Player = {
//   name: string;
//   rating: number;
// };

// export class Game {
//   private initialState: NewBoardState = BOARD;
//   private playerOne: Player = { name: "", rating: 4 };
//   new() {
//     return this.initialState;
//   }

//   newPlayer(person: Player) {
//     return (this.playerOne = person);
//   }
// }
