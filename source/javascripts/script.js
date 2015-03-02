// Console log with link to GitHub repo
console.log("%cInstead of wading through all this minified and obfuscated slush, why not have a look at the full, commented source of this game? You can find it here:", "color: #F05050");
console.log("%chttps://github.com/mstoiber/find-the-sloth", "color: #2C85BD; text-decoration: underline");

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
// Audio
var dirAudioScale = 15; // The bigger the number the smaller the radius in which you hear the directional Audio
var audioFilenames = [
    { name: "rain", vol: 1, loaded: false, dirAudio: false },
	{ name: "chatter", elem: "sloth", vol: 0.5, loaded: false, dirAudio: true },
    { name: "wind", elem: "nightingale", vol: 1, loaded: false, dirAudio: true}
];

// ------------------------------------------
//
// Setup
//
//

// Put together src urls for easy scene swapping
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.svg";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var audioSrc 			= src + "/audio/";
// Just to save a few characters
var width 	= window.innerWidth,
	height 	= window.innerHeight;
// Calculate the width of the magnifying glass
var circleWidth;
// Intialize globally needed variables and position
// magnifying glass in the middle of the page
var audioContext;
var sloth;
var vol;
var circleX = width / 2;
var circleY = height / 2;
var prevCircleX;
var prevCircleY;
var pageDiagonal = Math.pow(width, 2) + Math.pow(height, 2);
// Various booleans for settings
var success = false;
var audio 	= true;
// Set canvas width and height
$("#outside").attr("width", width).attr("height", height);
// Initialize canvas
var foreground = document.getElementById("outside");
var ctx = foreground.getContext("2d");
if (audio) {
    // Create an audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    // Load the sounds
    loadSounds(audioFilenames);
}

// ------------------------------------------
//
// Draw all the stuff
//
//

// Load the inside, inject it into the HTML and then specify target
$("#inside").load(sceneryInsideSrc, function() {
	sloth = document.getElementById("sloth").getBoundingClientRect();
});
// Draw outside
sceneryOutside = new Image();
sceneryOutside.onload = function() {
	// When the image of the outside is loaded
	// begin drawing
	draw();
}
sceneryOutside.src = sceneryOutsideSrc;
// Add animation after the document is loaded
$(document).ready(function() {
	var img = new Image();
	var div = document.getElementById('animationwrapper');
	img.onload = function() {
	  div.appendChild(img);
	};
	img.src = animationSrc;
});

// ------------------------------------------
//
// Add interactivity and responsiveness
//
//

if (success === false) {
	// Mouse/Finger move
	$(document).mousemove(onMouseMove);
	$(document).bind('touchmove', onMouseMove);
	// Click/touch
	$(document).click(function(evt) {
		// If the sloth is clicked show success message
		if ((evt.clientX > sloth.left && evt.clientX < sloth.left + sloth.width) && (evt.clientY > sloth.top && evt.clientY < sloth.top + sloth.height)) {
			success = true;
			audio = false;
			$(".success").css("width", "100vw").css("height", "100vh").css("opacity", "1");
		}
	});
	// Responsiveness
	$(window).resize(function(){
		width 	= window.innerWidth;
		height 	= window.innerHeight;
		foreground.width = width;
		foreground.height = height;
    	sloth = document.getElementById("sloth").getBoundingClientRect();
    	pageDiagonal = Math.pow(width, 2) + Math.pow(height, 2);
		draw();
	});
}

