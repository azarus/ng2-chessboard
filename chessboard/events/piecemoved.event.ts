import { ChessboardEvent } from "./chessboard.event";

export class PieceMovedEvent extends ChessboardEvent
{
	constructor(public fromSquare:any, public toSquare: any, public piece: any) {
		super();
	}
};
