import { ChessboardEvent } from "./chessboard.event";

export class PieceSelectedEvent extends ChessboardEvent
{
	constructor(public square:any, public piece: any) {
		super();
	}
};
