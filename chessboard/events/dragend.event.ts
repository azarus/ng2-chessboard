import { ChessboardEvent } from "./chessboard.event";
import { ChessSquareComponent, ChessPieceComponent } from "../chess";

export class PieceDragEndEvent extends ChessboardEvent
{
	constructor(public fromSquare:ChessSquareComponent, public toSquare: ChessSquareComponent, public event: any)
	{
		super();
	}
};
