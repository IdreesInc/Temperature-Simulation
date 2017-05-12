var canvas;
var ctx;
var colorArray = [];
var scale = 0;
var grey;

$(document).ready(function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	grey = {
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

	var loop = function(){
		scale += 0.001;
		update();
		draw();
	};
	var interval = setInterval(loop, 10);
	draw();
});

function update() {
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (scale > 1) {
		scale = 1;
	} else if (scale < 0) {
		scale = 0;
	}

	var width = 1 / (colorArray.length - 1);
	var backGradient = getGradient(Math.floor(scale / width), 1 - (scale % width) / width);
	var frontGradient = getGradient(Math.ceil(scale / width), (scale % width) / width);

	var arc = {
		x: 250,
		y: canvas.height / 2,
		radius: 200,
		width: 16
	};
	drawArc(arc.x, arc.y, arc.radius, arc.width, "grey", "grey");
	drawArc(arc.x, arc.y, arc.radius, arc.width, backGradient.startColor, backGradient.endColor);
	drawArc(arc.x, arc.y, arc.radius, arc.width, frontGradient.startColor, frontGradient.endColor);
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