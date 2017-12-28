import { Renderer2 } from "@angular/core";
import { ChessboardComponent } from "../chessboard.component";
import { ChessPieceComponent } from "./piece.component";

export class ChessSquareComponent
{
	highlights:string[] = [];
	squareType: string = "light";
	isAttached = false;
	piece:ChessPieceComponent = null;

	// Private Internals
	squareElement:HTMLDivElement = null;
	indicatorElements: HTMLDivElement[] = [];
	timerElement: HTMLDivElement;

	constructor(public renderer: Renderer2, public board: ChessboardComponent, public x: number, public y: number)
	{
		this.createElement();
	}

	setSquareType(type)
	{
		this.renderer.removeClass(this.squareElement, this.squareType);
		this.squareType = type;
		this.renderer.addClass(this.squareElement, this.squareType);
		
	}

	createElement()
	{
		this.squareElement = this.renderer.createElement("div");
		this.timerElement = this.renderer.createElement("div");
		
		this.renderer.addClass(this.squareElement, "square");
		this.renderer.addClass(this.squareElement, this.squareType);
		this.registerEvents();

		
		this.timerElement = this.renderer.createElement("div");
		this.renderer.setStyle(this.timerElement, "display", "none");
		this.renderer.addClass(this.timerElement, "timeout-overlay");
		this.renderer.appendChild(this.squareElement, this.timerElement);
	

	}

	registerEvents()
	{
		this.squareElement.addEventListener("mouseup", this.OnSquareClicked.bind(this), false);
	}

	unregisterEvents()
	{
		this.squareElement.removeEventListener("mouseup", this.OnSquareClicked.bind(this), false);
	}

	OnSquareClicked(event: MouseEvent)
	{
		this.board.onSquareClicked(this, this.piece, event);
	}

	attach(target)
	{
		
		this.renderer.appendChild(target, this.squareElement);
		this.isAttached = true;
	}

	dettach()
	{
		if(!this.isAttached)
			return;

		this.renderer.removeChild(this.squareElement.parentElement, this.squareElement);
		this.isAttached = false;
	}

	destroy()
	{
		this.clearHighlights();
		this.clearIndicators();
		this.clearPiece();
		this.dettach();
		this.unregisterEvents();
		this.renderer.removeChild(this.squareElement, this.timerElement);
		this.squareElement = null;
		this.timerElement = null;
		
		if(this.timerEltimer)
		{
			clearTimeout(this.timerEltimer);
		}
		
		if(this.activatedTimer)
		{
			clearTimeout(this.activatedTimer);
		}

	}

	// Pieces

	setPiece(pieceType:string, color: string)
	{
		this.clearPiece(); // Remove existing piece if any
		this.piece = new ChessPieceComponent(this.renderer, this.board, pieceType, color, this); // set new piece
		this.piece.attach(this.squareElement);
	}

	getPiece(piece)
	{
		return this.piece;
	}
	
	clearPiece()
	{
		if(!this.piece)
		{
			return;
		}
			
		this.piece.destroy();
		this.piece = null;
	}

	// Highlights
	setHighlight(highlight)
	{
		this.renderer.addClass(this.squareElement, highlight);
		this.highlights.push(highlight);
	}

	removeHighlight(highlight)
	{
		this.highlights.splice(this.highlights.indexOf(highlight), 1);
		this.renderer.removeClass(this.squareElement, highlight);
	}

	hasHighlight(highlight)
	{
		return this.highlights.includes(highlight);
	}

	toggleHighlight(highlight)
	{
		if(this.hasHighlight(highlight))
		{
			this.removeHighlight(highlight);
		}else{
			this.setHighlight(highlight);
		}
	}

	clearHighlights()
	{
		for(var highlight of this.highlights)
		{
			this.removeHighlight(highlight);
		}
	}

	// Indicators
	clearIndicators()
	{
		for(var indicator of this.indicatorElements)
		{
			this.removeIndicator(indicator);
		}
	}

	removeIndicator(indicator)
	{
		this.renderer.removeChild(this.squareElement, indicator);
	}
	
	addIndicator(side:string, text: string)
	{
		let indicator:HTMLDivElement = this.renderer.createElement("div");
		this.renderer.addClass(indicator, "indicator");
		this.renderer.addClass(indicator, side);
		this.renderer.addClass(indicator, this.squareType);
		indicator.innerText = text;
		this.renderer.appendChild(this.squareElement, indicator);
		this.indicatorElements.push(indicator);
		return indicator;
	}

	timerEltimer = null;
	activatedTimer = null;
	setTimer(time)
	{
		if(this.timerEltimer)
		{
			clearTimeout(this.timerEltimer);
		}
		
		if(this.activatedTimer)
		{
			clearTimeout(this.activatedTimer);
		}

		this.timerElement.classList.remove("expired");
		this.timerElement.classList.add("active");
		
		this.timerElement.style.display = 'block';
		this.timerElement.style.transition = "none";
		this.timerElement.style.height = '100%';

		this.timerElement.offsetWidth; // Idk what's this doing :S

		this.timerElement.style.transition = "all " + time + "ms";
		this.timerElement.style.height = '5%';

		this.timerEltimer = setTimeout(() => {
				
			this.timerElement.style.transition = "none";
			this.timerElement.style.height = '100%';
			
			this.timerElement.offsetWidth; // Idk what's this doing :S

			this.timerElement.style.transition = "all 500ms";
			this.timerElement.classList.add("expired");
			this.timerElement.classList.remove("active");

			this.activatedTimer = setTimeout(() => {
				this.timerElement.classList.remove("active");
				this.timerElement.classList.remove("expired");
				if(this.timerElement)
				{
					this.renderer.setStyle(this.timerElement, "display", "none");
				}
				
			}, 1000);

			
			this.timerEltimer = null;
		}, time);
	}

	clearTimer()
	{
		this.timerElement.classList.remove("expired");
		this.timerElement.classList.remove("active");
		this.timerElement.style.transition = "none";
		this.timerElement.style.height = '0%';
		
		if(this.timerEltimer)
		{
			clearTimeout(this.timerEltimer);
		}
		
		if(this.activatedTimer)
		{
			clearTimeout(this.activatedTimer);
		}

		//this.timerElement.style.display = "none";
	}

	getRect()
	{
		return this.squareElement.getBoundingClientRect();
	}
};