let myFriends = {};
// let peerConnection = new SimplePeer()
let mySocket;
let myLocalMediaStream;

// when the window loads, start capturing media
window.addEventListener("load", () => {
    // This kicks it off
    initCapture();
    alert("Your video and audio WILL be displayed into calm corner, which is a public space. By clicking OK, you CONSENT to enter Calm Corner.")
  });



function initCapture() {
    console.log("initCapture");
  
    // The video element on the page to display the webcam
    let videoEl = document.getElementById("myvideo");
  
    // Constraints - what do we want?
    let constraints = { audio: true, video: true };

    function myMute() {
      if (constraints = { audio: true }) {
        constraints = { audio: true, video: true }
        document.getElementById("muteAudio").innerHTML = "Mute my audio"
      } else {
        constraints = { audio: true }
        document.getElementById("muteAudio").innerHTML = "Unmute my audio"
      }
    }

    // Prompt the user for permission, get the stream
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        console.log(stream);  
        // Global object
        myLocalMediaStream = stream;
  
        // Attach to our video object
        videoEl.srcObject = stream;
  
        // Wait for the stream to load enough to play
        videoEl.onloadedmetadata = function (e) {
          videoEl.play();
        };
  
        // Now setup socket
        setupSocket();
      })
      .catch((err) => {
        /* Handle the error */
        alert(err);
      });
  }

function setupSocket() {
    mySocket = io.connect();
  
    mySocket.on("connect", function () {
      console.log("Socket Connected");
      console.log("My socket id: ", mySocket.id);
  
      // Tell the server we want a list of the other users
      mySocket.emit("list");
    });
  
    mySocket.on("disconnect", function (data) {
      console.log("Socket disconnected");
    });
  
    mySocket.on("peer_disconnect", function (data) {
      console.log("Your friend with ID " + data + " has left.");
  
      delete myFriends[data];
      document.getElementById(data).remove();
    });
  
    // Receive listresults from server
    mySocket.on("listresults", (data) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        // to make sure it's not myself
        if (data[i] != mySocket.id) {
          let theirSocketId = data[i];
          let peerConnection = setupConnection(true, theirSocketId);
          myFriends[data[i]] = peerConnection;
        }
      }
    });
  
    mySocket.on("signal", (to, from, data) => {
      console.log("Got a signal from the server: ", to, from, data);
  
      // to should be us
      if (to != mySocket.id) {
        console.log("Socket IDs don't match");
      }
  
      // Look for the right simplepeer in our array
      let connection = myFriends[from];
      if (connection) {
        connection.signal(data);
      } else {
        console.log("Never found right simplepeer object");
        // Let's create it then, we won't be the "initiator"
        let theirSocketId = from;
        let peerConnection = setupConnection(false, theirSocketId);
  
        myFriends[from] = peerConnection;
  
        // Tell the new simplepeer that signal
        peerConnection.signal(data);
      }
    });
  }

function setupConnection(initiator, theirSocketId) {
    let peerConnection = new SimplePeer({
      initiator: initiator,
      trickle: false,
    });
  
    // simplepeer generates signals which need to be sent across socket
    peerConnection.on("signal", (data) => {
      mySocket.emit("signal", theirSocketId, mySocket.id, data);
    });
  
    // When we have a connection, send our stream
    peerConnection.on("connect", () => {
      console.log("CONNECT");
      console.log(peerConnection);
  
      // Let's give them our stream
      peerConnection.addStream(myLocalMediaStream);
      console.log("Send our stream");
    });
  
    // Stream coming in to us
    peerConnection.on("stream", (stream) => {
      console.log("Incoming Stream");
  
      // This should really be a callback
      // Create a video object
      let theirVideoEl = document.createElement("VIDEO");
        theirVideoEl.id = theirSocketId;
        theirVideoEl.srcObject = stream;
        theirVideoEl.muted = true;
        theirVideoEl.onloadedmetadata = function (e) {
            theirVideoEl.play();
          };
        document.getElementById("theirVideos").appendChild(theirVideoEl);
        console.log(theirVideoEl);
      });





      let imageInput = document.getElementById('image-input');
      let imgConfirmButton = document.getElementById('img-confirm-button');

    imgConfirmButton.addEventListener('click', function () {
        // console.log(document.body.style.backgroundImage);

        let imgLink = imageInput.value;
        console.log(imgLink);

        document.body.style.backgroundImage = "url("+imgLink+")";


      //THIS CHUNK DOES NOT WORK YET!!!!!//
        peerConnection.on("image", (data) => {
            peer.send(imgLink);
        })
       //THIS CHUNK DOES NOT WORK YET!!!!!//

    });

    peerConnection.on("image", (data)=> {
          console.log("got a new image data: " + data);
    });


    let soundInput = document.getElementById('sound-input');
    let soundConfirmButton = document.getElementById('sound-confirm-button');

  soundConfirmButton.addEventListener('click', function () {
      let soundLink = soundInput.value;
      var audio = document.getElementById('soundURL');
      
      console.log(soundLink);
      console.log(document.getElementById('track'));
      document.getElementById('track').src = soundLink;

      audio.load();
      audio.play();
      audio.loop();


      //THIS CHUNK DOES NOT WORK YET!!!!!//
      peerConnection.on("sound", (data) => {
          peer.send(soundLink);
      })
      //THIS CHUNK DOES NOT WORK YET!!!!!//

  });

  peerConnection.on("sound", (data)=> {
        console.log("got a new sound data: " + data);
  });




    peerConnection.on("close", () => {
      console.log("Got close event");
      // Should probably remove from the array of simplepeers
    });
  
    peerConnection.on("error", (err) => {
      console.log(err);
    });
  
    return peerConnection;
  }
  



  //Music & Image Change
  function myMusic() {
    var x = document.getElementById("music");
    if (x.style.display === "none") {
      x.style.display = "block";
      document.getElementById("changeMusic").innerHTML = "Collapse"
    } else {
      x.style.display = "none";
      document.getElementById("changeMusic").innerHTML = "Change music for ALL"
    }
  }

  
  function myImage() {
    var y = document.getElementById("image");
    if (y.style.display === "none") {
      y.style.display = "block";
      document.getElementById("changeImage").innerHTML = "Collapse"

    } else {
      y.style.display = "none";
      document.getElementById("changeImage").innerHTML = "Change image for ALL"
    }
  }





