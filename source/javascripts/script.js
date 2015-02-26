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
// Audio Files
var audioFilenames = [{name: "water", elem: "sloth"}];

// ------------------------------------------
//
// Setup
//
//

// Put together src urls for easy scene swapping
var src 				= "../scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.svg";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var audioSrc 			= src + "/audio/";
// Just to save a few characters
var width 	= window.innerWidth,
	height 	= window.innerHeight;
// Calculate the width of the magnifying glass
var circleWidth = width / magGlassScale;
// Intialize globally needed variables and position
// magnifying glass in the middle of the page
var audioContext;
var sloth;
var vol;
var circleX 	= width / 2;
var circleY 	= height / 2;
// Various booleans for settings
var success = false;
var audio 	= true;
// Set canvas width and height
$("#outside").attr("width", width).attr("height", height);
// Initialize canvas
var foreground = document.getElementById("outside");
var ctx = foreground.getContext("2d");
// Create an audio context
window.AudioContext = window.AudioContext || window.webkitAudioContext;
audioContext = new AudioContext();
// Create a source from the audio context
var source = audioContext.createBufferSource();
// Load the sounds
loadSounds(audioFilenames);
// Create a gain (volume) node (controller)
var gainNode = audioContext.createGain();

// ------------------------------------------
//
// Draw all the stuff
//
//

// Load the inside, then specify target
$("#inside").load(sceneryInsideSrc, function() {
	sloth = document.getElementById("sloth").getBoundingClientRect();
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
if (success === false) {
	$(document).mousemove(onMouseMove);
	$(document).click(event, function() {
		// If the sloth is clicked show success message
		if ((event.x > sloth.left && event.x < sloth.left + sloth.width) && (event.y > sloth.top && event.y < sloth.top + sloth.height)) {
			$(".success").css("width", "100vw").css("height", "100vh").css("opacity", "1");
			success === true;
		}
	});
}

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
	if (audio) {
		for (var i in audioFilenames) {
			directionalAudio(evt, audioFilenames[i]);
		}
	}
}
// Load several sounds from a JSON list
function loadSounds(list) {
	var len = list.length, i;
	for (i in list) {
		if (list.hasOwnProperty(i)) {
			loadSound(list[i]);
		}
	}
}
// Load a single sound
function loadSound(obj) {
	var request = new XMLHttpRequest();
	request.open('GET', audioSrc + obj.name + ".wav", true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		// request.response is encoded... so decode it now
		audioContext.decodeAudioData(request.response, function(buffer) {
			// Save the buffer to the corresponding sound
			obj.buffer = buffer;
			// When it is loaded, play the sound
			playSoundObj(obj);
		}, function(err) {
		  throw new Error(err);
		});
	}
	request.send();
}
// Play a sound
function playSoundObj(obj) {
	// Gets the source
	source = audioContext.createBufferSource();
	source.buffer = obj.buffer;
	// Sets initial gain to 1
	obj.gainNode = audioContext.createGain();
	obj.gainNode.gain.value = 0.2;
	// Loops and starts the sound
	source.loop = true;
	source.start(0);
}
// Adjusts volume of sound based on how far away the mouse is from the source point
function directionalAudio(event, obj) {
	var cursorX = event.pageX;
	var cursorY = event.pageY;
	var audioRect = document.getElementById(obj.elem).getBoundingClientRect();
	var audioX 	= audioRect.left + audioRect.width / 2;
	var audioY 	= audioRect.top + audioRect.height / 2;
	var prevVol = vol;

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
			vol = (audioX - (cursorX - audioX)) / audioX;
		} else {
			vol = cursorY / audioY;
		}
	// Bottom right quadrant
	} else if (cursorX > audioX && cursorY > audioY) {
		if (audioX / cursorX < audioY / cursorY) {
			vol = (audioX - (cursorX - audioX)) / audioX;
		} else {
			vol = (audioY - (cursorY - audioY)) / audioY;
		}
	// Bottom left quadrant
	} else if (cursorX < audioX && cursorY > audioY) {
		if (cursorX / audioX < audioY / cursorY) {
			vol = cursorX / audioX;
		} else {
			vol = (audioY - (cursorY - audioY)) / audioY;
		}
	} else {
		vol = 0;
	}
	if (vol < 1 && vol > 0) {
		// Create a gain (volume) node
		source.connect(gainNode);
		// Set gain
		gainNode.gain.value = vol;
		gainNode.connect(audioContext.destination);
	}
}