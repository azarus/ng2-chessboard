import { ChessboardEvent } from "./chessboard.event";
import { ChessSquareComponent, ChessPieceComponent } from "../chess";

export class PieceDragOverEvent extends ChessboardEvent
{
	constructor(public square:ChessSquareComponent, public event: any)
	{
		super();
	}
};
