var canvas;
var ctx;

$(document).ready(function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	var loop = function(){
		update();
		draw();
	};
	draw();
});

function update() {
}

function draw() {
	var arc = {
		x: 250,
		y: canvas.height / 2,
		radius: 200,
		width: 16
	};
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();
	ctx.arc(arc.x, arc.y, arc.radius, Math.PI * 1.5, Math.PI * (2 + 1.5));
	ctx.strokeStyle = "rgba(255,180,122, 0.2)";
	ctx.lineWidth = arc.width;
	ctx.lineCap = "round";
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(arc.x, arc.y, arc.radius, 0, Math.PI * 2);
	var gradient = ctx.createLinearGradient(0, canvas.height / 5, 0, canvas.height / 4 * 3);
	gradient.addColorStop("0", "#FF976D");
	gradient.addColorStop("1", "#FFCE52");
	ctx.strokeStyle = gradient;
	ctx.lineWidth = arc.width;
	ctx.lineCap = "round";
	ctx.stroke();
}