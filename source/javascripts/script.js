// Console log with link to GitHub repo
console.log("%cInstead of wading through all this minified and obfuscated slush, why not have a look at the full, commented source? You can find it here:", "color: #F05050");
console.log("%chttps://github.com/animade/sloth", "color: #2C85BD; text-decoration: underline");

// ------------------------------------------
//
// Settings
//
//

// Magnifying glass
var magGlassScale = 20; // The bigger the number the smaller the magnifying glass
// Audio
var dirAudioScale = 500; // The bigger the number the smaller the radius in which you hear the directional Audio
// Colors
var outsideBackgroundColor = "#b8fbdd";
var insideBackgroundColor = "#b8fbdd";
var magGlassOuterRingColor = "#86d1bc";

// Put together src urls for extensibility
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.png";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var audioSrc 			= src + "/audio/";
var slothSrc			= src + "/animation/sloth" + randomnumber + ".gif";

// ------------------------------------------
//
// Global variables
//
//

// Just to save a few characters
var width 	= window.innerWidth,
	height 	= window.innerHeight;
// Intialize globally needed variables and position
// magnifying glass in the middle of the page
var audioContext;
var sloth;
var vol;
var circleRadius;
var circleX = width / 2;
var circleY = height / 2;
var prevCircleX;
var prevCircleY;
var pageDiagonal;
var sceneryOutside;
var animationwrapper = document.getElementById('animationwrapper');
// Various booleans for settings
var success = false;
var audio 	= true;
var audioButton = false;
var info 	= false;
// Set canvas width and height
$("#outside").attr("width", width).attr("height", height);
// Initialize canvas
var foreground = document.getElementById("outside");
var ctx = foreground.getContext("2d");
// Randomize sloth placement
var slothString = "sloth" + randomnumber;

// ------------------------------------------
//
// Button event handlers
//
//

// Click on infobutton
$("#infobutton").click(function(evt) {
	// If the info screen is currently being shown
	if (info) {
		// Hide info screen
		$("#info").css("opacity", "0");
    	// Change the icon
		$("#i").css("display", "block");
		$("#e").css("display", "none");
		setTimeout(function() {
			$("#info").css("width", "0").css("height", "0");
		}, 250);
		info = false;
		// Turn on audio
		if (!audioButton && !success) {
			turnOnAudio();
		}
		_gaq.push(['_trackEvent', 'overlay', 'click', 'hideInfo']);
	} else {
		// Show info screen
		$("#info").css("width", "100vw").css("height", "100vh").css("opacity", "1");
    	// Change the icon
		$("#i").css("display", "none");
		$("#e").css("display", "block");
		info = true;
		// Mute all sounds except for the global sound
		if (!success) {
			for (var i in audioFilenames) {
		        if (audioFilenames[i].loaded && audioFilenames[i].playing && audioFilenames[i].dirAudio) {
		            audioFilenames[i].gainNode.gain.value = 0;
		            audioFilenames[i].playing = false;
		        }
		    }
		}
		_gaq.push(['_trackPageview']);
		_gaq.push(['_trackEvent', 'overlay', 'click', 'showInfo']);
	}
});
// On click on the audio button
$("#audiobutton").click(function() {
	audioButton = !audioButton;
	if (!audioButton) {
    	turnOnAudio();
    	// Change the icon
		$("#on").css("display", "block");
		$("#off").css("display", "none");
		_gaq.push(['_trackEvent', 'overlay', 'click', 'audioButtonOn']);
	} else {
		turnOffAudio();
    	// Change the icon
		$("#on").css("display", "none");
		$("#off").css("display", "block");
		_gaq.push(['_trackEvent', 'overlay', 'click', 'audioButtonOff']);
	}
});


// ------------------------------------------
//
// Functions
//
//

