// ------------------------------------------
//
// Preload the game
//
//

// Initialize all the Variables
var queue = new createjs.LoadQueue();
var complete = false;
var playClicked = false;
var sceneName = "skyline";
localStorage.setItem("sceneName", sceneName);

// Position main div of the loading screen
var div = $("#loadingwrapper");
div.css("top", $(document).height() / 2 - div.height() / 2);
div.css("left", $(document).width() / 2 - div.width() / 2);

$(window).resize(function(){
	div.css("top", $(document).height() / 2 - div.height() / 2);
	div.css("left", $(document).width() / 2 - div.width() / 2);
});

// Event handlers
queue.on("progress", handleProgress, this);
queue.on("complete", handleComplete, this);

// Audio Filenames
audioFilenames = [
	{ name: "street", vol: 1, loaded: false, dirAudio: false },
	{ name: "bells", elem: "santa", vol: 0.5, loaded: false, dirAudio: true },
	{ name: "shower", elem: "shower", vol: 0.5, loaded: false, dirAudio: true}
];

// Put together filenames
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.png";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var audioSrc 			= src + "/audio/";

// Preload all the files
queue.loadFile(animationSrc);
queue.loadFile(sceneryOutsideSrc);
queue.loadFile(sceneryInsideSrc);
queue.loadFile("javascripts/waapisim.js");
queue.loadFile("javascripts/flashcanvas.js");
queue.loadFile("javascripts/home.js");
queue.loadFile("javascripts/script.js");

// Load the audio files
for (var i in audioFilenames) {
	if (audioFilenames.hasOwnProperty(i)) {
		queue.loadFile(audioSrc + audioFilenames[i].name + ".wav");
	}
}

// Show percentage on loading indicator
function handleProgress(evt) {
	var percent = evt.loaded.toFixed(2) * 100;
	// Set the text of the loading indicator to the percentage that has been loaded
	document.getElementById('loadingbar').style.width = percent + "%";
}

// Handle the completion of the preloading
function handleComplete(evt) {
	complete = true;
	// If play was already clicked, initialize the game
	if (playClicked) {
		setTimeout(function() {
			initGame();
		}, 500);
	}
}

// Called when the play button is clicked
function playButtonClick() {
	console.log("yes");
	playClicked = true;
	// If the game is loaded, initialize the game
	if (complete) {
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
	// Fade out loading screen
	var loading = $("#loading");
	loading.css("opacity", "0");
	// Call the init() function of the script.js file
	init();
}