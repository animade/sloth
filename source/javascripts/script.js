// ------------------------------------------
//
// Settings
//
//

// Magnifying glass
var magGlassScale = 20; // The bigger the number the smaller the magnifying glass
// Colors
var outsideBackgroundColor = "#7ec0ee";
var insideBackgroundColor = "#1875b8";
var magGlassOuterRingColor = "black";
// Scene
var sceneName = "test";

// ------------------------------------------
//
// Setup
//
//

// Put together src urls for easy scene swapping
var src = "../scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.svg";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var audioSrc 			= src + "/audio";
// Just to save a few characters
var width 	= window.innerWidth,
	height 	= window.innerHeight;
// Calculate the width of the magnifying glass
var circleWidth = width / magGlassScale;
// Intialize globally needed variables and position
// magnifying glass in the middle of the page
var sloth;
var audioPos;
var circleX 	= width / 2;
var circleY 	= height / 2;
// Add all the audio files to the HTML
// addAudio(audioSrc);
// Set canvas width and height
$("#outside").attr("width", width).attr("height", height);
// Initialize canvas
var foreground = document.getElementById("outside");
var ctx = foreground.getContext("2d");

// ------------------------------------------
//
// Draw all the stuff
//
//

// Load the inside, then specify target
$("#inside").load(sceneryInsideSrc, function() {
	sloth = document.getElementById("sloth").getBoundingClientRect();
	audioPos = sloth;
});
// Draw Outside first so you can't see the
// inside whilst the outside is loading
sceneryOutside = new Image();
sceneryOutside.onload = function() {
	// IMPORTANT
	// When the image of the outside is loaded
	// begin drawing
	draw();
}
sceneryOutside.src = sceneryOutsideSrc;
// Add animation after the document is loaded
$(document).ready(function() {
	var img = new Image();
	var div = document.getElementById('animations');
	img.onload = function() {
	  div.appendChild(img);
	};
	img.src = animationSrc;
});

// ------------------------------------------
//
// Add interactivity
//
//

$(document).mousemove(onMouseMove);
$(document).click(event, function() {
	// If the sloth is clicked show success message
	if ((event.x > sloth.left && event.x < sloth.left + sloth.width) && (event.y > sloth.top && event.y < sloth.top + sloth.height)) {
		$(".success").css("width", "100vw").css("height", "100vh").css("opacity", "1");
	}
})

// ------------------------------------------
//
// Functions
//
//

// Main function, called whenever the mouse is moved
function draw() {
	// Clear whole canvas
	foreground.width = width;
	foreground.height = height;
	// Draw magnifying glass
	ctx.beginPath();
		ctx.arc(circleX,circleY,circleWidth,0,Math.PI*2,true);
		ctx.rect(0,0,width,height);
	ctx.closePath();
	// Clip the image
	clippedImage(sceneryOutside);
	// Draw outer ring of magnifying glass
	ctx.beginPath();
		ctx.arc(circleX,circleY,circleWidth,0,Math.PI*2,true);
		ctx.stroke();
		ctx.strokeStyle = magGlassOuterRingColor;
	ctx.closePath();
}
// Called to clip the image
function clippedImage(img) {
	// Save whole canvas
	ctx.save();
		// Clip everything
		ctx.clip();
		// Calculate height for correct aspect ratio
		var imgHeight = width * (img.height / img.width);
		// Where the image isn't draw background
	  	if (imgHeight < height){
	    	ctx.fillStyle = outsideBackgroundColor;
	    	ctx.fill();
	  	}
	  	// Draw the image
	  	ctx.drawImage(img,0,0,width,imgHeight);
	// Restore everything that hasn't changed
  	ctx.restore();
}
// Called onmousemove
function onMouseMove(evt) {
	// Move the circle around
	circleX = evt.pageX;
	circleY = evt.pageY;
	// Then redraw the canvas
	draw();
	directionalAudio(evt);
}
// Get all audio files and append them in the HTML
function addAudio(src) {
	$.ajax({
	    url: src,
	    success: function (data) {
	        $(data).find("a:contains(" + ".wav" + ")").each(function () {
	            var filename = this.href.replace(window.location.host, "").replace("http:///", "");
	            $("body").append($("<audio src=" + src + filename + " autoplay loop />"));
	        });
	    }
	});
}

function directionalAudio(event) {
	var audio 	= document.getElementById("water");
	var cursorX = event.pageX;
	var cursorY = event.pageY;
	var audioX 	= audioPos.left + audioPos.width / 2;
	var audioY 	= audioPos.top + audioPos.height / 2;
	var vol;

	// cX/Y = cursorX/Y, aX/Y = audioX/Y
	//
	// cX < aX	|	cX > aX
	//   &&		|	  &&
	// cY < aY	|	cY < aY
	//			|
	// -------- + --------> x
	//			|
	// cX < aX	|	cX > aX
	//   &&		|	  &&
	// cY > aY	|	cY > aY
	//			v
	//			y

	// Top left quadrant
	if (cursorX < audioX && cursorY < audioY) {
		if (audioX / cursorX > audioY / cursorY) {
			vol = cursorX / audioX;
		} else {
			vol = cursorY/ audioY;
		}
	// Top right quadrant
	} else if (cursorX > audioX && cursorY < audioY){
		if (cursorX / audioX > audioY / cursorY) {
			vol = Math.pow(audioX / cursorX, 4);
		} else {
			vol = cursorY / audioY;
		}
	// Bottom right quadrant
	} else if (cursorX > audioX && cursorY > audioY) {
		if (audioX / cursorX < audioY / cursorY) {
			vol = Math.pow(audioX / cursorX, 4);
		} else {
			vol = Math.pow(audioY / cursorY, 4);
		}
	// Bottom left quadrant
	} else if (cursorX < audioX && cursorY > audioY) {
		if (audioX / cursorX > cursorY / audioY) {
			vol = cursorX / audioX;
		} else {
			vol = Math.pow(audioY / cursorY, 4);
		}
	} else {
		vol = 0;
	}
	if (vol < 1) {
		if (vol < 0.05) {
			vol = 0;
		}
		audio.volume = vol;
	}
}