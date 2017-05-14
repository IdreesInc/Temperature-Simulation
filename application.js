/*jshint esversion: 6 */
var canvas;
var ctx;
var arc;
var colorArray = [];
var scale = 0;
var scaleControl = {
	x: 540,
	y: 130,
	width: 50,
	barHeight: 300,
	handleHeight: 20,
	handleY: 0
};
var mouse = {
	x: -1,
	y: -1,
	clickX: -1,
	clickY: -1,
	isClicked: false,
	isDragging: false,
	DRAG_THRESHOLD: 10
};
var scaleDragged = false;
var particles = [];
var NUM_OF_PARTICLES = 20;
var clearAway = true;

$(document).ready(function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	var grey = {
		startColor: "rgba(255, 255, 255, 1.0)",
		endColor: "rgba(85, 80, 103, 1.0)"
	};
	var freezing = {
		startColor: "rgba(102, 189, 204, 1.0)",
		endColor: "rgba(0, 104, 139, 1.0)"
	};
	var cool = {
		startColor: "rgba(149, 219, 210, 1.0)",
		endColor: "rgba(102, 189, 204, 1.0)"
	};
	var neutral = {
		startColor: "rgba(168, 219, 52, 1.0)",
		endColor: "rgba(106, 204, 101, 1.0)"
	};
	var warm = {
		startColor: "rgba(255, 206, 82, 1.0)",
		endColor: "rgba(255, 151, 109, 1.0)"
	};
	var hot = {
		startColor: "rgba(255, 195, 113, 1.0)",
		endColor: "rgba(255, 95, 109, 1.0)"
	};
	colorArray = [freezing, cool, neutral, warm, hot];

	$("#card").mousedown(function(e) {
		var x = e.clientX - $("#card").offset().left;
		var y = e.clientY - $("#card").offset().top;
		mouse.x = x;
		mouse.y = y;
		mouse.clickX = x;
		mouse.clickY = y;
		mouse.isClicked = true;
	})
	.mousemove(function(e) {
		var x = e.clientX - $("#card").offset().left;
		var y = e.clientY - $("#card").offset().top;
		mouse.x = x;
		mouse.y = y;
		if (mouse.isClicked && (Math.abs(mouse.clickX - x) > mouse.DRAG_THRESHOLD || Math.abs(mouse.clickY - y) > mouse.DRAG_THRESHOLD)) {
			mouse.isDragging = true;
		}
	})
	.mouseup(function(e) {
		var x = e.clientX - $("#card").offset().left;
		var y = e.clientY - $("#card").offset().top;
		mouse.x = x;
		mouse.y = y;
		mouse.clickX = -1;
		mouse.clickY = -1;
		mouse.isDragging = false;
		mouse.isClicked = false;
	});

	arc = {
		x: 250,
		y: canvas.height / 2,
		radius: 200,
		width: 16
	};

	for (var i = 0; i < NUM_OF_PARTICLES; i++) {
		particles[i] = {
			id: i,
			x: arc.x + 10,
			y: arc.y + 4 * i,
			velocity: 1,
			maxVelocity: 5,
			minVelocity: 0.2,
			dx: 1,
			dy: 0,
			radius: 15,
			energy: 0.5
		};
	}

	var loop = function(){
		update();
		draw();
	};
	var interval = setInterval(loop, 10);
	draw();
});