// ------------------------------------------
//
// Functions
//
//
// Main function, called whenever the mouse is moved
function draw() {
	// draw.preventDefault();
	// Redraw area where circle was before
	ctx.clearRect(prevCircleX - circleWidth * 1.5, prevCircleY - circleWidth * 1.5, circleWidth * 3, circleWidth * 3);
    circleWidth = width / magGlassScale;
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
	prevCircleX = circleX;
	prevCircleY = circleY;
}
// Called to clip the image
function clippedImage(img) {
	// Save whole canvas
	ctx.save();
		// Clip everything
		ctx.clip();
		// Calculate height for correct aspect ratio
		var imgHeight = width * (img.height / img.width);
		var imgWidth = width;
		var imgX = 0;
		if (imgHeight > height) {
			imgHeight = height;
			imgWidth = imgHeight * (img.width / img.height);
			imgX = (width - imgWidth) / 2;
		}
		// Where the image isn't draw background
	  	if (imgHeight < height){
	    	ctx.fillStyle = outsideBackgroundColor;
	    	ctx.fill();
	  	}
	  	// Draw the image
	  	ctx.drawImage(img,imgX,height - imgHeight,imgWidth,imgHeight);
	// Restore everything that hasn't changed
  	ctx.restore();
}
// Called on mouse move and touch move
function onMouseMove(evt) {
	// Move the circle around
	circleX = evt.pageX;
	circleY = evt.pageY;
	// If touch, set circleX and circleY to touch origin
	if (circleX === undefined || circleY === undefined) {
		evt.preventDefault();
		var touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
		circleX = touch.pageX;
		// Move circle up the Y axis by height/15,
		// Otherwise the finger would cover up the hole
		circleY = touch.pageY - height / 15;
	}
	// Then redraw the canvas
	draw();
	// If audio is on, check if we need to
	// change volume based on position.
	if (audio) {
		for (var i in audioFilenames) {
            if (audioFilenames[i].loaded && audioFilenames[i].dirAudio) {
                directionalAudio(evt, audioFilenames[i]);
            }
        }
	}
}
// Adjusts volume of sound based on how far away the mouse is from the source point
function directionalAudio(evt, obj) {
	// Variables used throughout this function only
	var cursorX = evt.pageX;
	var cursorY = evt.pageY;

	// If touch event
	if (cursorX === undefined || cursorY === undefined) {
		var touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
		cursorX = touch.pageX;
		cursorY = touch.pageY;
	}

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
	if (cursorX < obj.audioX && cursorY < obj.audioY) {
        vol = (Math.pow((obj.audioX - cursorX), 2) + Math.pow((obj.audioY - cursorY), 2)) / pageDiagonal;
	// Top right quadrant
	} else if (cursorX > obj.audioX && cursorY < obj.audioY){
        vol = (Math.pow((cursorX - obj.audioX), 2) + Math.pow((obj.audioY - cursorY), 2)) / pageDiagonal;
	// Bottom right quadrant
	} else if (cursorX > obj.audioX && cursorY > obj.audioY) {
		vol = (Math.pow((cursorX - obj.audioX), 2) + Math.pow((cursorY - obj.audioY), 2)) / pageDiagonal;
	// Bottom left quadrant
	} else if (cursorX < obj.audioX && cursorY > obj.audioY) {
		vol = (Math.pow((obj.audioX - cursorX), 2) + Math.pow((cursorY - obj.audioY), 2)) / pageDiagonal;
	}
	if (vol < 1 && vol > 0 && obj.loaded === true) {
		vol = Math.pow(1 - vol, dirAudioScale) * obj.vol;
		// Set gain (volume)
		obj.gainNode.gain.value = vol;
	}
}
// Load several sounds from a JSON list
function loadSounds(list) {
	for (var i in list) {
		if (list.hasOwnProperty(i)) {
			loadSound(list[i]);
		}
	}
}
// Load a single sound
function loadSound(obj) {
	var request = new XMLHttpRequest();
    // Create a source from the audio context
    obj.source = audioContext.createBufferSource();
	request.open('GET', audioSrc + obj.name + ".wav", true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		// request.response is encode so decode it now
		audioContext.decodeAudioData(request.response, function(buffer) {
    		// Save the buffer to the corresponding sound
    		obj.buffer = buffer;
    		// Add a gain node
    		obj.gainNode = audioContext.createGain();
			// Connect the node to the source
			obj.source.connect(obj.gainNode);
			// Connect all the nodes to the destination
			obj.gainNode.connect(audioContext.destination);
    		// Set loaded to true and play the audio
    		obj.loaded = true;
            // Get position of origin of audio
            if (obj.dirAudio) {
                obj.audioRect = document.getElementById(obj.elem).getBoundingClientRect();
                obj.audioX  = obj.audioRect.left + obj.audioRect.width / 2;
                obj.audioY  = obj.audioRect.top + obj.audioRect.height / 2;
            }
            // Set initial volume
            obj.gainNode.gain.value = obj.vol;
            // Start playing the sound
    		playSoundObj(obj);
		});
	}
	request.send();
}
// Play a sound
function playSoundObj(obj) {
	obj.source.buffer = obj.buffer;
    obj.source.gainNode = audioContext.createGain();
	// Loops and starts the sound
	obj.source.loop = true;
    obj.source.gainNode.gain.value = obj.vol;
	obj.source.start(0);
}