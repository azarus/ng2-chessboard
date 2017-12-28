import { Input, Output, EventEmitter, ViewChild, ElementRef, Component, Renderer2, OnDestroy, AfterViewInit, OnInit, NgZone, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { MediaMonitor, ObservableMedia, MediaChange } from "@angular/flex-layout";
// Import Events
import { SquareClickedEvent, PieceDragOverEvent, PieceMovedEvent, PieceSelectedEvent, PieceDragStartEvent, PieceDragEndEvent } from "./events";
import { ChessPieceComponent, ChessSquareComponent } from "./chess";

const CHESS_SIDES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];


@Component({
	selector: "chessboard",
	templateUrl: "chessboard.component.html",
	styleUrls: ["chessboard.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessboardComponent implements OnDestroy, AfterViewInit, OnInit
{
	@ViewChild("boardContainer", {read: ElementRef})
	boardContainer: ElementRef;

	getBoardContainerElement(): HTMLDivElement
	{
		return this.boardContainer.nativeElement;
	}

	@ViewChild("chessboard", {read: ElementRef})
	chessboard: ElementRef;
	
	getBoardElement(): HTMLDivElement
	{
		return this.chessboard.nativeElement;
	}

	getHostElement()
	{
		return this.hostElement.nativeElement;
	}

	@Input("boardWidth")
	boardWidth = 8;

	@Input("boardHeight")
	boardHeight = 8;

	@Input("flipped")
	isFlipped = false;

	@Input("themePath")
	themePath = "./assets/chess/wikipedia/";
	
	getPieceImage(pieceType)
	{
		return this.themePath + pieceType + ".png";
	}

	@Input("animationSpeed")
	animationSpeed: number = 500;

	// Events
	@Output("boardReady")
	boardReady = new EventEmitter<any>();

	// Events
	@Output("squareClicked")
	squareClicked = new EventEmitter<SquareClickedEvent>();

	@Output("pieceSelected")
	pieceSelected = new EventEmitter<PieceSelectedEvent>();

	@Output("pieceMoved")
	pieceMoved = new EventEmitter<PieceMovedEvent>();

	@Output("pieceDragStart")
	pieceDragStart = new EventEmitter<PieceDragStartEvent>();

	@Output("pieceDragEnd")
	pieceDragEnd = new EventEmitter<PieceDragEndEvent>();

	@Output("pieceDragOver")
	pieceDragOver = new EventEmitter<PieceDragOverEvent>();

	// Internals
	board:any[] = [];
	boardCreated = false;

	boardSize = {
		width: 0,
		height: 0,
	};

	constructor(
		private media: ObservableMedia,
		private mediaMonitor: MediaMonitor,
		private renderer: Renderer2,
		private zone: NgZone,
		private hostElement: ElementRef,
	)
	{
	}
	
	// Lifecycle hooks
	ngOnInit()
	{
	}

	ngOnDestroy()
	{
		this.destroyBoard();
	}
	

	ngOnChanges(changes)
	{
		// If no board then do nothing.
		if(!this.boardCreated)
		{
			return this.createBoard();
		}

		if(changes.isFlipped)
		{
			// Recreate board when flipped
			var board = this.getBoard();
			this.createBoard();
			this.setBoard(board);
		}
	}

	ngAfterViewInit()
	{
		if(!this.boardCreated)
		{
			this.createBoard();
		}

		setTimeout(() => {
			this.boardReady.next();
		}, 100);
		
	}


	ngAfterViewChecked()
	{
		this.resizeBoard();
	}

	// Event listeners
	@HostListener("window:resize", ["$event"])
	OnWindowResized(e)
	{
		this.resizeBoard();
	}


	dragStartSquare: ChessSquareComponent = null;
	draggEndSquare: ChessSquareComponent = null;
	@HostListener("dragstart", ["$event"])
	OnDragStart(e)
	{
		if(!e.target || this.isTouchActive)
		{
			e.preventDefault();
			return;
		}

		var square = this.findSquare((square) => {
			if(e.target == square.squareElement)
				return true;
			if(square.piece && e.target == square.piece.pieceElement)
				return true;
			return false;
		});

		if(!square)
		{
			e.preventDefault();
			return;
		}

		var dragEvent = new PieceDragStartEvent(square, square.piece, e);
		this.pieceDragStart.next(dragEvent);
		if(dragEvent.isPrevented())
		{
			e.preventDefault();
			return;
		}
		this.dragStartSquare = null;
		this.draggEndSquare = null;

		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text", "chess");
		this.dragStartSquare = square;
		this.draggEndSquare = square;
		
	}

	@HostListener("drop", ["$event"])
	OnDragDrop(e)
	{
		e.preventDefault();

		if(!this.dragStartSquare)
			return;

		if(!this.draggEndSquare)
			return;

		var dragEvent = new PieceDragEndEvent(this.dragStartSquare, this.draggEndSquare, e);
		this.pieceDragEnd.next(dragEvent);
		if(dragEvent.isPrevented())
		{
			return;
		}
		
		this.move(this.getFEN(this.dragStartSquare), this.getFEN(this.draggEndSquare));
		this.dragStartSquare = null;
		this.draggEndSquare = null;
		
	}

	@HostListener("dragover", ["$event"])
	OnDragOver(e)
	{
		var square = this.findSquare((square) => {
			if(e.target == square.squareElement)
				return true;
			if(square.piece && e.target == square.piece.pieceElement)
				return true;
			return false;
		});

		if(square)
		{
			var dragOverEvent = new PieceDragOverEvent(square, e);
			this.pieceDragOver.next(dragOverEvent);
			if(dragOverEvent.isPrevented())
			{
				return;
			}
		}
		this.draggEndSquare = square;
		
		e.preventDefault();
		e.stopPropagation();
	}

	@HostListener("dragend", ["$event"])
	OnDragEnd(e)
	{
		e.preventDefault();
		e.stopPropagation();
	}
	
	onSquareClicked(square: ChessSquareComponent, piece: ChessPieceComponent, event:MouseEvent)
	{
		var clickEvent = new SquareClickedEvent(square, piece, event);
		this.squareClicked.next(clickEvent);
		// If the event is prevented do nothing
		if(clickEvent.isPrevented())
		{
			return;
		}
		
	}
	
	isTouchActive = false;
	
	// Drag & Drop
	@HostListener("touchstart", ["$event"])
	OnTouchStart(e: TouchEvent)
	{
		this.isTouchActive = true;


		if(!e.target)
		{
			this.stopEmulatedDrag();
			return;
		}
		
		var square = this.findSquare((square) => {
			if(e.target == square.squareElement)
				return true;
			if(square.piece && e.target == square.piece.pieceElement)
				return true;
			return false;
		});

		if(square)
		{
			var dragEvent = new PieceDragStartEvent(square, square.piece, e);
			this.pieceDragStart.next(dragEvent);
			if(dragEvent.isPrevented())
			{
				this.stopEmulatedDrag();
				return;
			}
					
			this.dragStartSquare = null;
			this.draggEndSquare = null;
			if(square.piece)
			{
				this.startEmulatedDrag(square.piece, e.touches[0].clientX, e.touches[0].clientY);
				this.emulateDrag(e.touches[0].clientX, e.touches[0].clientY);
				this.dragStartSquare = square;
				this.draggEndSquare = square;
			}
		}
	}

	@HostListener("touchend", ["$event"])
	OnTouchEnd(e)
	{
		this.isTouchActive = false;
		this.stopEmulatedDrag();

		if(!this.dragStartSquare)
			return;


		if(!this.draggEndSquare)
			return;

		var dragEvent = new PieceDragEndEvent(this.dragStartSquare, this.draggEndSquare, e);
		this.pieceDragEnd.next(dragEvent);
		if(dragEvent.isPrevented())
		{
			return;
		}
		
		this.move(this.getFEN(this.dragStartSquare), this.getFEN(this.draggEndSquare));
		this.dragStartSquare = null;
		this.draggEndSquare = null;
	
	}

	@HostListener("touchmove", ["$event"])
	OnTouchMove(e)
	{
		this.emulateDrag(e.touches[0].clientX, e.touches[0].clientY);

		var target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
		if(!target)
		{
			e.preventDefault();
			return;
		}
			

		var square = this.findSquare((square) => {
			if(target == square.squareElement)
				return true;
			if(square.piece && target == square.piece.pieceElement)
				return true;
			return false;
		});

		if(square)
		{
			var dragOverEvent = new PieceDragOverEvent(square, e);
			this.pieceDragOver.next(dragOverEvent);
			if(dragOverEvent.isPrevented())
			{
				return;
			}
		}
		this.draggEndSquare = square;
		
		e.preventDefault();
	}

	clearDragSquares()
	{
		this.dragStartSquare = null;
		this.draggEndSquare = null;
	}

	emulatedElement = null;
	emulatedDragOffset = {x:0, y:0};

			
	startEmulatedDrag(piece: ChessPieceComponent, x, y)
	{
		this.stopEmulatedDrag();
		this.emulatedElement = piece.pieceElement.cloneNode(true);
		var scale = 2;
		var pieceSize = {
			width: piece.pieceElement.clientWidth ,
			height: piece.pieceElement.clientHeight,
		};
		this.renderer.addClass(this.emulatedElement, "draggable-ghost-item");
		this.renderer.setStyle(this.emulatedElement, "position", "fixed");
		this.renderer.setStyle(this.emulatedElement, "top", -(pieceSize.height * scale) + "px");
		this.renderer.setStyle(this.emulatedElement, "left", -(pieceSize.width) + "px");
		this.renderer.setStyle(this.emulatedElement, "overflow", "hidden");
		this.renderer.setStyle(this.emulatedElement, "display", "block");
		this.renderer.setStyle(this.emulatedElement, "transition", "none");
		
		this.renderer.setStyle(this.emulatedElement, "touch-action", "none");
		this.renderer.setStyle(this.emulatedElement, "pointer-events", "none");

		this.renderer.setStyle(this.emulatedElement, "width", (pieceSize.width * scale) + "px");
		this.renderer.setStyle(this.emulatedElement, "height", (pieceSize.height * scale) + "px");
		this.renderer.appendChild(this.getBoardElement(), this.emulatedElement);

		let draggableRect = piece.getPosition();
	//	this.emulatedDragOffset.x = x - (pieceSize.width/scale);
	//	this.emulatedDragOffset.y = y - (pieceSize.height/scale);
		this.emulatedDragOffset.x = x - draggableRect.left - (pieceSize.width/scale);
		this.emulatedDragOffset.y = y - draggableRect.top - (pieceSize.height/scale);

	}

	emulateDrag(x, y)
	{
		if(!this.emulatedElement)
			return;
	
		var left = x - this.emulatedDragOffset.x;
		var top = y - this.emulatedDragOffset.y;

		this.renderer.setStyle(this.emulatedElement, "transform", "translate(" + (left)  + "px, " + (top) + "px)")
	}

	stopEmulatedDrag()
	{
		if(this.emulatedElement)
		{
			this.getBoardElement().removeChild(this.emulatedElement);
			this.emulatedElement = null;
		}
		this.emulatedDragOffset = {x:0, y:0};
	}

	// Board Events
	createBoard()
	{
		this.destroyBoard();
		this.board = [];
		if(this.isFlipped)
		{
			for(var y=this.boardHeight-1;y>=0;--y)
			{
				var isLight = (y % 2) == 0;
				var row = [];
				for(var x=this.boardWidth-1;x>=0;--x)
				{
					var square = new ChessSquareComponent(this.renderer, this, x, y);
					square.setSquareType((isLight ? "light" : "dark" ));
					square.attach(this.getBoardElement());
					row[x] = square;
					isLight = !isLight;
				}
				this.board[y] = row;
			}

		}else{

			for(var y=0;y<this.boardHeight;++y)
			{
				var isLight = (y % 2) == 1;
				var row = [];
				for(var x = 0;x<this.boardWidth;++x)
				{
					var square = new ChessSquareComponent(this.renderer, this, x, y);
					square.setSquareType((isLight ? "light" : "dark" ));
					square.attach(this.getBoardElement());
					row.push(square);
					isLight = !isLight;
				}
				this.board[y] = row;
			}
		}
	
		for(var i=0;i<this.boardWidth;++i)
		{
			let square = this.getSquareXY(i, (this.isFlipped?0:this.boardHeight-1));
			square.addIndicator("horizontal", CHESS_SIDES[i]);
		}

		for(var i=0;i<this.boardHeight;++i)
		{
			let square = this.getSquareXY((this.isFlipped?this.boardWidth-1:0), i);
			square.addIndicator("vertical", (this.boardHeight - i).toString());
		}

		this.boardCreated = true;
	}

	destroyBoard()
	{
		this.boardCreated = false;
		for(var row of this.board)
		{
			for(var square of row)
			{
				square.destroy();
			}
		}
		this.board = [];
	}
	
	resizeBoard()
	{
		// First scale the board to the screen aspect ratio so the 8x8 rows can fit.
		var boardContainer: HTMLDivElement = this.getBoardContainerElement();
		var chessboardHost = this.getHostElement();

		if(chessboardHost.clientWidth != this.boardSize.width || chessboardHost.clientHeight != this.boardSize.height)
		{
			// Figure out the maximum space available
			var maxSize = Math.min(chessboardHost.clientHeight, chessboardHost.clientWidth);
			var marginV = (chessboardHost.clientHeight - maxSize) / 2;
			var marginH = (chessboardHost.clientWidth - maxSize) / 2;

			this.renderer.setStyle(boardContainer, "width", maxSize + "px");
			this.renderer.setStyle(boardContainer, "height", maxSize + "px");
			this.renderer.setStyle(boardContainer, "margin-left", marginH + "px");
			this.renderer.setStyle(boardContainer, "margin-top", marginV + "px");

			this.boardSize.width = chessboardHost.clientWidth;
			this.boardSize.height = chessboardHost.clientHeight;
			
		}
	}

	forEachSquare(callback:  (square: ChessSquareComponent, x: number, y: number ) => void )
	{
		for(var y=0; y < this.boardHeight; ++y)
		{
			for(var x = 0; x < this.boardWidth; ++x)
			{
				var square = this.getSquareXY(x, y);
				if(!square)
					continue;

				callback(square, x, y);
			}
		}
	}

	findSquare(callback:  (square: ChessSquareComponent, x: number, y: number ) => boolean )
	{
		for(var y=0; y < this.boardHeight; ++y)
		{
			for(var x = 0; x < this.boardWidth; ++x)
			{
				var square = this.getSquareXY(x, y);
				if(!square)
					continue;

				if(callback(square, x, y))
					return square;
			}
		}
	}

	getSquareXY(x, y): ChessSquareComponent
	{
		if(x < this.boardWidth && x >= 0 && y < this.boardHeight && y >= 0)
		{
			return this.board[y][x];
		}
		return null;
	}

	getBoard()
	{
		var boardData = {};
		this.forEachSquare((square, x, y) => {
			var fen = this.getFEN(square);
			if(square.piece)
			{
				boardData[fen] = square.piece.getSymbol();
			}
		});
		return boardData;
	}

	setBoard(board, animate=true)
	{
		var diffs = this.getDiffs(this.getBoard(), board);
		
		
		for(var diff of diffs)
		{
			if(diff.type == "move")
			{
				this.move(diff.from, diff.to);
			}

			if(diff.type == "remove")
			{
				var square = this.getSquare(diff.square);
				if(square.piece.color == diff.piece[0] && square.piece.pieceType == diff.piece[1])
				{
					square.clearPiece();
				}
			}

			if(diff.type == "add")
			{
				var square = this.getSquare(diff.square);
				//square.clearPiece();
				var pieceColor = diff.piece[0];
				var pieceType = diff.piece[1];
				
				square.setPiece(pieceType, pieceColor);
			}
		}
	}
	
	processDiff(diffs)
	{

	}

	getDiffs(boardA, boardB)
	{
		var board1 = Object.assign({}, boardA);
		var board2 = Object.assign({}, boardB);
		var animations = [];
		var movesTo = {};
		var movesFrom = {};
		// Remove pieces that are the same in both boards
		for(var p in board2)
		{
			if(board1[p] != undefined && board1[p] == board2[p])
			{
				delete board1[p];
				delete board2[p];
			}
		}

		// Find moves
		for(var p in board2)
		{
			var square = this.findClosestSquare(board1, board2[p], p);
			if(square && !movesTo[square])
			{
				animations.push({
					type: "move",
					to: p,
					from: square,
				});
				delete board1[square];
				delete board2[p];
				movesFrom[square] = true;
				movesTo[p] = true;
			}
		}

		// Find removes
		for (var p in board2)
		{
			animations.push({
				type: 'add',
				square: p,
				piece: board2[p]
			});

			delete board2[p];
		}

		// Find Additions
		for (var p in board1)
		{
			if (movesFrom[p])
				continue;
				
			animations.push({
				type: 'remove',
				square: p,
				piece: board1[p]
			});
			
			delete board1[p];
		}

		return animations;
	}

	findClosestSquare(board, piece, position): string
	{
		var closestSquare = this.findSquare( square => {
			
			if(board[this.getFEN(square)] && board[this.getFEN(square)] == piece)
				return true;

			return false;
		});
		if(!closestSquare)
			return null;
		return this.getFEN(closestSquare);
	}

	getFEN(square: ChessSquareComponent)
	{
		if(!square)
		{
			return null;
		}

		return CHESS_SIDES[square.x] + ( this.boardHeight - square.y);
	}

	getSquare(fen:string)
	{
		var x = CHESS_SIDES.indexOf(fen[0]);
		var y = this.boardHeight - parseInt(fen[1]);
		return this.getSquareXY(x, y);
	}

	move(from:string, to:string, speed=this.animationSpeed)
	{
		var squareFrom = this.getSquare(from);
		var squareTo = this.getSquare(to);
		if(squareFrom.piece)
		{
			squareFrom.clearTimer();
			squareFrom.piece.move(squareTo, speed);
		}
	}

	animateTo(from:string, to:string, speed=this.animationSpeed)
	{
		var squareFrom = this.getSquare(from);
		var squareTo = this.getSquare(to);
		if(squareFrom.piece)
		{
			squareFrom.clearTimer();
			squareFrom.piece.animateTo(squareTo, speed);
			return squareFrom.piece;
		}
	}

}

