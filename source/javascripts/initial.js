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

// Put together filenames for easier extensibility
var src 				= "scenes/" + sceneName;
var animationSrc 		= src + "/animation/inside.mp4";
var sceneryOutsideSrc 	= src + "/sceneries/outside.png";
var sceneryInsideSrc 	= src + "/sceneries/inside.svg";
var slothAnimationSrc	= src + "/animation/sloth" + randomnumber + ".gif";
var underwaterAniSrc	= src + "/animation/underwater_isolated.gif";
var audioSrc 			= src + "/audio/";
var successSrc			= "scenes/success_screen/";
var successSentenceSrc	= successSrc + "sentence" + randomsentence + ".svg";
var successSlothSrc		= successSrc + "shine.gif";

// ------------------------------------------
//
// Event handlers
//
//

// Resize elements on window.resize
$(window).resize(function(){
	centerLoadingwrapper();
});

$(function() {
	// Make social sharing pop up in a small window
	var social_config = {
	    link: "a.popup",
	    width: 500,
	    height: 500
	};
	// Get all social links
	var slink = document.querySelectorAll(social_config.link);
	for (var a = 0; a < slink.length; a++) {
		// On click open the targets in a popup
	    slink[a].onclick = PopupHandler;
	}
	// Popup
	function PopupHandler(evt) {
	    evt = (evt ? evt : window.event);
	    var t = (evt.target ? evt.target : evt.srcElement);
	    // Position popup
	    var px = Math.floor(((screen.availWidth || 1024) - social_config.width) / 2);
	    var py = Math.floor(((screen.availHeight || 700) - social_config.height) / 2);
	    // Open popup
	    var popup = window.open(t.href, "social",
	        "width="+social_config.width+",height="+social_config.height+
	        ",left="+px+",top="+py+
	        ",location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");
	    if (popup) {
	        popup.focus();
	        if (evt.preventDefault) evt.preventDefault();
	        evt.returnValue = false;
	    }
	    return !!popup;
	}
});

// Event handlers for the loading queue
queue.on("progress", handleProgress, this);
queue.on("complete", handleComplete, this);
queue.on("fileload", handleFileLoad, this);

if (!Modernizr.touch) {
	// Start preloading, which initializes the whole thing
	preload();
} else {
	// Otherwise show the mobile warning
	$("#warning").css("width", "100vw").css("height", "100vh").css("opacity", "1");
}

// ------------------------------------------
//
// Functions
//
//

// Starts the preloading
function preload() {
	// Scenery
	queue.loadFile({id:"sceneryOutside", src:sceneryOutsideSrc});
	queue.loadFile({id:"sceneryInside", src:sceneryInsideSrc});
	if (Modernizr.touch) {
		queue.loadFile({id:"gifanimation", src: src + "/animation/animation.gif"});
	}
	// Animations
	queue.loadFile({id:"animation", src:animationSrc});
	queue.loadFile({id:"slothAnimation", src:slothAnimationSrc});
	queue.loadFile({id:"underwaterAnimation", src:underwaterAniSrc});
	// Scripts
	queue.loadFile("javascripts/waapisim.js");
	queue.loadFile("javascripts/flashcanvas.js");
	queue.loadFile("javascripts/throttle.min.js");
	queue.loadFile("javascripts/script.js");
	// Sounds
	for (var i in audioFilenames) {
		queue.loadFile({ id: audioFilenames[i].name, src: audioSrc + audioFilenames[i].name, type:createjs.AbstractLoader.BINARY, audio: true, number: i });
	}
	// Success Screen
	queue.loadFile({id:"successSentence", src:successSentenceSrc});
	queue.loadFile({id:"successSloth", src:successSlothSrc});
}

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

	// Inject sloth animation
	var slothimg = queue.getResult("slothAnimation");
	animationwrapper.appendChild(slothimg).setAttribute("id", "slothimg");
	var slothimgelem = $("#slothimg");
	slothimgelem.css("left", window.innerWidth / 2 - slothimgelem.width() / 2);

	// Inject underwater animation
	var underwaterimg = queue.getResult("underwaterAnimation");
	animationwrapper.appendChild(underwaterimg).setAttribute("id", "underwaterimg");
	var underwaterimgelem = $("#underwaterimg");
	var underwaterOriginal = document.getElementById("underwater").getBoundingClientRect();
	underwaterimgelem.css("left", underwaterOriginal.left + "px").css("top", (underwaterOriginal.top - $("#animationwrapper").offset().top) + "px").css("width", underwaterOriginal.width);

	// Inject success screen
	var successDiv = document.getElementById("successwrapper");
	var successSentence = queue.getResult("successSentence");
	successDiv.insertBefore(successSentence, successDiv.firstChild).setAttribute("id", "successSentence");
	var successSloth = queue.getResult("successSloth");
	successDiv.insertBefore(successSloth, successDiv.firstChild).setAttribute("id", "successSloth");

	if (Modernizr.touch) {
		// Inject whole page animations
		var img = queue.getResult("gifanimation");
		animationwrapper.appendChild(img).setAttribute("id", "animationimg");
		var animationimgelem = $("#animationimg");
		animationimgelem.css("left", window.innerWidth / 2 - animationimgelem.width() / 2);
	}

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
		showLoadingBar();
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

// Reveals loading bar
function showLoadingBar() {
	var loadingbar = document.getElementById("loadingbar");
	loadingbar.style.visibility = "visible";
	loadingbar.style.opacity = "1";
	var loadingindicator = document.getElementById("loadingindicator");
	loadingindicator.style.visibility = "visible";
	loadingindicator.style.opacity = "1";
}

// Center the loading screen elements on the page
function centerLoadingwrapper() {
	loadingwrapper.css("opacity", 1);
	// Center wrapper
	loadingwrapper.css("margin-top", (loadingwrapper.height() / 2) * -1);
	loadingwrapper.css("margin-left", (loadingwrapper.width() / 2) * -1);
}

// Mobile users who want to play
function playMobile() {
	preload();
	showLoadingBar();
	_gaq.push(['_trackEvent', 'mobile', 'click', 'playAnyway']);
	$("#warning").css("width", "0").css("height", "0").css("opacity", "0");
}