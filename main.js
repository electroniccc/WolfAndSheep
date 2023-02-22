/*
 * @author: electroniccc
 * @date: 2023-02-22 03:02:22
 * @desc: 
 *  A small game about wolf and sheep. I like playing this game when I was a yang child.
 *  Recently, I found that the rules of this game are almost forgotten by me.
 *  So I just write this to prevent it disappear.
 * @version: 0.1
*/

class WolfSheepGame {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		const cnvW = Number(window.getComputedStyle(this.canvas).width.replace('px', ''));
		const cnvH = Number(window.getComputedStyle(this.canvas).height.replace('px', ''));
		const width = Math.min(cnvW, cnvH);
		const cellWidth = width * 5 / 28;
		const pieceRadius = cellWidth * 3 / 10;

		this.width = width;
		this.cellWidth = cellWidth;
		this.pieceRadius = pieceRadius;

		const locations = [];
		for(let i =0; i < 6; i++) {
			const row = [];
			for(let j = 0; j < 6; j++) {
				row.push(0);
			}
			locations.push(row);
		}
		this.locations = locations;

		this.colors = {
			'black': ['#999999', '#000000'],
			'white': ['#ffffff', '#cccccc']
		};

		this.locToMove = null;
	}

	init() {
		this.drawCheckerboard();
		this.preparePieces();
		this.addEvent();
	}

	start() {}

	drawCheckerboard() {
		const ctx = this.ctx;
		const cellWidth = this.cellWidth;
		const pieceRadius = this.pieceRadius;

		ctx.fillStyle = '#ffffff';
		ctx.lineCap = 'square';

		for(let i = 0; i < 6; i++) {
			ctx.beginPath();
			ctx.moveTo(pieceRadius, cellWidth * i + pieceRadius);
			ctx.lineTo(cellWidth * 5 + pieceRadius, cellWidth * i + pieceRadius);
			ctx.stroke();
			ctx.closePath();
		}
		for(let i = 0; i < 6; i++) {
			ctx.beginPath();
			ctx.moveTo(cellWidth * i + pieceRadius, pieceRadius);
			ctx.lineTo(cellWidth * i + pieceRadius, cellWidth * 5 + pieceRadius);
			ctx.stroke();
			ctx.closePath();
		}
	}

	preparePieces() {
		for(let i = 0; i < 6; i++) {
			for(let j = 0; j < 3; j++) {
				this.locations[i][j] = 1;
				this.drawPiece(i, j, 'white');
			}
		}

		this.locations[1][4] = 2;
		this.drawPiece(1, 4, 'black');
		this.locations[4][4] = 2;
		this.drawPiece(4, 4, 'black');
	}

	drawPiece(x, y, color, radius=0) {
		x = x * this.cellWidth + this.pieceRadius;
		y = y * this.cellWidth + this.pieceRadius;

		const ctx = this.ctx;
		if(radius === 0) {
			radius = this.pieceRadius;
		}

		const colors = this.colors;

		const radgrad = ctx.createRadialGradient(x+radius/2, y+radius/2, 0, x, y, radius);
		radgrad.addColorStop(0, colors[color][0]);
		radgrad.addColorStop(1, colors[color][1]);
	
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, true);
		ctx.fillStyle = radgrad;
		ctx.fill();
		ctx.closePath();
	}

	erasePiece(x, y, radius=0) {
		if(radius === 0) {
			radius = this.pieceRadius;
		}

		const ctx = this.ctx;
		const locations = this.locations;
		
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawCheckerboard();
		
		for(let i = 0; i < 6; i++) {
			for(let j= 0; j < 6; j++) {
				if(locations[i][j] == 0 || x==i && y == j) { continue; }
				this.drawPiece(i, j, locations[i][j]%2?'white':'black', this.pieceRadius);
			}
		}
	}

	markPieceForMovement(x, y, move) {
		const color = this.locations[x][y] % 2 ? 'white' : 'black';
		this.erasePiece(x, y, this.pieceRadius * (move ? 1 : 1.155));
		this.drawPiece(x, y, color, this.pieceRadius * (move ? 1.155 : 1));
	}

	movePiece(fromX, fromY, toX, toY) {
		this.erasePiece(fromX, fromY, this.pieceRadius * 1.155);
	}

	addEvent() {
		this.canvas.addEventListener('click', (event) => {
			this.onCanvasClicked(event);
		});
	}

	onCanvasClicked(event) {
		const cellWidth = this.cellWidth;
		const radius = this.pieceRadius;
	
		const [x, y] = [Math.round((event.clientX-radius)/cellWidth), Math.round((event.clientY-radius)/cellWidth)];
		
		if(this.locToMove && this.movementAllowed(this.locToMove[0], this.locToMove[1], x, y)) {
			const [a, b] = this.locToMove;
			this.markLoc(a, b, false);
			this.moveLoc(a, b, x, y);
			this.movePiece(a, b, x, y);
			return;
		}

		if(this.locToMove) {
			const [a, b] = this.locToMove;
			this.markLoc(a, b, false);
			this.markPieceForMovement(a, b, false);
		}
		
		if(this.locations[x][y]) {
			this.markLoc(x, y, true);
			this.markPieceForMovement(x, y, true);
		}
	}

	markLoc(x, y, mark) {
		this.locations[x][y] += mark ? 100 : -100;
		this.locToMove = mark ? [x, y] : null;
	}

	moveLoc(fromX, fromY, toX, toY) {
		const locations = this.locations;
		locations[toX][toY] = locations[fromX][fromY];
		locations[fromX][fromY] = 0;
		locations[toX][toY] -= 100;
	}

	movementAllowed(fromX, fromY, toX, toY) {
		const locations = this.locations;
		
		// wolf selected
		if(locations[fromX][fromY]%2==0) {
			// target is sheep and distance is less than 2
			
			if(locations[toX][toY]%2 && this.locDistance(fromX, fromY, toX, toY) == 2) {
				return true;
			}
		}

		if(!locations[toX][toY] && this.locDistance(fromX, fromY, toX, toY) == 1) return true;

		return false;
	}

	locDistance(fromX, fromY, toX, toY) {
		return Math.sqrt(Math.pow(toX-fromX, 2) + Math.pow(toY-fromY, 2));
	}
}


function main() {
	const canvas = document.getElementById('canvas');
	if(!canvas.getContext) {
		return;
	}
	const game = new WolfSheepGame(canvas);
	game.init();
}

main();
