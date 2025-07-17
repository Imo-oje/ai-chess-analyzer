//import { createBoard, piecesMap } from "./utils";

export type NewBoardState = {
  squareId: string;
  color: string;
  piece: string | null;
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
