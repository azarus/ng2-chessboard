import { ChessboardEvent } from "./chessboard.event";
import { ChessSquareComponent, ChessPieceComponent } from "../chess";

export class PieceDragStartEvent extends ChessboardEvent
{
	constructor(public square:ChessSquareComponent, public piece: ChessPieceComponent, public event: any)
	{
		super();
	}
};
