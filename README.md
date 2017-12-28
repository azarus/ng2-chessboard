# ng2-chessboard
Mobile Friendly Chessboard Component for Angular2 and above,


![demo](https://i.imgur.com/66fHqFv.jpg)

**Supports Drag & Drop both in browser and on mobile.**


## Install
Simply Clone the repository & copy the component files to your project.


## API

#### ChessboardComponent

###### Availabe Outputs
```typescript
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
```
###### Usage
```html
<chessboard
[flipped]="isBoardFlipped" 
(boardReady)="onBoardReady()"
(squareClicked)="onSquareClicked($event)"
(pieceDragStart)="onPieceDragStart($event)"
(pieceDragOver)="onPieceDragOver($event)"
(pieceDragEnd)="onPieceDragEnd($event)">
</chessboard>
```
#### ChessSquareComponent
#### ChessPieceComponent

#### Basic Events
##### ChessboardEvent (Generic Event)
- preventDefault() // to prevent the action to continue
- isPrevented(): boolean // To check if the action was prevented before

#### Move Events

##### PieceMovedEvent
- fromSquare: ChessSquareComponent (Square the move started from)
- toSquare: ChessSquareComponent (Square where the piece was moved to)
- piece: ChessPieceComponent ( The piece that was moved)

##### PieceSelectedEvent
- square: ChessSquareComponent (Square the drag started from)
- piece: ChessPieceComponent ( The piece that was moved )

#### Drag & Drop Events
##### PieceDragStartEvent
- square: ChessSquareComponent (Square the drag started form)
- piece: ChessPieceComponent (The dragged piece)
- event: DragEvent

##### PieceDragEndEvent
- fromSquare: ChessSquareComponent (Square the drag started from)
- toSquare: ChessSquareComponent (Last square before the drag ended)
- event: DragEvent

##### PieceDragOverEvent
- square: ChessSquareComponent (Square the drag currently hovering over)
- event: DragEvent
