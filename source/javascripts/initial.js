// ------------------------------------------
//
// Preload the game
//
//

// Initialize all the Variables
var queue = new createjs.LoadQueue();
var complete = false;
var playClicked = false;
sceneName = "skyline";

// Position main div of the loading screen
var div = $("#loadingwrapper");
div.css("top", $(document).height() / 2 - div.height() / 2);
div.css("left", $(document).width() / 2 - div.width() / 2);

$(window).resize(function(){
	div.css("top", $(document).height() / 2 - div.height() / 2);
	div.css("left", $(document).width() / 2 - div.width() / 2);
	var animationimgelem = $("#animationimg");
	animationimgelem.css("left", window.innerWidth / 2 - animationimgelem.width() / 2);
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);
	var underwaterimgelem = $("#underwaterimg");
	underwaterimgelem.css("left", window.innerWidth / 2 - underwaterimgelem.width() / 2);
});

// Event handlers
queue.on("progress", handleProgress, this);
queue.on("complete", handleComplete, this);

// Put together filenames
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/animation.gif";
var sceneryOutsideSrc 	= src + "/sceneries/outside.png";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var slothAnimationSrc	= src + "/animation/sloth" + randomnumber + ".gif";
var underwaterAniSrc	= src + "/animation/underwater.gif";

// Preload all the files
queue.loadFile({id:"sceneryOutside", src:sceneryOutsideSrc});
queue.loadFile({id:"sceneryInside", src:sceneryInsideSrc});
queue.loadFile({id:"animation", src:animationSrc});
queue.loadFile({id:"slothAnimation", src:slothAnimationSrc});
queue.loadFile({id:"underwaterAnimation", src:underwaterAniSrc});
queue.loadFile("javascripts/waapisim.js");
queue.loadFile("javascripts/flashcanvas.js");
queue.loadFile("javascripts/home.js");
queue.loadFile("javascripts/script.js");

// Show percentage on loading indicator
function handleProgress(evt) {
	var percent = evt.loaded.toFixed(2) * 100;
	// Set the text of the loading indicator to the percentage that has been loaded
	document.getElementById('loadingbar').style.width = percent + "%";
}

// Handle the completion of the preloading
function handleComplete(evt) {
	complete = true;
	var animationwrapper = document.getElementById("animationwrapper");

	// Add inside scenery
	var inside = queue.getResult("sceneryInside");
	document.getElementById("inside").appendChild(inside);

	// Add outside scenery
	var outside = queue.getResult("sceneryOutside");
	document.getElementById("outside").appendChild(outside).setAttribute("id", "outsideImg");
	document.getElementById("outsideImg").style.visibility = "hidden";

	// Add whole page animations
	var img = queue.getResult("animation");
	animationwrapper.appendChild(img).setAttribute("id", "animationimg");
	var animationimgelem = $("#animationimg");
	animationimgelem.css("left", window.innerWidth / 2 - animationimgelem.width() / 2);

	// Add sloth animation
	var slothimg = queue.getResult("slothAnimation");
	animationwrapper.appendChild(slothimg).setAttribute("id", "slothimg");
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);

	// Add underwater animation
	var underwaterimg = queue.getResult("underwaterAnimation");
	animationwrapper.appendChild(underwaterimg).setAttribute("id", "underwaterimg");
	var underwaterimgelem = $("#underwaterimg");
	underwaterimgelem.css("left", window.innerWidth / 2 - underwaterimgelem.width() / 2);

	// If play was already clicked, initialize the game
	if (playClicked) {
		setTimeout(function() {
			initGame();
		}, 500);
	}
}

// Called when the play button is clicked
function playButtonClick() {
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
	setTimeout(function() {
		loading.css("visibility", "hidden");
	}, 250);
	// Call the init() function of the script.js file
	init();
}