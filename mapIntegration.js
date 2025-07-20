function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 17.562607, lng: 78.449478 }, // Example coordinates
        zoom: 12,
    });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");


  // Calculate fare based on distance
  function calculateFare(pickup, drop) {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
          {
              origins: [pickup],
              destinations: [drop],
              travelMode: 'DRIVING',
          },
          (response, status) => {
              if (status === 'OK') {
                  const distance = response.rows[0].elements[0].distance.value; // Distance in meters
                  const fareRate = 10; // Example fare rate per kilometer
                  const fare = (distance / 1000) * fareRate; // Convert to kilometers and calculate fare
                  document.getElementById('fare-user').innerText = `Estimated Fare: ₹${fare.toFixed(2)}`;
                  document.getElementById('distance-user').innerText = `Distance: ${(distance / 1000).toFixed(2)} km`;
              } else {
                  console.error('Error fetching distance:', status);
              }
          }
      );
  }

  // Event listener for fare calculation
  document.getElementById('calculate-fare-user').addEventListener('click', () => {
      const pickupLocation = document.getElementById('pickup').value;
      const dropLocation = document.getElementById('drop').value;

      // Call the calculateFare function
      calculateFare(pickupLocation, dropLocation);
  });

  // User Registration Logic
  document.getElementById('user-register').addEventListener('click', () => {
      const email = document.getElementById('user-email').value.trim();
      const phone = document.getElementById('user-phone').value.trim();

      // Prevent registration if fields are empty
      if (!email || !phone) {
          alert("⚠️ Please enter both email and phone number before proceeding.");
          return;
      }

      fetch('/register/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone })
      })
      .then(response => response.json())
      .then(data => {
          alert(data.message);
          document.getElementById('user-registration').style.display = 'none';
          document.getElementById('user-module').style.display = 'block';
      })
      .catch(error => console.error('Error:', error));
  });

  // Driver Registration Logic
  document.getElementById('driver-register').addEventListener('click', () => {
      const name = document.getElementById('driver-name').value.trim();
      const email = document.getElementById('driver-email').value.trim();
      const phone = document.getElementById('driver-phone').value.trim();
      const pan = document.getElementById('pan').value.trim();
      const aadhar = document.getElementById('aadhar').value.trim();

      // Prevent registration if any field is empty
      if (!name || !email || !phone || !pan || !aadhar) {
          alert("⚠️ Please enter all details before proceeding.");
          return;
      }

      fetch('/register/driver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, pan, aadhar })
      })
      .then(response => response.json())
      .then(data => {
          alert(data.message);
          document.getElementById('driver-registration').style.display = 'none';
          document.getElementById('driver-module').style.display = 'block';
      })
      .catch(error => console.error('Error:', error));
  });

  // Back buttons
  document.getElementById('back-to-main-from-user-registration').addEventListener('click', () => {
      document.getElementById('user-registration').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
  });

  document.getElementById('back-to-main-from-driver-registration').addEventListener('click', () => {
      document.getElementById('driver-registration').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
  });

  document.getElementById('back-to-main-from-user-module').addEventListener('click', () => {
      document.getElementById('user-module').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
  });

  document.getElementById('back-to-main-from-driver-module').addEventListener('click', () => {
      document.getElementById('driver-module').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
  });

  // Voice Recording Feature
  const userAudio = document.getElementById('user-audio');
  const startRecordingUser = document.getElementById('start-recording-user');
  const stopRecordingUser = document.getElementById('stop-recording-user');
  const downloadUser = document.getElementById('download-user');

  let mediaRecorderUser;
  let recordedChunksUser = [];

  startRecordingUser.addEventListener('click', () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
              mediaRecorderUser = new MediaRecorder(stream);
              mediaRecorderUser.start();
              mediaRecorderUser.ondataavailable = (event) => {
                  recordedChunksUser.push(event.data);
              };
              mediaRecorderUser.onstop = () => {
                  const blob = new Blob(recordedChunksUser, { type: 'audio/wav' });
                  const url = URL.createObjectURL(blob);
                  downloadUser.href = url;
                  downloadUser.download = 'user_recording.wav';
                  downloadUser.style.display = 'block';
                  userAudio.src = url;
                  userAudio.style.display = 'block';
              };
              stopRecordingUser.disabled = false;
              startRecordingUser.disabled = true;
          });
  });

  stopRecordingUser.addEventListener('click', () => {
      mediaRecorderUser.stop();
      stopRecordingUser.disabled = true;
      startRecordingUser.disabled = false;
  });

  // Driver Voice Recording Feature
  const driverAudio = document.getElementById('driver-audio');
  const startRecordingDriver = document.getElementById('start-recording-driver');
  const stopRecordingDriver = document.getElementById('stop-recording-driver');
  const downloadDriver = document.getElementById('download-driver');

  let mediaRecorderDriver;
  let recordedChunksDriver = [];

  startRecordingDriver.addEventListener('click', () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
              mediaRecorderDriver = new MediaRecorder(stream);
              mediaRecorderDriver.start();
              mediaRecorderDriver.ondataavailable = (event) => {
                  recordedChunksDriver.push(event.data);
              };
              mediaRecorderDriver.onstop = () => {
                  const blob = new Blob(recordedChunksDriver, { type: 'audio/wav' });
                  const url = URL.createObjectURL(blob);
                  downloadDriver.href = url;
                  downloadDriver.download = 'driver_recording.wav';
                  downloadDriver.style.display = 'block';
                  driverAudio.src = url;
                  driverAudio.style.display = 'block';
              };
              stopRecordingDriver.disabled = false;
              startRecordingDriver.disabled = true;
          });
  });

  stopRecordingDriver.addEventListener('click', () => {
      mediaRecorderDriver.stop();
      stopRecordingDriver.disabled = true;
      startRecordingDriver.disabled = false;
  });

  // Emergency and Fraud Reporting Functions
  const policeCar = document.getElementById("policeCar");
  const reportFraudBtn = document.getElementById("reportFraudBtn");
  const emergencyBtn = document.getElementById("emergencyBtn");
  const closePopupBtn = document.getElementById("closePopupBtn");
  const submitReportBtn = document.getElementById("submitReportBtn");
  const message = document.getElementById("message");

  reportFraudBtn.addEventListener("click", function () {
      console.log("User Report Fraud Button Clicked");
      document.getElementById("fraudPopup").style.display = "block";
  });

  closePopupBtn.addEventListener("click", function () {
      console.log("User Close Popup Button Clicked");
      document.getElementById("fraudPopup").style.display = "none";
  });

  submitReportBtn.addEventListener("click", function () {
      console.log("User Submit Report Button Clicked");
      message.style.display = "block";
      message.textContent = "Our team will take further actions...";
      setTimeout(() => {
          message.textContent = "The driver has been banned.";
      }, 3000);
  });

  emergencyBtn.addEventListener("click", function () {
      console.log("User Emergency Button Clicked");
      let siren = new Audio("https://www.soundjay.com/button/sounds/police-siren-01.mp3");
      siren.play().catch(() => alert("Enable sound manually."));
      policeCar.style.display = "block";
      policeCar.classList.add("light");
      setTimeout(() => {
          alert("Police is on the way!");
      }, 3000);
  });
});
