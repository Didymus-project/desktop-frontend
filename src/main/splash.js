document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progress-bar");
  const status = document.querySelector(".status");

  // Check if electronAPI is available
  if (window.electronAPI) {
    console.log("Splash screen ready and listening for progress updates.");
    window.electronAPI.on("progress-update", (event, percent) => {
      console.log("Received progress:", percent); // For debugging
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }
      if (status && percent === 100) {
        status.textContent = "Almost there...";
      }
    });
  } else {
    console.error("electronAPI not found! Preload script might have failed.");
  }
});
