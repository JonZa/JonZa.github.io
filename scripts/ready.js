// foo
function foo(a,b){var c=0;if(!window.console||b&&!c)return!1;(void 0===a||null===a)&&(a='o_O');var d=(new Date).toUTCString().split(' ')[4];'object'==typeof a?(console.log('['+d+'] object:'),console.dir(a)):console.log('['+d+'] '+a)}
// shuffle
function shuffle(a){for(var c,d,b=a.length;0!==b;)d=Math.floor(Math.random()*b),b-=1,c=a[b],a[b]=a[d],a[d]=c;return a}
// mute audio on scroll away
function onBlur() {
	sounds.footsteps.mute(true)
	sounds.cat.mute(true)
	sounds.pickup.mute(true)
}
// unmute audio on scroll away
function onFocus() {
	if (!vars.isMuted) {
		var notGameSection = ($.scrollify.current().attr('id') !== 'gameSection');
		sounds.footsteps.mute(notGameSection)
		sounds.cat.mute(notGameSection)
		sounds.pickup.mute(notGameSection)
	}
}
if (/*@cc_on!@*/false) { // check for Internet Explorer
	document.onfocusin = onFocus;
	document.onfocusout = onBlur;
} else {
	window.onfocus = onFocus;
	window.onblur = onBlur;
}
// constants
var cnsts = {
	colors: ['#cd8', '#de9'],
	$score: $('.score'),
	$bubble: $('.bubble'),
	rowHeight: 30,
	colWidth: 60,
	rows: 23,
	cols: 7,
	topScore: 99999999999999999999,
	game: {
		height: 300,
		width: 300,
	},
	keys: {
		up: 38,
		down: 40,
		left: 37,
		right: 39
	},
	anims: {
		left: [
			60, 120, 60, 60,
			120, 120, 60, 60,
			60, 120, 60, 60,
			0, 120, 60, 60
		],
		down: [
			60, 180, 60, 60,
			120, 180, 60, 60,
			60, 180, 60, 60,
			0, 180, 60, 60
		],
		up: [
			60, 60, 60, 60,
			120, 60, 60, 60,
			60, 60, 60, 60,
			0, 60, 60, 60
		],
		right: [
			60, 0, 60, 60,
			120, 0, 60, 60,
			60, 0, 60, 60,
			0, 0, 60, 60
		]
	},
	money: {
		width: 60,
		height: 40,
		offsetY: -16,
		offsetX: -1
	},
	group: {
		offsetX: 30,
		offsetY: 15
	},
	dude: {
		width: 60,
		height: 60
	}
}
// variables
var vars = {
	direction: {
		new: 'down',
		changed: 0
	},
	isMuted: false,
	score: 0,
	started: false,
	tilesMoved: 0,
	sinceMoney: 0,
	money: [{
		x: 1,
		y: 8
	}, {
		x: 5,
		y: 8
	}, {
		x: 5,
		y: 16
	}, {
		x: 1,
		y: 16
	}],
	spawn: {
		x: 3,
		y: 12
	},
	timeouts: {
		bubbleFade: 0,
		scoreUpdate: 0
	}
}
// konva stage
var stage = new Konva.Stage({
	container: 'canvas',
	width: cnsts.game.width,
	height: cnsts.game.height
});
// konva game layer
var gameLayer = new Konva.Layer({
	x: 0,
	y: 0,
	clip: {
		x: 0,
		y: 0,
		width: cnsts.game.width,
		height: cnsts.game.height
	}
});
stage.add(gameLayer);
// konva game group
var gameGroup = new Konva.Group({
	offsetX: 30,
	offsetY: 15
});
var dude = new Konva.Sprite();
// draw
var game = {
	setup: function () {
		foo('game.setup',1)
		draw.tiles();
		draw.dude();
		draw.movement();
		$('[data-game="start"]').text('start');
	}
}
var draw = {
	start: function() {
		foo('draw.start',1)
		vars.started = 1;
		dude.start();
		sounds.begin.play();
		setTimeout(
			function() {
				sounds.cat.play('loop');
			}
			,500
		),
		sounds.footsteps.play();
		draw.next();
	},
	next: function() {
		foo('draw.next',1)
		draw.tiles();
		draw.movement();
	},
	tiles: function() {
		foo('draw.tiles',1)
		gameGroup.x(0);
		gameGroup.y(0);
		cnsts.colors.reverse();
		if (!vars.tilesMoved) {
			var startY = -cnsts.rowHeight;
			for (var n = 0; n < cnsts.rows; n++) {
				startY += cnsts.rowHeight / 2;
				for (var m = 0; m < cnsts.cols; m++) {
					var startX = cnsts.colWidth * m + n % 2 * (cnsts.colWidth / 2);
					var poly = new Konva.Line({
						points: [
							startX, startY,
							startX + cnsts.colWidth / 2, startY + cnsts.rowHeight / 2,
							startX, startY + cnsts.rowHeight,
							startX - cnsts.colWidth / 2, startY + cnsts.rowHeight / 2
						],
						name: 'poly poly_' + n + '_' + m,
						fill: cnsts.colors[n % 2],
						closed: true,
						strokeWidth: 2,
						stroke: '#bc7',
						perfectDrawEnabled: false
					});
					gameGroup.add(poly);
				}
			}
			gameLayer.add(gameGroup);
		} else {
			for (var n = 0; n < cnsts.rows; n++) {
				for (var m = 0; m < cnsts.cols; m++) {
					gameLayer.find('.poly_' + n + '_' + m).fill(cnsts.colors[n % 2])
				}
			}
		}
		// spawn
		gameLayer.find('.poly_' + vars.spawn.y + '_' + vars.spawn.x).fill('#fff');
		if (vars.tilesMoved > 0) {
			if (vars.direction.new === 'down') {
				vars.spawn.y -= 1;
				vars.spawn.x -= vars.spawn.y % 2;
			} else if (vars.direction.new === 'up') {
				vars.spawn.x += vars.spawn.y % 2;
				vars.spawn.y += 1;
			} else if (vars.direction.new === 'right') {
				vars.spawn.y += 1;
				vars.spawn.x -= vars.spawn.y % 2;
			} else if (vars.direction.new === 'left') {
				vars.spawn.x += vars.spawn.y % 2;
				vars.spawn.y -= 1;
			}
		}
		// money
		gameLayer.find('.money').remove();
		var drawBubble = false;
		var $tiles = [];
		for (var i = 0; i < vars.money.length; i++) {
			var $tile = gameLayer.find('.poly_' + vars.money[i].y + '_' + vars.money[i].x);

			if ($tile.length > 0) {
				$tiles.push($tile);
				var moneyX = $tile[0].attrs.points[0] - cnsts.colWidth + Math.floor((cnsts.colWidth - cnsts.money.width) / 2) + cnsts.money.offsetX + cnsts.group.offsetX;
				var moneyY = $tile[0].attrs.points[1] - cnsts.rowHeight / 2 + cnsts.money.offsetY + cnsts.group.offsetY;
				var money = new Konva.Image({
					x: moneyX,
					y: moneyY,
					image: images['money' + (i + 1)],
					width: cnsts.money.width,
					height: cnsts.money.height,
					opacity: 1,
					name: 'money'
				});
				gameGroup.add(money);
			}

			gameLayer.find('.poly_' + vars.money[i].y + '_' + (vars.money[i].x - 1)).fill('#dea');
			gameLayer.find('.poly_' + vars.money[i].y + '_' + (vars.money[i].x + 1)).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y + 2) + '_' + vars.money[i].x).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y - 2) + '_' + vars.money[i].x).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y - 1) + '_' + (vars.money[i].x - (vars.money[i].y - 1) % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y + 1) + '_' + (vars.money[i].x + vars.money[i].y % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y + 1) + '_' + (vars.money[i].x - (vars.money[i].y + 1) % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y - 1) + '_' + (vars.money[i].x + vars.money[i].y % 2)).fill('#efc');

			if (vars.tilesMoved > 0) {
				if (vars.direction.new === 'down') {
					vars.money[i].y -= 1;
					vars.money[i].x -= vars.money[i].y % 2;
				} else if (vars.direction.new === 'up') {
					vars.money[i].x += vars.money[i].y % 2;
					vars.money[i].y += 1;
				} else if (vars.direction.new === 'right') {
					vars.money[i].y += 1;
					vars.money[i].x -= vars.money[i].y % 2;
				} else if (vars.direction.new === 'left') {
					vars.money[i].x += vars.money[i].y % 2;
					vars.money[i].y -= 1;
				}
			}
			var score = 0;
			var playerX = Math.ceil(cnsts.cols / 2) - 1;
			var playerY = Math.ceil(cnsts.rows / 2);

			var value = (i+1);
			var multiplier = 0;

			if (vars.money[i].x === playerX && vars.money[i].y === playerY) {
				multiplier = 3;
			}
			if (((vars.money[i].x - 1) === playerX && vars.money[i].y === playerY) || ((vars.money[i].x + 1) === playerX && vars.money[i].y === playerY) || (vars.money[i].x === playerX && (vars.money[i].y - 2) === playerY) || (vars.money[i].x === playerX && (vars.money[i].y + 2) === playerY)) {
				multiplier = 1;
			}
			score = value * multiplier;
			if (score > 0) {
				sounds.pickup.play();
				vars.money[i].x = -1;
				vars.money[i].y = -1;
				var tween = new Konva.Tween({
					node: money,
					y: moneyY - 10,
					duration: 0.25,
					opacity: 0
				});
				tween.play();
				vars.score += score;
				if (vars.score > cnsts.topScore) {
					alert('YOU ARE BORN ANEW.')
					vars.score = 0;
				}
				var html = '<span class="yellow">+ ' + value + '</span>';
				if (multiplier > 1) {
					html += '<span class="xp white">' + multiplier + 'x</span>';
				}
				draw.score(html);
				drawBubble = 'speech';
			}
			if (vars.money[i].x < -1 || vars.money[i].y < -1 || vars.money[i].x === cnsts.cols + 1 || vars.money[i].y === cnsts.rows + 1) {
				var x = 0;
				var y = 0;
				for (var j = 0; j < 1; j++) {
					x = Math.floor(Math.random() * (cnsts.cols + 1));
					y = Math.floor(Math.random() * (cnsts.rows + 1));
					for (var k = 0; k < vars.money.length; k++) {
						if (vars.money[k].x === x && vars.money[k].y === y) {
							foo('wat')
							j--;
						}
					}
				}
				vars.money[i].x = x;
				vars.money[i].y = y;
			}
		}
		$.each(
			$tiles,
			function(i,el) {
				el.fill('#fff')
			}
		)
		if (drawBubble !== 'speech') {
			vars.sinceMoney++;
			if (vars.sinceMoney === 10) {
				draw.bubble('thought');
			}
		} else {
			draw.bubble('speech');
		}
	},
	score: function(html) {
		foo('draw.score',1)
		var modifier = 1 + vars.score / 1000;
		sounds.cat.rate(modifier)
		sounds.footsteps.rate(modifier)
		dude.frameRate = 7 + modifier * 10;
		cnsts.$score.html(html);
		clearTimeout(vars.timeouts.scoreUpdate);
		vars.timeouts.scoreUpdate = setTimeout(
			function() {
				foo('draw.score.scoreUpdate',1)
				cnsts.$score.html('<span class="xp">XP</span>' + vars.score);
			},
			750
		);
	},
	dude: function() {
		foo('draw.dude',1)
		dude = new Konva.Sprite({
			x: cnsts.game.width / 2 - cnsts.dude.width / 2,
			y: cnsts.game.height / 2 - cnsts.dude.height / 2,
			image: images['dude'],
			animation: vars.direction.new,
			animations: cnsts.anims,
			frameRate: 8,
			frameIndex: 0
		});
		gameLayer.add(dude);
	},
	movement: function() {
		foo('draw.movement',1)
		vars.tilesMoved++;
		dude.setAnimation(vars.direction.new);
		var duration = 0.4;
		if (vars.score < 1500) {
			duration -= vars.score / 5000;
		} else {
			duration = 0.002;
		}
		var x;
		var y;
		if (!vars.started) {
			x = 0;
			y = 0;
		} else if (vars.direction.new === 'down') {
			x = -cnsts.colWidth / 2;
			y = -cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'up') {
			x = cnsts.colWidth / 2;
			y = cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'right') {
			x = -cnsts.colWidth / 2;
			y = cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'left') {
			x = cnsts.colWidth / 2;
			y = -cnsts.rowHeight / 2;
		}
		var tween = new Konva.Tween({
			node: gameGroup,
			duration: duration,
			x: x,
			y: y,
			onFinish: function() {
				if (!vars.started) return false;
				draw.next();
			}
		});
		tween.play();
	},
	bubble: function(type) {
		foo('draw.bubble',1)
		clearTimeout(vars.timeouts.bubbleFade);
		vars.sinceMoney = 0;
		var message;
		if (type === 'speech') {
			var exclamation = messages.exclamations[0];
			message = '<span>' + exclamation + '!</span><br>' + messages.speeches[0].split('^').join('<span>') + '!</span>';
			messages.speeches.push(messages.speeches.shift());
			messages.exclamations.push(messages.exclamations.shift());
		} else {
			message =  messages.thoughts[0];
			messages.thoughts.push(messages.thoughts.shift());
		}
		cnsts.$bubble.html('<p>' + message + '</p>').attr('class',type).show();
		vars.timeouts.bubbleFade = setTimeout(
			function() {
				foo('draw.bubble.bubbleFade',1)
				cnsts.$bubble.removeClass(type).hide();
			},
			2000
		);
	}
}
// load
var notLoaded = 2;
var sounds = {
	toLoad: 4,
	begin: new Howl({
		src: [ 'audio/begin.mp3', 'audio/begin.ogg' ],
		volume: 0.5,
		onload: function() {
			sounds.loaded();
		}
	}),
	footsteps: new Howl({
		src: [ 'audio/footsteps.mp3', 'audio/footsteps.ogg' ],
		loop: true,
		volume: 0.2,
		onload: function() {
			sounds.loaded();
		}
	}),
	pickup: new Howl({
		src: [ 'audio/pickup.mp3', 'audio/pickup.ogg' ],
		volume: 0.3,
		onload: function() {
			sounds.loaded();
		}
	}),
	cat: new Howl({
		src: [ 'audio/cat.mp3', 'audio/cat.ogg' ],
		loop: true,
		volume: 0.4,
		sprite: {
			loop: [0, 9950]
		},
		onload: function() {
			sounds.loaded();
		}
	}),
	loaded: function() {
		sounds.toLoad--;
		if (!sounds.toLoad) {
			notLoaded--;
			if (!notLoaded){
				game.setup();
			}
		}
	}
}
var images = {
	dude: 'images/dude.gif',
	money1: 'images/money-1.gif',
	money2: 'images/money-2.gif',
	money3: 'images/money-3.gif',
	money4: 'images/money-4.gif',
	speech1: 'images/speech-top.png',
	speech2: 'images/speech-bg.png',
	speech3: 'images/speech-bottom.png',
	thought1: 'images/thought-top.png',
	thought2: 'images/thought-bg.png',
	thought3: 'images/thought-bottom.png'
};
// load images IIFE
(function () {
	var toLoad = 0;
	$.each(
		images,
		function(key, value) {
			if (typeof value !== 'string') return false;
			toLoad++;
			var imageObj = new Image();
			imageObj.src = value;
			imageObj.onload = function() {
				images[key] = imageObj;
				toLoad--;
				if (!toLoad) {
					notLoaded--;
					if (!notLoaded){
						game.setup();
					}
				}
			};
		}
	);
}());
// modal defaults
$.modal.defaults.closeText = '*';
$.modal.defaults.fadeDuration = 150;
// update scrollify
$.scrollify({
	after: function() {
		var $current = $.scrollify.current().attr('id');
		if (typeof ga !== 'undefined') {
			ga('send', 'pageview', location.pathname + '#' + $current)
		}
		if ($current !== 'gameSection') {
			onBlur();
		} else {
			onFocus();
		}
	}
});
// controls
var $controls = $('.controls a');
function toggleControls() {
	foo('toggleControls',1)
	$controls.removeClass('active').filter('[id="' + vars.direction.new + '"]').addClass('active');
}
toggleControls();
// go go go
$().ready(function() {
	// bind clicks
	$controls.click(
		function(e) {
			e.preventDefault();
			vars.direction.new = $(this).attr('id');
			toggleControls();
		}
	);
	$('.hi').on(
		'click',
		function(e) {
			e.preventDefault();
			$(this).find('.one').remove();
		}
	);
	$('[data-game="start"]').on(
		'click',
		function(e) {
			e.preventDefault();
			var $this = $(this);
			$this.closest('.content').find('.off').removeClass('off');
			$this.parent().remove();
			draw.start();
		}
	);
	$('[data-game="mute"]').on(
		'click',
		function(e) {
			e.preventDefault();
			foo(vars.isMuted)
			var $this = $(this);
			$this.toggleClass('active');
			vars.isMuted = !vars.isMuted;
			sounds.footsteps.mute(vars.isMuted)
			sounds.cat.mute(vars.isMuted)
			sounds.pickup.mute(vars.isMuted)
		}
	);
	$('[rel="external"]').on(
		'click',
		function() {
			window.open(this.href);
			return false;
		}
	);
	// load images
	$.each(
		$('[data-file]'),
		function(i,elem) {
			var $img = $(elem);
			$img.attr('src',$img.attr('data-file'))
		}
	);
	// bind keypress
	$('html').keydown(function(e) {
		var key = e.keyCode;
		var oldDirection = vars.direction.new;
		switch (key) {
			case cnsts.keys.up:
				e.preventDefault();
				vars.direction.new = 'up';
				break;
			case cnsts.keys.down:
				e.preventDefault();
				vars.direction.new = 'down';
				break;
			case cnsts.keys.left:
				e.preventDefault();
				vars.direction.new = 'left';
				break;
			case cnsts.keys.right:
				e.preventDefault();
				vars.direction.new = 'right';
				break;
		}
		if (oldDirection !== vars.direction.new) {
			vars.direction.changed = 1;
			toggleControls();
		}
	});
	// rescrollify
	$.scrollify.update();
});