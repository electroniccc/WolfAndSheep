/*
 * @author: electroniccc
 * @date: 2023-02-22 03:02:22
 * @desc: 
 *  A small game about wolf and sheep. I like playing this game when I was a yang child.
 *  Recently, I found that the rules of this game are almost forgotten by me.
 *  So I just write this to prevent it disappear.
 * @version: 0.1
*/

let canStart = true;
function onGameStart(game) {
	if(game.running) return;
	if(!canStart) return;
	canStart = false;
	game.start();
	const btnEl = document.getElementById('btn-start');
	// removeClass(btnEl, 'button-63');
	addClass(btnEl, 'clicked');
}

function onGameReset(game) {
	game.reset();
	canStart = true;

	const btnEl = document.getElementById('btn-start');
	removeClass(btnEl, 'clicked');
}

function onGameOver(winner, steps) {
	const btnEl = document.getElementById('btn-start');
	removeClass(btnEl, 'clicked');
	alert(`${winner==SHEEP?'Sheep': 'wolf'} win`);
}

function addEvent(game) {
	document.getElementById('btn-start').addEventListener('click', (event) => {
		onGameStart(game, event);
	});

	document.getElementById('btn-reset').addEventListener('click', (event) => {
		onGameReset(game, event);
	})
}

function adjustCanvasSize(el) {
	const bodyWidth = document.body.clientWidth;

	let canvasWidth = bodyWidth >= CANVS_WIDTH ? CANVS_WIDTH : Math.round(bodyWidth * 0.9);

	const ua = navigator.userAgent;
	if((ua.indexOf('Android') > -1 || ua.indexOf('ios') > -1) && bodyWidth >= CANVS_WIDTH) {
		canvasWidth = Math.round(bodyWidth * 0.85);
	}

	el.width = canvasWidth;
	el.height = canvasWidth;
}


function main() {
	const canvas = document.getElementById('canvas');
	if(!canvas.getContext) {
		return;
	}

	adjustCanvasSize(canvas);

	const game = new WolfSheepGame(canvas, onGameOver);
	game.init();

	addEvent(game);

	// document.getElementById('canvas').classList.add('user-isSheep');
}

main();