// Setup
function init() {
	// Set body background color
	$("body").css("background-color", insideBackgroundColor);
	// Calculate diagonal of the inside for the directional Audio
	pageDiagonal = Math.pow($("#inside svg").width(), 2) + Math.pow($("#inside svg").height(), 2);
	// Get scenery outside image from DOM
	sceneryOutside = queue.getResult("sceneryOutside");
	// Get target client rectangle
	sloth = document.getElementById(slothString).getBoundingClientRect();
	// Play the sounds
	for (var i in audioFilenames) {
		if (audioFilenames[i].playing === undefined) {
			playSoundObj(audioFilenames[i]);
		}
	}
	// Calculate circle Radius based on inside height
	circleRadius = $("#inside svg").height() / magGlassScale;
	// Start drawing
	draw();

	// Add interactivity
	if (success === false && info == false && title == false) {
		// Mouse/Finger move, $.throttle limits the amount of times the function onMouseMove executes to 41 times per second
		$(document).mousemove( $.throttle( 41, onMouseMove) );
		$(document).bind('touchmove', $.throttle( 41, onMouseMove));
		// Click/touch
		$(document).unbind("click").bind("click", function(evt) {
			var clickX = evt.clientX;
			var clickY = evt.clientY;
			// If touch event
			if (clickX === undefined || clickY === undefined) {
				evt.preventDefault();
				var touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
				clickX = touch.pageX;
				clickY = touch.pageY;
			}
			_gaq.push(['_trackEvent', 'game', 'click', 'playingField']);
			// If the sloth is clicked, show success message
			if ((clickX > sloth.left - circleRadius && clickX < sloth.left + sloth.width + (circleRadius - sloth.width)) && (clickY > sloth.top - circleRadius && clickY < sloth.top + sloth.height + circleRadius)) {
				success = true;
				turnOffAudio();
				$("#success").css("width", "100vw").css("height", "100vh").css("opacity", "1");
				// Turn on the theme music
				if (!audioButton) {
					$("#thememusic").animate({volume: 1.0}, 500);
				}
				_gaq.push(['_trackEvent', 'game', 'click', slothString]);
				_gaq.push(['_trackPageview']);
			}
		});
	}
	// Fluid responsiveness
	$(window).resize(function(){
		// Set new width and height
		width 	= window.innerWidth;
		height 	= window.innerHeight;
		// Set Canvas width and height
		foreground.width = width;
		foreground.height = height;
		// Redraw
		draw();
		// Get new target
		sloth = document.getElementById(slothString).getBoundingClientRect();
		// Get new pageDiagonal
		pageDiagonal = Math.pow($("#inside svg").width(), 2) + Math.pow($("#inside svg").height(), 2);
		// Get new bounding rectangles for the sound
		for (var i = 0; i < audioFilenames.length; i++) {
			obj = audioFilenames[i];
	        if (obj.dirAudio) {
	            obj.audioRect = document.getElementById(obj.elem).getBoundingClientRect();
	            obj.audioX  = obj.audioRect.left + obj.audioRect.width / 2;
	            obj.audioY  = obj.audioRect.top + obj.audioRect.height / 2;
	        }
	    }
		// Calculate circle Radius based on inside height
    	circleRadius = $("#inside svg").height() / magGlassScale;
	});
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
	window.requestAnimationFrame(draw);
	var underwatergif = document.getElementById('underwater').getBoundingClientRect();
	if ((circleX > underwatergif.left - (circleRadius * 2) && circleX < underwatergif.left + underwatergif.width * 2 + ((circleRadius * 2) - underwatergif.width)) && (circleY > underwatergif.top - (circleRadius * 2) && circleY < underwatergif.top + underwatergif.height + (circleRadius * 2))) {
		console.log(underwatergif.width);
		$('#underwaterimg').css('display', 'block');
	} else {
		$('#underwaterimg').css('display', 'none');
	}
	// If audio is on, check if we need to
	// change volume based on position.
	if (audio && !audioButton) {
		for (var i in audioFilenames) {
            if (audioFilenames[i].loaded && audioFilenames[i].dirAudio && audioFilenames[i].playing) {
            	directionalAudio(evt, audioFilenames[i]);
            }
        }
	}
}

// Main function, called whenever the mouse is moved
function draw() {
	// Redraw area where circle was before
	ctx.clearRect(prevCircleX - circleRadius * 3, prevCircleY - circleRadius * 3, circleRadius * 6, circleRadius * 6);
	// Draw magnifying glass ring
	ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,Math.PI*2,true);
		ctx.rect(0,0,width,height);
	ctx.closePath();
	// Clip the image
	clippedImage(sceneryOutside);
	// Draw outer ring of magnifying glass
	ctx.beginPath();
		ctx.arc(circleX,circleY,circleRadius,0,Math.PI*2,true);
		ctx.stroke();
		ctx.lineWidth = circleRadius / 7;
		ctx.strokeStyle = magGlassOuterRingColor;
	ctx.closePath();
	// Save previous circleX/Ys for redrawing
	prevCircleX = circleX;
	prevCircleY = circleY;
}

