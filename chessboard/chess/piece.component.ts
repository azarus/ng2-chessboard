import { Renderer2 } from "@angular/core";
import { ChessboardComponent } from "../chessboard.component";
import { ChessSquareComponent } from "./square.component";

export class ChessPieceComponent
{
	pieceElement: HTMLImageElement = null;

	isAttached = false;

	constructor(public renderer: Renderer2, public board: ChessboardComponent, public pieceType: string, public color: string, public square: ChessSquareComponent)
	{
		this.pieceType = pieceType;
		this.color = color;
		this.setSquare(square);
		this.createElement();
	}

	getSymbol()
	{
		return this.color + this.pieceType;
	}

	setSquare(square: ChessSquareComponent)
	{
		if(this.square)
		{
			this.square.piece = null;
		}

		this.square = square;
		square.piece = this;
	}

	getSquare()
	{
		return this.square;
	}

	createElement()
	{
		this.pieceElement = this.renderer.createElement("img");
		this.pieceElement.src = this.board.getPieceImage(this.getSymbol());

		this.renderer.addClass(this.pieceElement, "piece");
		this.renderer.setAttribute(this.pieceElement, "draggable", "true");
		
	}

	attach(target)
	{
		this.renderer.appendChild(target, this.pieceElement);
		this.isAttached = true;
	}

	detach()
	{
		if(!this.isAttached)
			return;
		
		this.renderer.removeChild(this.pieceElement.parentElement, this.pieceElement);
		this.isAttached = false;
	}
	
	destroy()
	{
		clearTimeout(this.currentAnimation);
		this.currentAnimation = null;
		this.detach();
		this.pieceElement = null;
	}

	getPosition()
	{
		return this.square.getRect();
	}

	move(toSquare: ChessSquareComponent, animSpeed=100)
	{
		let oldPosition = this.getPosition();

	 	toSquare.clearPiece();

	 	this.attach(toSquare.squareElement);
	 	this.setSquare(toSquare);
		this.animate(oldPosition, animSpeed);
	}
	
	animateTo(toSquare: ChessSquareComponent, animSpeed=100)
	{
		let oldPosition = this.getPosition();
		var toPiece = null;
		if(toSquare.piece)
		{
			toPiece = toSquare.piece.detach();
		}

	 	this.attach(toSquare.squareElement);
	 	//this.setSquare(toSquare);
		this.square = toSquare;
		this.animate(oldPosition, animSpeed);
		return toPiece;
	}

	currentAnimation = null;
	animate(previousPosition, animationSpeed=200)
	{
		if( this.currentAnimation )
		{
			clearTimeout(this.currentAnimation);
			this.currentAnimation = null;
		}
		
		var currentPosition = this.getPosition();
		this.pieceElement.style.transition = "none";
		this.pieceElement.style.transform = 'translate3d('+ (previousPosition.left - currentPosition.left) + 'px,' + (previousPosition.top - currentPosition.top) + 'px, 0)';

		this.pieceElement.offsetWidth; // Idk what's this doing :S

		this.pieceElement.style.transition = "all " + animationSpeed + "ms";
		this.pieceElement.style.transform = 'translate3d(0, 0, 0)';


		this.currentAnimation = setTimeout(() => {
			
			// ...
			this.pieceElement.style.transform = '';
			this.pieceElement.style.transition = "none";
			
			this.currentAnimation = null;
		}, animationSpeed);

	}
};