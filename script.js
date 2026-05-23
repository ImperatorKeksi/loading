// ═══════════════════════════════════════════════════════════
// Shadow Squadron – Loadingscreen Script
// ═══════════════════════════════════════════════════════════

var totalFiles = 100;
var needsFiles = 0;
var filesDone  = 0;
var changelogLoaded = false;

// ─────────────────────────────────────────────────────────
// GARRY'S MOD HOOKS
// ─────────────────────────────────────────────────────────
function GameDetails(servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    document.getElementById('server-name').innerText = servername || "Shadow Squadron";
    document.getElementById('map-name').innerText    = mapname    || "Unknown Map";
    document.getElementById('gamemode').innerText    = gamemode   || "Star Wars RP";
}

function SetFilesTotal(total) {
    totalFiles = total;
    updateFileCount();
}

function SetFilesNeeded(needed) {
    needsFiles = needed;
    filesDone  = totalFiles - needsFiles;
    updateFileCount();
    updateProgressBar();
}

function DownloadingFile(fileName) {
    document.getElementById('current-file').innerText =
        "Downloading: " + fileName.replace(/"/g, "");
}

function SetStatusChanged(status) {
    document.getElementById('status').innerText = status;
}

function SetWelcomeMsg(playerName) {
    document.getElementById('status').innerText =
        "LINK ESTABLISHED: WILLKOMMEN ZURÜCK, " + playerName.toUpperCase();
}

// ─────────────────────────────────────────────────────────
// CHANGELOG – VON LUA (ZUVERLÄSSIG)
// Lua ruft SetChangelogData(jsonString) auf, sobald der
// Server die Daten von GitHub geladen hat.
// ─────────────────────────────────────────────────────────
function SetChangelogData(jsonStr) {
    try {
        var data = JSON.parse(jsonStr);
        renderChangelog(data);
        setLiveDot(true);
        var now = new Date();
        var ts = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
        document.getElementById('cl-last-updated').innerText = "SYNC " + ts;
        changelogLoaded = true;
    } catch(e) {
        setLiveDot(false);
        showFallback("Parse-Fehler: " + e.message);
    }
}

// Fallback: Direkte URL versuchen (klappt manchmal in neueren GMod-Versionen)
function fetchChangelogFallback() {
    if (changelogLoaded) return;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "changelog.json?t=" + Date.now(), true);
    xhr.timeout = 5000;
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4 || changelogLoaded) return;
        if (xhr.status === 200 && xhr.responseText) {
            try {
                var data = JSON.parse(xhr.responseText);
                renderChangelog(data);
                setLiveDot(true);
                var now = new Date();
                var ts = now.getHours().toString().padStart(2,"0") + ":" + now.getMinutes().toString().padStart(2,"0");
                document.getElementById('cl-last-updated').innerText = "SYNC " + ts;
                changelogLoaded = true;
            } catch(e) { /* ignore, wait for Lua */ }
        }
    };
    xhr.onerror = function() { /* ignore, Lua wird es liefern */ };
    try { xhr.send(); } catch(e) { /* ignore */ }
}

function showFallback(msg) {
    if (changelogLoaded) return;
    renderChangelog({
        version: "v3.0",
        entries: [{ date: "---", type: "fix", text: msg || "Changelog wird geladen..." }]
    });
}

function renderChangelog(data) {
    var container = document.getElementById('changelog-entries');
    var versionEl = document.getElementById('cl-version');
    if (!container) return;

    if (versionEl && data.version) versionEl.innerText = data.version;

    var entries   = data.entries || [];
    var tagLabels = { new: "NEU", fix: "FIX", update: "UPDATE", remove: "ENTF" };

    if (entries.length === 0) {
        container.innerHTML = '<div style="color:var(--text-dim);font-size:0.75rem;padding:20px;text-align:center;letter-spacing:2px;">KEINE EINTRÄGE</div>';
        return;
    }

    container.innerHTML = entries.map(function(entry, idx) {
        var label = tagLabels[entry.type] || entry.type.toUpperCase();
        var delay = (idx * 60) + "ms";
        return '<div class="cl-entry" style="animation-delay:' + delay + '">'
             +   '<div class="cl-date">' + escapeHtml(entry.date) + '</div>'
             +   '<div class="cl-tag tag-' + escapeHtml(entry.type) + '">' + label + '</div>'
             +   '<div class="cl-text">' + escapeHtml(entry.text) + '</div>'
             + '</div>';
    }).join('');
}