// Called to clip the image
function clippedImage(img) {
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
		// Draw background
    	ctx.fillStyle = outsideBackgroundColor;
    	ctx.fill();
	  	// Draw the image
	  	ctx.drawImage(img,imgX,height - imgHeight,imgWidth,imgHeight);
	  	animationwrapper.style.width = imgWidth;
  	ctx.restore();
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

// Play a sound
function playSoundObj(obj) {
	// If the source has not been defined yet
	if (obj.source === undefined) {
		// Add a gain node
		obj.gainNode = audioContext.createGain();
		// Add a source
		obj.source = audioContext.createBufferSource();
		// Connect the node to the source
		obj.source.connect(obj.gainNode);
		// Connect the nodes to the destination
		obj.gainNode.connect(audioContext.destination);
		// Connect the audio to the source
		obj.source.buffer = obj.buffer;
		// Sets playing to true
		obj.playing = true;
		// Loops the sound
		obj.source.loop = true;
		if (!obj.dirAudio && !audioButton) {
        	obj.gainNode.gain.value = obj.vol;
        } else {
        	obj.gainNode.gain.value = 0;
        }
        // Get position of origin of audio
        if (obj.dirAudio) {
            obj.audioRect = document.getElementById(obj.elem).getBoundingClientRect();
            obj.audioX  = obj.audioRect.left + obj.audioRect.width / 2;
            obj.audioY  = obj.audioRect.top + obj.audioRect.height / 2;
        }
		// Start the source
		obj.source.start(0);
	}
	// If the source has been defined and a global audio isn't playing, play it
	if (obj.source !== undefined && obj.playing === false && !obj.dirAudio && audioButton) {
		obj.gainNode.gain.value = obj.vol;
	}
}

// Turn off audio
function turnOffAudio() {
	if (!title) {
		for (var i in audioFilenames) {
	        if (audioFilenames[i].loaded && audioFilenames[i].playing) {
	            audioFilenames[i].gainNode.gain.value = 0;
	            audioFilenames[i].playing = false;
	        }
	    }
	}
	$("#thememusic").animate({volume: 0.0}, 500);
    audio = false;
}

// Turn on audio
function turnOnAudio() {
	if (!audioButton) {
		if (!info && !success && !title) {
			for (var i in audioFilenames) {
		        if (audioFilenames[i].loaded && !audioFilenames[i].playing) {
		            if (!audioFilenames[i].dirAudio) {
		            	audioFilenames[i].gainNode.gain.value = audioFilenames[i].vol;
		            }
		            audioFilenames[i].playing = true;
		        }
		    }
		}
		audio = true;
		if (title || success) {
			$("#thememusic").animate({volume: 1.0}, 500);
		}
	}
}

// Called when the button on the success screen is clicked
function playAgain() {
	success = false;
	// Hide success screen
	$("#success").css("opacity", "0");
	setTimeout(function() {
		$("#success").css("width", "0").css("height", "0")
		// Show a new random sentence
		randomsentence = Math.floor(Math.random() * 3) + 1;
		successSentenceSrc = "scenes/success_screen/sentence" + randomsentence + ".svg";
		var successDiv = document.getElementById("successwrapper");
		var successSentence = new Image();
		successSentence.onload = function() {
			$("#successSentence").remove();
			$("#successSloth")[0].parentNode.insertBefore(successSentence, $("#successSloth")[0].nextSibling).setAttribute("id", "successSentence");
		};
		successSentence.src = successSentenceSrc;
	}, 300);
	// New sloth
	randomnumber = Math.floor(Math.random()*4) + 1;
	var slothAnimationSrc = src + "/animation/sloth" + randomnumber + ".gif";
	var slothAnimation = new Image();
	slothAnimation.onload = function() {
	    var slothimgelem = $("#slothimg");
	    slothimgelem.attr("src", slothAnimationSrc);
	    // Get new target
		slothString = "sloth" + randomnumber;
		sloth = document.getElementById(slothString).getBoundingClientRect();
	};
	slothAnimation.src = slothAnimationSrc;
	// Initialize again
	init();
	// Play Sounds
	if (!audioButton) {
		turnOnAudio();
	}
	// Turn off theme music
	$("#thememusic").animate({volume: 0.0}, 500);
	_gaq.push(['_trackEvent', 'game', 'click', 'playAgain']);
	_gaq.push(['_trackPageview']);
}