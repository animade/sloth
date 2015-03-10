// ------------------------------------------
//
// Preloading and Setup
//
//

// Initialize variables
var queue = new createjs.LoadQueue();
var complete = false;
var playClicked = false;
sceneName = "skyline";

// Position main div of the loading screen
var loadingwrapper = $("#loadingwrapper");
centerLoadingwrapper();

// Resize elements on window.resize
$(window).resize(function(){
	centerLoadingwrapper();
});

// Event handlers for the loading queue
queue.on("progress", handleProgress, this);
queue.on("complete", handleComplete, this);

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

// Preload all the files for the game
queue.loadFile({id:"sceneryOutside", src:sceneryOutsideSrc});
queue.loadFile({id:"sceneryInside", src:sceneryInsideSrc});
queue.loadFile({id:"animation", src:animationSrc});
queue.loadFile({id:"slothAnimation", src:slothAnimationSrc});
queue.loadFile({id:"underwaterAnimation", src:underwaterAniSrc});
queue.loadFile("javascripts/waapisim.js");
queue.loadFile("javascripts/flashcanvas.js");
queue.loadFile("javascripts/home.js");
queue.loadFile("javascripts/script.js");
// Load the sounds
for (var i in audioFilenames) {
	queue.loadFile({ id: audioFilenames[i].name, src: audioSrc + audioFilenames[i].name, type:createjs.AbstractLoader.BINARY });
}
// Preload the files for the success screen
queue.loadFile({id:"successSentence", src:successSentenceSrc});
queue.loadFile({id:"successSloth", src:successSlothSrc});

// ------------------------------------------
//
// Functions
//
//

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

	// Decode sounds
	for (var i in audioFilenames) {
		audioFilenames[i].result = queue.getResult(audioFilenames[i].name);
		decodeSound(audioFilenames[i]);
	}
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

// Decode a sound
function decodeSound(obj) {
	// Decode the audiobuffer
	audioContext.decodeAudioData(obj.result, function(buffer) {
		// Save the decoded sound and buffer it
		obj.buffer = buffer;
		// Add a gain node
		obj.gainNode = audioContext.createGain();
		// Connect the nodes to the destination
		obj.gainNode.connect(audioContext.destination);
		// Set Volume to zero
        obj.gainNode.gain.value = 0;
		// Set loaded to true and play the audio
		obj.loaded = true;
        // Get position of origin of audio
        if (obj.dirAudio) {
            obj.audioRect = document.getElementById(obj.elem).getBoundingClientRect();
            obj.audioX  = obj.audioRect.left + obj.audioRect.width / 2;
            obj.audioY  = obj.audioRect.top + obj.audioRect.height / 2;
        } else {
        	// Set volume of non directional Audio files on load
        	obj.gainNode.gain.value = obj.vol;
        }
	});
}

// Center the loading screen elements on the page
function centerLoadingwrapper() {
	loadingwrapper.css("top", $(document).height() / 2 - loadingwrapper.height() / 2);
	loadingwrapper.css("left", $(document).width() / 2 - loadingwrapper.width() / 2);
	var animationimgelem = $("#animationimg");
	animationimgelem.css("left", window.innerWidth / 2 - animationimgelem.width() / 2);
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);
	var underwaterimgelem = $("#underwaterimg");
	underwaterimgelem.css("left", window.innerWidth / 2 - underwaterimgelem.width() / 2);
}