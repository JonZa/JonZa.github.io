// plugin
function foo(bar, fly) {
	var paranoid = 0;
	if (!window.console || (fly && !paranoid)) {
		return false;
	} else if (bar === undefined || bar === null) {
		bar = 'o_O';
	}
	var time = new Date().toUTCString().split(' ')[4];
	if (typeof bar === 'object') {
		console.log('[' + time + '] object:');
		console.dir(bar);
	} else {
		console.log('[' + time + '] ' + bar);
	}
}
// useful
function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}
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
// game & canvas stuff
var $canvas = $('#canvas');
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
	},
	months: [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	]
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
		x: 2,
		y: 4
	}, {
		x: 4,
		y: 5
	}, {
		x: 5,
		y: 17
	}, {
		x: 25,
		y: 25
	}],
	spawn: [{
		x: 3,
		y: 12
	}],
	timeouts: {
		bubbleFade: 0,
		scoreUpdate: 0
	}
}
// konva stuff
var $canvasWidth = $canvas.width();
var $canvasHeight = $canvas.height();
var stage = new Konva.Stage({
	container: 'canvas',
	width: $canvasWidth,
	height: $canvasHeight
});
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
var gameGroup = new Konva.Group({
	offsetX: 30,
	offsetY: 15
});
var dude = new Konva.Sprite();
// draw
var draw = {
	setup: function() {
		foo('draw.setup',1)
		draw.tiles();
		draw.dude();
		draw.movement();
		$('a[data-game="start"]').text('start');
	},
	start: function() {
		foo('draw.setup',1)
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
		var startX = 0;
		var startY = -cnsts.rowHeight;
		if (gameLayer.find('.poly').length === 0) {
			for (var n = 0; n < cnsts.rows; n++) {
				startY += cnsts.rowHeight / 2;
				for (var m = 0; m < cnsts.cols; m++) {
					startX = cnsts.colWidth * m + n % 2 * (cnsts.colWidth / 2);
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
					/*
					var text = new Konva.Text({
						x: startX - 12,
						y: startY + 7,
						text: 'y' + n + ' x' + m,
						fontSize: 10,
						fontFamily: 'Share Tech Mono',
						fill: 'green'
					});
					gameGroup.add(text);
					*/
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
		var $spawn = gameLayer.find('.poly_' + vars.spawn[0].y + '_' + vars.spawn[0].x).fill('#fff');
		if (vars.direction.new === 'down') {
			vars.spawn[0].y -= 1;
			vars.spawn[0].x -= vars.spawn[0].y % 2;
		} else if (vars.direction.new === 'up') {
			vars.spawn[0].x += vars.spawn[0].y % 2;
			vars.spawn[0].y += 1;
		} else if (vars.direction.new === 'right') {
			vars.spawn[0].y += 1;
			vars.spawn[0].x -= vars.spawn[0].y % 2;
		} else if (vars.direction.new === 'left') {
			vars.spawn[0].x += vars.spawn[0].y % 2;
			vars.spawn[0].y -= 1;
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
		// dude.start();
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
			message =  messages.speeches[0].split('^').join('<span>') + '!</span>';
			message = exclamation + '\n' + message;

			messages.speeches.push(messages.speeches.shift());
			messages.exclamations.push(messages.exclamations.shift());
		} else {
			message =  messages.thoughts[0];
			message = message;

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
				draw.setup();
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
var startLoading = function() {
	foo('startLoading',1)
	var toLoad = 0;
	$.each(
		images,
		function(key, value) {
			toLoad++;
		}
	);
	$.each(
		images,
		function(key, value) {
			var imageObj = new Image();
			imageObj.src = value;
			imageObj.onload = function() {
				images[key] = imageObj;
				toLoad--;
				if (!toLoad) {
					notLoaded--;
					if (!notLoaded){
						draw.setup();
					}
				}
			};
		}
	);
}
// messages
var messages = {
	thoughts: [
		'Redrum.',
		'BRAAAAAAAIIINS',
		'This is water.',
		'All days are beautiful.',
		'So it goes.',
		'This is great.',
		'Buffy is a good TV show.',
		'Buffy is a good dog.',
		'Ninja! Fwoop fwoop.',
		'Where am I going?',
		'What am I doing?',
		'What is the point of this?',
		'Must. Buy. More. Sneakers.',
		'Must. Not. Buy. More. Sneakers.',
		'Bills. Bills. Bills.',
		'Where is my dinner in pill form?',
		'When does this end? Does it end?',
		'Where is my cure for this disease?',
		'This was supposed to be the future.',
		'There are so many chairs everywhere.',
		'Telepho\' bills...',
		'Automo\' bills...',
		'Idle hands are the devil\'s plaything.',
		'Asereje, ja deje tejebe tude jebere...',
		'Where is my hydrogen fueled automobile?',
		'So. Very. Tired.',
		'Friday, Friday, gotta get down on Friday.',
		'Gotta find myself some gainful employment.',
		'All work and no play makes Jon a dull boy.',
		'An electricity bill? Thanks a lot, science.',
		'But what about the zombies, what if they...',
		'The power and beauty of my youth are fading',
		'Where is my nuclear powered levitating house?',
		'Accept certain inalienable truths. No problem.',
		'I should eat more vegetables.',
		'The race is long and in the end only with myself.',
		'Repeat until retirement. Repeat until retirement.',
		'I need a holiday on an island in the sun.',
		'Where is my jetpack?',
		'Where is my robotic companion?',
		'I should join a gym!',
		'I should get fit!',
		'I should eat properly!',
		'I need to get some fresh air.',
		'Did I leave the stove on?',
		'The cats need new mittens',
		'Kaizen.',
		'Parklife!',
		'We all go hand in hand...',
		'I\'m feeling supersonic',
		'\'Vorsprung durch Technik\''
	],
	exclamations: [
		'Woo!',
		'Yay!',
		'Woohoo!',
		'Woop woop!',
		'Woo yay!',
		'Hell yes!',
		'Hell yeah!',
		'Awww yisss!',
		'Awesome!',
		'Kickass!',
		'Rad!',
		'K-rad!',
		'Cool!',
		'Sweet!',
		'Sweeeeet!',
		'Neat!'
	],
	speeches: [
		'Animated banners for ^Ethical Corporation',
		'Event sites for ^Ethical Corporation',
		'Newsletter mailshots for ^Ethical Corporation',
		'Site template for ^Ethical Corporation',
		'Animated banners for ^EyeForTravel',
		'Event sites for ^EyeForTravel',
		'Newsletter mailshots for ^EyeForTravel',
		'Site template for ^EyeForTravel',
		'Site template for ^Fruitnet',
		'Flight booking system for ^Thomas Cook',
		'Holiday itinerary builder for ^Privet',
		'Canvas animations for ^ParFX',
		'Site templates for ^TNS',
		'Site templates for ^Bausch+Lomb',
		'Mobile forms for ^1m1m',
		'Facebook content for ^Motorola',
		'Game updates for ^Milka',
		'Site design updates for ^Dove',
		'Site templates for ^Roche',
		'Online shop for ^Saint Kidd',
		'Annual report PDFs for ^UnaVista',
		'Site templates for ^Vinson Elkins',
		'Template updates for ^Bridgepoint',
		'Reponsive site templates for ^GSK',
		'AJAX forms for ^ParFX',
		'AJAX forms for ^Nestle',
		'Responsive templates for ^Psycle',
		'Reading analytics web app for ^Badger',
		'Instagram web app for ^Rateshit',
		'Application re-skin for ^CRS',
		'Application re-skin for ^EAS',
		'Newsletters for ^London Fashion Week',
		'Facebook games for ^Ernst Young',
		'Contests for ^Ernst Young',
		'Google maps system for ^Glencore-Xstrata',
		'Google map system for ^Rouse',
		'Site templates for ^Fort Group',
		'Annual reports for ^Land Securities',
		'Site templates for ^Murata',
		'Responsive templates for ^Orrick',
		'Delegate networking tool for ^Mesj.es',
		'Geolocation logic for ^Glowpear',
		'Mailshot markup for ^NATS',
		'Newsletter templates for ^BP',
		'Newsletter templates for ^Lilly',
		'Newsletter templates for ^Precise',
		'Site templates for ^Rentokil',
		'Site templates for ^NFIB',
		'Site templates for ^Ryvita',
		'Site templates for ^FM Global',
		'Homepage updates for ^Privy Council',
		'Site updates for ^GSK',
		'Logo design for ^Milk-It',
		'Logo design for ^HeShe',
		'Site design for ^Wild Organics',
		'Product promo site for ^Duracell',
		'Meal builder web app for ^Naspers',
		'Site design for ^Marine Parade',
		'Site template for ^Marine Parade',
		'Promo site designs for ^Elizabeth Arden',
		'Audio player for ^Marine Parade'
	]
}
shuffle(messages.thoughts)
shuffle(messages.exclamations)
shuffle(messages.speeches)
// controls
var $controls = $('.controls a');
function toggleControls() {
	foo('toggleControls',1)
	$controls.removeClass('active').filter('[id="' + vars.direction.new + '"]').addClass('active');
}
toggleControls();
// modal defaults
$.modal.defaults.closeText = '*';
$.modal.defaults.fadeDuration = 150;
// update scrollify
$.scrollify({
	after: function() {
		if ($.scrollify.current().attr('id') !== 'gameSection') {
			onBlur();
		} else {
			onFocus();
		}
	}
});
// go go go
$().ready(function() {
	$controls.click(
		function(e) {
			vars.direction.new = $(this).attr('id');
			toggleControls();
			e.preventDefault();
		}
	);
	$('a[rel="new"]').on(
		'click',
		function() {
			window.open(this.href);
			return false;
		}
	);
	$('a[data-alt]').on(
		'mouseover mouseout',
		function() {
			var $this = $(this);
			var oldHtml = $this.html();
			var newHtml = $this.attr('data-alt');
			$this.html(newHtml).attr('data-alt',oldHtml)
		}
	);
	$.each(
		$('img[data-file]'),
		function(i,elem) {
			var $img = $(elem);
			$img.attr('src',$img.attr('data-file'))
		}
	);
	$('a[data-game="start"]').on(
		'click',
		function(e) {
			e.preventDefault();
			var $this = $(this);
			$this.closest('.content').find('.off').removeClass('off');
			$this.parent().remove();
			draw.start();
		}
	);
	$('a.hi').on(
		'click',
		function(e) {
			e.preventDefault();
			var $this = $(this);
			$this.find('.one').remove();
		}
	);
	$('a[data-game="mute"]').on(
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
	// keypress
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
	// start preloading
	startLoading();
});