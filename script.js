// ═══════════════════════════════════════════════════════════
// Shadow Squadron – Loadingscreen Script
// Changelog wird live von GitHub Pages geladen
// ═══════════════════════════════════════════════════════════

// ── GitHub Pages URL deiner changelog.json ──────────────
var CHANGELOG_URL = "changelog.json";
// Alle 30 Sekunden neu laden (falls der Screen lange offen ist)
var REFRESH_INTERVAL_MS = 30000;
// ────────────────────────────────────────────────────────

var totalFiles = 100;
var needsFiles = 0;
var filesDone  = 0;

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
// CHANGELOG – LADEN VON GITHUB PAGES
// ─────────────────────────────────────────────────────────
function fetchChangelog() {
    // Cache-buster damit GitHub Pages nicht die alte Version liefert
    var url = CHANGELOG_URL + "?t=" + Date.now();

    fetch(url)
        .then(function(res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function(data) {
            renderChangelog(data);
            setLiveDot(true);
            // Timestamp in Footer
            var now = new Date();
            var ts  = now.getHours().toString().padStart(2,"0") + ":"
                    + now.getMinutes().toString().padStart(2,"0");
            document.getElementById('cl-last-updated').innerText = "SYNC " + ts;
        })
        .catch(function(err) {
            console.warn("[ShadowSQ] Changelog konnte nicht geladen werden:", err);
            setLiveDot(false);
            // Fallback: statische Einträge zeigen
            renderChangelog({
                version: "v3.0",
                entries: [
                    { date: "---", type: "fix", text: "Changelog konnte nicht geladen werden. Bitte Server-Admin informieren." }
                ]
            });
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
    // Changelog sofort laden
    fetchChangelog();
    // Danach alle 30s aktualisieren (für sehr lange Ladezeiten)
    setInterval(fetchChangelog, REFRESH_INTERVAL_MS);

    // Audio
    var audio = document.getElementById("loading-audio");
    if (audio) {
        audio.volume = 0.5;
        document.body.onclick = function() { audio.play(); };
    }
};
