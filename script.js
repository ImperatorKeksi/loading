// Garry's Mod Loading Screen Hooks

var totalFiles = 100;
var needsFiles = 0;
var filesDone = 0;

/**
 * Initial Server Information
 */
function GameDetails(servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    document.getElementById('server-name').innerText = servername || "Republic of Cookie";
    document.getElementById('map-name').innerText = mapname || "Unknown Map";
    document.getElementById('gamemode').innerText = gamemode || "Star Wars RP";
}

/**
 * Total number of files that need downloading
 */
function SetFilesTotal(total) {
    totalFiles = total;
    updateFileCount();
}

/**
 * Files remaining to be downloaded
 */
function SetFilesNeeded(needed) {
    needsFiles = needed;
    filesDone = totalFiles - needsFiles;
    updateFileCount();
    updateProgressBar();
}

/**
 * Current file being downloaded
 */
function DownloadingFile(fileName) {
    // Current status cleaning
    var cleanName = fileName.replace(/"/g, "");
    document.getElementById('current-file').innerText = "Downloading: " + cleanName;
}

/**
 * Status message changes
 */
function SetStatusChanged(status) {
    document.getElementById('status').innerText = status;
}

/**
 * Update UI Helper Functions
 */
function updateFileCount() {
    var countText = "Files: " + filesDone + " / " + totalFiles;
    document.getElementById('files-needed').innerText = countText;
}

function updateProgressBar() {
    var percent = 0;
    if (totalFiles > 0) {
        percent = (filesDone / totalFiles) * 100;
    }
    
    // Clamp between 0-100
    percent = Math.min(100, Math.max(0, percent));
    
    document.getElementById('progress-bar').style.width = percent + "%";
    document.getElementById('progress-percent').innerText = Math.round(percent) + "%";
}

// Background Parallax Effect
document.addEventListener("mousemove", function(e) {
    var x = (window.innerWidth / 2 - e.pageX) / 50;
    var y = (window.innerHeight / 2 - e.pageY) / 50;
    document.getElementById('background').style.transform = "translate(" + x + "px, " + y + "px) scale(1.05)";
});

// Initialization
window.onload = function() {
    // Start music if blocked by browser autoplay policy
    var audio = document.getElementById("loading-audio");
    if (audio) {
        audio.volume = 0.5;
        // GMod usually allows autoplay, but just in case
        document.body.onclick = function() {
            audio.play();
        }
    }
};
