// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var playButton;
var videoContent;
var myPlayer;
var countdownTimer;

var firstStart = true;

function init() {
  videoContent = document.getElementById('azuremediaplayer');

  var myOptions = {
    "nativeControlsForTouch": false,
    "logo": { "enabled": false },
    autoplay: false,
    controls: true,
    width: "640",
    height: "400",
    poster: ""
  };
  myPlayer = amp("azuremediaplayer", myOptions);

  myPlayer.addEventListener(amp.eventName.loadedmetadata, _ampEventHandler);
  myPlayer.addEventListener(amp.eventName.play, _ampEventHandler);

  // myPlayer.addEventListener('click',myFunction,false);

  myPlayer.src([
    {src: "http://demosite.streaming.mediaservices.windows.net/5d20899f-7b6f-46e0-bd6f-3e35de1f4b69/file.ism/Manifest", type: "application/vnd.ms-sstr+xml"}, 
  ]);

  myPlayer.pause();

  // var playButton = document.querySelector('.vjs-big-play-button');
  // playButton.addEventListener('click', myFunction);

  var playButton = document.querySelector('.vjs-big-play-button');
  var startEvent = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
  playButton.addEventListener(startEvent, function(e) { console.log('click');});
  playButton.addEventListener(startEvent, myFunction);
  playButton.addEventListener('click', myFunction);

  // myPlayer.controls = false;
  // playButton = document.getElementById('playButton');
  // // playButton.addEventListener('click', requestAds);
  // // requestAds();

  // // var x = document.getElementsByClassName("vjs-big-play-button");
  // // x.onclick = myFunction;
  // document.getElementsByClassName("vjs-text-track-display")[0].onclick=myFunction;
  // x.addEventListener('click', myFunction);
}

function _ampEventHandler(evt) {
      if ("loadedmetadata" == evt.type) {

            // $('#video-viewport').css("opacity", "1");
            // var x = document.getElementsByClassName("vjs-big-play-button");
            // // x.onclick = myFunction;
            // x[0].addEventListener('click', myFunction, false);
      }
      // if ("play" == evt.type) {
      //       // $('#video-viewport').css("opacity", "1");
      //       if(firstStart) {
      //         firstStart = false;
      //         myPlayer.pause();
      //         requestAds();
      //       }
      // }
      // if ("ended" == evt.type) {
      //       // myPlayer.play();
      // }
}

function myFunction() {
  myPlayer.play();
  myPlayer.pause();
  requestAds();
}

function createAdDisplayContainer() {
  // We assume the adContainer is the DOM id of the element that will house
  // the ads.
  // var content = document.getElementById('content');
  adDisplayContainer =
      new google.ima.AdDisplayContainer(
          document.getElementById('adContainer'), videoContent);
}

function requestAds() {
  // Create the ad display container.
  createAdDisplayContainer();
  // Initialize the container. Must be done via a user action on mobile devices.
  adDisplayContainer.initialize();
  // myPlayer.load();
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);

  // Request video ads.
  var adsRequest = new google.ima.AdsRequest();
  // adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
  //     'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
  //     'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
  //     'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';
  adsRequest.adTagUrl = document.location + 'vast';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 400;

  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

  adsRenderingSettings.uiElements = ['COUNTDOWN'];
  // videoContent should be set to the content video element.
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings);

  // Add listeners to the required events.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent);

  // Listen to any additional events, if necessary.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent);

  try {
    // Initialize the ads manager. Ad rules playlist will start at this time.
    adsManager.init(640, 400, google.ima.ViewMode.NORMAL);
    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for ad rules.

    var adContainer = document.getElementById('adContainer');
    adContainer.style.visibility = "visible";

    adsManager.start();
  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    showControl();
    myPlayer.play();
  }
}

function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
  // don't have ad object associated.
  var ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        showControl();
        myPlayer.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        intervalTimer = setInterval(
            function() {
              var remainingTime = adsManager.getRemainingTime();
            },
            300); // every 300ms
      }

      countdownTimer = setInterval(function() {
      var timeRemaining = adsManager.getRemainingTime();
      // Update UI with timeRemaining
      }, 1000);

      break;
    case google.ima.AdEvent.Type.COMPLETE:
      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      if (ad.isLinear()) {
        clearInterval(intervalTimer);
      }
      break;
  }
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  // console.log(adErrorEvent.getInnerError());
  console.log(adErrorEvent.getError().getErrorCode());
  console.log(adErrorEvent.getError().getMessage());
  // adsManager.destroy();

  showControl();
  myPlayer.play();
}

function onContentPauseRequested() {
  myPlayer.pause();
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking etc.)
  // setupUIForAds();
}

function onContentResumeRequested() {

  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  showControl();

  myPlayer.play();
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();

}

function showControl() {
  var player = document.getElementById('azuremediaplayer');
  var adContainer = document.getElementById('adContainer');

  adContainer.style.visibility = "hidden";

  player.classList.remove('vjs-controls-disabled');
  player.classList.add('vjs-controls-enabled');

  myPlayer.controls = true;
}

// Wire UI element references and UI event listeners.
init();
