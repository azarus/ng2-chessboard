import { ChessboardEvent } from "./chessboard.event";
import { ChessSquareComponent, ChessPieceComponent } from "../chess";
export class SquareClickedEvent extends ChessboardEvent
{
	constructor(public square: ChessSquareComponent, public piece: ChessPieceComponent, event: any)
	{
		super();
	}
};