function update() {
	if (mouse.isDragging && isWithin(mouse.clickX, mouse.clickY, scaleControl.x, scaleControl.handleY, scaleControl.width, scaleControl.handleHeight)) {
		scaleDragged = true;
	}
	if (!mouse.isDragging && scaleDragged) {
		scaleDragged = false;
	}
	if (scaleDragged) {
		scaleControl.handleY = bound(mouse.y - scaleControl.handleHeight / 2, scaleControl.y, scaleControl.y + scaleControl.barHeight - scaleControl.handleHeight);
		scale = 1 - (scaleControl.handleY - scaleControl.y) / (scaleControl.barHeight - scaleControl.handleHeight);
	} else if (!mouse.isClicked) {
		//scale += 0.001;
	}
	if (scale > 1) {
		scale = 1;
	} else if (scale < 0) {
		scale = 0;
	}
	scaleControl.handleY = scaleControl.y + ((scaleControl.barHeight - scaleControl.handleHeight) * (1 - scale));

	var collisionFound = false;
	for (var i = 0; i < particles.length; i++) {
		var particle = particles[i];
		var old = clone(particle);

		particle.velocity = particle.energy * particle.maxVelocity;
		if (particle.velocity < particle.minVelocity) {
			particle.velocity = particle.minVelocity;
		}
		particle.x += particle.velocity * particle.dx;
		particle.y += particle.velocity * particle.dy;
		particle.dy = particle.dy + 0.1 * (1 - particle.energy);

		for (var j = 0; j < particles.length; j++) {
			collisionFound = true;
			var other = particles[j];
			if (other.id != particle.id && distance(particle.x, particle.y, other.x, other.y) < particle.radius + other.radius) {
				let dx = particle.x - other.x;
				let dy = particle.y - other.y;

				let angleToCollisionPoint = Math.atan2(-dy, dx);
				let oldAngle = Math.atan2(-particle.dy, particle.dx);
				let newAngle = 2 * angleToCollisionPoint - oldAngle;

				particle.dx = -Math.cos(newAngle);
				particle.dy = Math.sin(newAngle);

				let energy = (other.energy + particle.energy) / 2;
				particle.energy = energy;
				other.energy = energy;
				particle.x = old.x;
				particle.y = old.y;
				while(clearAway && other.id != particle.id && distance(particle.x, particle.y, other.x, other.y) < particle.radius + other.radius) {
					particle.x += particle.velocity * particle.dx;
					particle.y += particle.velocity * particle.dy;
				}
			}
		}

		if (distance(particle.x, particle.y, arc.x, arc.y) > arc.radius - arc.width - particle.radius / 2) {
			let dx = particle.x - arc.x;
			let dy = particle.y - arc.y;

			let angleToCollisionPoint = Math.atan2(-dy, dx);
			let oldAngle = Math.atan2(-particle.dy, particle.dx);
			let newAngle = 2 * angleToCollisionPoint - oldAngle;
			particle.dx = -Math.cos(newAngle);
			particle.dy = Math.sin(newAngle);

			particle.x = old.x;
			particle.y = old.y;
			particle.energy = (scale + particle.energy) / 2;
		}
	}
	if (!collisionFound) {
		clearAway  = false;
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var width = 1 / (colorArray.length - 1);
	var backGradient = getGradient(Math.floor(scale / width), 1 - (scale % width) / width);
	var frontGradient = getGradient(Math.ceil(scale / width), (scale % width) / width);

	drawArc(arc.x, arc.y, arc.radius, arc.width, "grey", "grey");
	drawArc(arc.x, arc.y, arc.radius, arc.width, backGradient.startColor, backGradient.endColor);
	drawArc(arc.x, arc.y, arc.radius, arc.width, frontGradient.startColor, frontGradient.endColor);

	ctx.font = "100px Roboto";
	ctx.textAlign = "right";
	ctx.fillStyle = getGradient(Math.floor(scale / width), 1 - (scale % width) / width).startColor;
	ctx.fillText(Math.round(scale * 150 - 25) + "°", 630, 100);
	ctx.fillStyle = getGradient(Math.ceil(scale / width), (scale % width) / width).startColor;
	ctx.fillText(Math.round(scale * 150 - 25) + "°", 630, 100);

	ctx.beginPath();
	ctx.rect(scaleControl.x, scaleControl.y, scaleControl.width, scaleControl.barHeight);
	ctx.fillStyle = "rgba(76, 76, 76, 0.25)";
	ctx.fill();

	ctx.shadowBlur = 12 * scale;
	ctx.shadowColor = "rgb(251, 42, 100)";
	ctx.beginPath();
	ctx.rect(scaleControl.x, scaleControl.handleY, scaleControl.width, scaleControl.handleHeight);
	ctx.fillStyle = "rgb(251, 42, 100)";
	ctx.fill();
	ctx.shadowBlur = 0;

	ctx.save();
	ctx.font = "25px Raleway";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "#525454FF";
	ctx.translate(scaleControl.x + scaleControl.width, scaleControl.y  + scaleControl.barHeight / 2);
	ctx.rotate(Math.PI / 2);
	ctx.fillText("Temperature", 0, 0);
	ctx.restore();

	for (var i = 0; i < particles.length; i++) {
		var particle = particles[i];
		ctx.beginPath();
		ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
		ctx.fillStyle = getGradient(Math.floor(particle.energy / width), 1 - (particle.energy % width) / width).endColor;
		ctx.fill();
		ctx.fillStyle = getGradient(Math.ceil(particle.energy / width), (particle.energy % width) / width).startColor;
		ctx.fill();
	}
}

function drawArc(x, y, radius, lineWidth, startColor, endColor) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	var gradient = ctx.createLinearGradient(0, canvas.height / 5, 0, canvas.height / 4 * 3);
	gradient.addColorStop("0", startColor);
	gradient.addColorStop("1", endColor);

	ctx.strokeStyle = gradient;
	ctx.lineWidth = lineWidth;
	ctx.lineCap = "round";
	ctx.stroke();
}

function getGradient(colorArrayIndex, transparency) {
	var gradient = {
		startColor: colorArray[colorArrayIndex].startColor.replace("1.0", transparency + ""),
		endColor: colorArray[colorArrayIndex].endColor.replace("1.0", transparency + "")
	};
	return gradient;
}

function isWithin(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
	if (pointX >= rectX && pointX - rectX <= rectWidth && pointY >= rectY && pointY - rectY <= rectHeight) {
		return true;
	}
	return false;
}

function bound(num, min, max) {
	if (num < min) {
		num = min;
	}
	if (num > max) {
		num = max;
	}
	return num;
}

function clone(object) {
	return jQuery.extend({}, object);
}

function distance(x1, y1, x2, y2) {
	return Math.hypot(x2 - x1, y2 - y1);
}