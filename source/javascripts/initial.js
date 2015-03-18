//= require "modernizr/modernizr.js"
//= require "jquery"

// Initialize variables
var complete = false;
var playClicked = false;
var audioDecoded = false;
var counter = 0;
var loadingwrapper = $("#loadingwrapper");
queue = new createjs.LoadQueue();
sceneName = "skyline";

// ------------------------------------------
//
// Event handlers
//
//

// Resize elements on window.resize
$(window).resize(function(){
	centerLoadingwrapper();
});

// On document ready center loadingwrapper
$(function() {
	centerLoadingwrapper();
});

// Event handlers for the loading queue
queue.on("progress", handleProgress, this);
queue.on("complete", handleComplete, this);
queue.on("fileload", handleFileLoad, this);

// ------------------------------------------
//
// Preloading
//
//

// Put together filenames for easier extensibility
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.png";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var slothAnimationSrc	= src + "/animation/sloth" + randomnumber + ".gif";
var underwaterAniSrc	= src + "/animation/underwater.gif";
var audioSrc 			= src + "/audio/";
var successSrc			= "scenes/success_screen/";
var successSentenceSrc	= successSrc + "sentence" + randomsentence + ".svg";
var successSlothSrc		= successSrc + "shine.gif";

// Scenery
queue.loadFile({id:"sceneryOutside", src:sceneryOutsideSrc});
queue.loadFile({id:"sceneryInside", src:sceneryInsideSrc});
// Animations
queue.loadFile({id:"animation", src:animationSrc});
queue.loadFile({id:"slothAnimation", src:slothAnimationSrc});
queue.loadFile({id:"underwaterAnimation", src:underwaterAniSrc});
// Scripts
queue.loadFile("javascripts/waapisim.js");
queue.loadFile("javascripts/flashcanvas.js");
queue.loadFile("javascripts/script.js");
// Sounds
for (var i in audioFilenames) {
	queue.loadFile({ id: audioFilenames[i].name, src: audioSrc + audioFilenames[i].name, type:createjs.AbstractLoader.BINARY, audio: true, number: i });
}
// Success Screen
queue.loadFile({id:"successSentence", src:successSentenceSrc});
queue.loadFile({id:"successSloth", src:successSlothSrc});

// ------------------------------------------
//
// Functions
//
//

// Called when a file has finished loading
function handleFileLoad(evt) {
	// If the file is an audio file, decode it
	if (evt.item.audio === true) {
		var audioFile = audioFilenames[evt.item.number];
		audioFile.result = queue.getResult(audioFile.name);
		decodeSound(audioFile);
	}
}

// Calculate percentage of loading bar
function handleProgress(evt) {
	var percent = evt.loaded.toFixed(2) * 100;
	// Set width of loading bar to percentage
	document.getElementById('loadingbar').style.width = percent + "%";
}

// Handle the completion of the preloading
function handleComplete(evt) {
	var animationwrapper = document.getElementById("animationwrapper");

	// Inject inside scenery
	var inside = queue.getResult("sceneryInside");
	document.getElementById("inside").appendChild(inside);

	// Inject outside scenery
	var outside = queue.getResult("sceneryOutside");
	document.getElementById("outside").appendChild(outside).setAttribute("id", "outsideImg");
	document.getElementById("outsideImg").style.visibility = "hidden";

	// Inject whole page animations
	var img = queue.getResult("animation");
	animationwrapper.appendChild(img).setAttribute("id", "animationimg");
	var animationimgelem = $("#animationimg");
	animationimgelem.css("left", window.innerWidth / 2 - animationimgelem.width() / 2);

	// Inject sloth animation
	var slothimg = queue.getResult("slothAnimation");
	animationwrapper.appendChild(slothimg).setAttribute("id", "slothimg");
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);

	// Inject underwater animation
	var underwaterimg = queue.getResult("underwaterAnimation");
	animationwrapper.appendChild(underwaterimg).setAttribute("id", "underwaterimg");
	var underwaterimgelem = $("#underwaterimg");
	underwaterimgelem.css("left", window.innerWidth / 2 - underwaterimgelem.width() / 2);

	// Inject success screen
	var successDiv = document.getElementById("successwrapper");
	var successSentence = queue.getResult("successSentence");
	successDiv.insertBefore(successSentence, successDiv.firstChild).setAttribute("id", "successSentence");
	var successSloth = queue.getResult("successSloth");
	successDiv.insertBefore(successSloth, successDiv.firstChild).setAttribute("id", "successSloth");

	complete = true;
	// If play was already clicked and the audio files already decoded, initialize the game
	if (playClicked && audioDecoded) {
		setTimeout(function() {
			initGame();
		}, 500);
	}
}

// Called when the play button is clicked
function playButtonClick() {
	playClicked = true;
	_gaq.push(['_trackEvent', 'game', 'click', 'play']);
	// If the game is loaded and the audio files decoded, initialize the game
	if (complete && audioDecoded) {
		initGame();
	// otherwise show the loading indicator
	} else {
		var loadingbar = document.getElementById("loadingbar");
		loadingbar.style.visibility = "visible";
		loadingbar.style.opacity = "1";
		var loadingindicator = document.getElementById("loadingindicator");
		loadingindicator.style.visibility = "visible";
		loadingindicator.style.opacity = "1";
	}
}

// Initializes the game
function initGame() {
	// Turn off theme music
	$("#thememusic").animate({volume: 0.0}, 500);
	// Fade out loading screen
	var loading = $("#loading");
	loading.css("opacity", "0");
	setTimeout(function() {
		loading.css("display", "none");
	}, 250);
	title = false;
	// Call the init() function of the script.js file
	init();
	_gaq.push(['_trackPageview']);
	_gaq.push(['_trackEvent', 'game', 'start']);
}

// Decode a sound
function decodeSound(obj) {
	// Decode the audiobuffer
	audioContext.decodeAudioData(obj.result, function(buffer) {
		// Save the decoded sound and buffer it
		obj.buffer = buffer;
		// Set loaded to true and play the audio
		obj.loaded = true;
        counter++;
        // When all the audio files are decoded, set audioDecoded to true
        if (counter === audioFilenames.length) {
        	audioDecoded = true;
        	// If all files are loaded and the play button was clicked, initialize the game
        	if (complete && playClicked) {
        		initGame();
        	}
        }
	});
}

// Center the loading screen elements on the page
function centerLoadingwrapper() {
	// Center wrapper
	loadingwrapper.css("top", $(window).height() / 2 - loadingwrapper.height() / 2);
	loadingwrapper.css("left", $(window).width() / 2 - loadingwrapper.width() / 2);
	// Center "The lost sloth" swinging animation
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);
}