function setLiveDot(ok) {
    var dot = document.querySelector('.cl-live-dot');
    if (!dot) return;
    if (ok) { dot.classList.remove('error'); }
    else    { dot.classList.add('error');    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;");
}

// ─────────────────────────────────────────────────────────
// UI HELPER
// ─────────────────────────────────────────────────────────
function updateFileCount() {
    document.getElementById('files-needed').innerText =
        "Files: " + filesDone + " / " + totalFiles;
}

function updateProgressBar() {
    var pct = totalFiles > 0 ? (filesDone / totalFiles) * 100 : 0;
    pct = Math.min(100, Math.max(0, pct));
    document.getElementById('progress-bar').style.width   = pct + "%";
    document.getElementById('progress-percent').innerText = Math.round(pct) + "%";
}

// ─────────────────────────────────────────────────────────
// PARALLAX
// ─────────────────────────────────────────────────────────
document.addEventListener("mousemove", function(e) {
    var x = (window.innerWidth  / 2 - e.pageX) / 60;
    var y = (window.innerHeight / 2 - e.pageY) / 60;
    document.getElementById('background').style.transform =
        "translate(" + x + "px, " + y + "px) scale(1.05)";
});

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
window.onload = function() {
    // Sofort XHR-Fallback versuchen (klappt manchmal)
    fetchChangelogFallback();

    // Nach 3s nochmal versuchen falls noch nicht geladen
    setTimeout(function() {
        if (!changelogLoaded) fetchChangelogFallback();
    }, 3000);

    // Nach 8s Fehlermeldung wenn Lua auch nichts geschickt hat
    setTimeout(function() {
        if (!changelogLoaded) {
            setLiveDot(false);
            showFallback("Warte auf Server-Daten...");
        }
    }, 8000);

    // ── MUSIC PLAYER ──────────────────────────────────────
    var audio      = document.getElementById("loading-audio");
    var player     = document.getElementById("music-player");
    var muteBtn    = document.getElementById("mp-mute");
    var slider     = document.getElementById("mp-volume");
    var fill       = document.getElementById("mp-volume-fill");
    var volLabel   = document.getElementById("mp-vol-label");
    var iconSound  = document.getElementById("icon-sound");
    var iconMuted  = document.getElementById("icon-muted");

    var isMuted    = false;
    var lastVol    = 0.5;

    function setVolume(val) {
        val = Math.min(1, Math.max(0, val));
        audio.volume  = val;
        slider.value  = Math.round(val * 100);
        fill.style.width = (val * 100) + "%";
        volLabel.innerText = Math.round(val * 100) + "%";
        lastVol = val > 0 ? val : lastVol;
    }

    function setMute(mute) {
        isMuted = mute;
        audio.muted = mute;
        if (mute) {
            player.classList.add("muted");
            iconSound.style.display = "none";
            iconMuted.style.display = "block";
        } else {
            player.classList.remove("muted");
            iconSound.style.display = "block";
            iconMuted.style.display = "none";
        }
    }

    if (audio) {
        audio.volume = 0.5;

        // Autoplay (GMod unterstützt es, Browser benötigen Klick)
        var playAttempt = audio.play();
        if (playAttempt !== undefined) {
            playAttempt.catch(function() {
                // Warte auf ersten Klick im Browser-Preview
                document.body.addEventListener('click', function tryPlay() {
                    audio.play();
                    document.body.removeEventListener('click', tryPlay);
                });
            });
        }
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            setMute(!isMuted);
        });
    }

    if (slider) {
        slider.addEventListener('input', function() {
            var val = parseInt(slider.value) / 100;
            setVolume(val);
            // Wenn Slider auf 0 → mute; sonst unmute
            if (val === 0) { setMute(true); }
            else           { setMute(false); }
        });
    }
};
