// ═══════════════════════════════════════════════════════════
// Shadow Squadron – GMod Loading Screen Script
// Enthält: Changelog-System + Multi-Charakter-Profil-System
// ═══════════════════════════════════════════════════════════

var totalFiles = 100;
var needsFiles = 0;
var filesDone  = 0;

// ─────────────────────────────────────────────────────────
// CHANGELOG DATEN – hier einfach neue Einträge hinzufügen!
// Format: { date: "TT.MM.JJJJ", type: "new|fix|update|remove", text: "..." }
// ─────────────────────────────────────────────────────────
var CHANGELOG = [
    { date: "23.05.2025", type: "new",    text: "Shadow Squadron Loadingscreen v3 – Changelog & Charakterprofil-System" },
    { date: "23.05.2025", type: "fix",    text: "Biometric Scanner Authentifizierungs-Bug behoben" },
    { date: "22.05.2025", type: "update", text: "66th Division Dienstgrade und Einheitenzuweisungen aktualisiert" },
    { date: "21.05.2025", type: "new",    text: "Neues Addon: Venator Hangar Bay hinzugefügt" },
    { date: "20.05.2025", type: "remove", text: "Altes Loadingscreen-System vollständig entfernt" },
    { date: "19.05.2025", type: "update", text: "Serverperformance optimiert – neue Map gm_venator_v3" },
    { date: "18.05.2025", type: "fix",    text: "Spawn-Probleme auf dem Deck behoben" },
    { date: "17.05.2025", type: "new",    text: "Neues Whitelist-System für Spezialeinheiten eingeführt" },
    { date: "15.05.2025", type: "update", text: "Regelwerk aktualisiert – Abschnitt 4 und 7 überarbeitet" },
    { date: "12.05.2025", type: "fix",    text: "Crash beim Betreten des Server-Briefing-Raums behoben" },
];

// Aktuelle Changelog-Version (wird oben rechts angezeigt)
var CHANGELOG_VERSION = "v3.0";

// ─────────────────────────────────────────────────────────
// CHARAKTER-PROFIL DATEN
// Wird normalerweise via SetCharacterProfiles() aus Lua befüllt.
// Hier als Demo-Daten – kannst du in Lua überschreiben.
// ─────────────────────────────────────────────────────────
// Beispiel-Daten (werden durch Lua-Aufruf ersetzt):
var DEFAULT_CHARS = [
    {
        rank: "CPT",
        name: "REX",
        unit: "501st Legion // Battle Company",
        tags: ["Frontlinie", "Kommando", "ARC"],
        active: true
    },
    {
        rank: "SGT",
        name: "CODY",
        unit: "212th Attack Battalion // Ghost Company",
        tags: ["Aufklärung", "Heavy"],
        active: true
    }
];

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
    var cleanName = fileName.replace(/"/g, "");
    document.getElementById('current-file').innerText = "Downloading: " + cleanName;
}

function SetStatusChanged(status) {
    document.getElementById('status').innerText = status;
}

// ─────────────────────────────────────────────────────────
// CHARAKTER-PROFIL SYSTEM
// Lua-Aufruf: SetCharacterProfiles(jsonString)
// JSON-Format: Array von Charakter-Objekten (s.o. DEFAULT_CHARS)
// ─────────────────────────────────────────────────────────
function SetCharacterProfiles(jsonString) {
    var chars;
    try {
        chars = JSON.parse(jsonString);
    } catch(e) {
        console.warn("SetCharacterProfiles: ungültiges JSON", e);
        return;
    }
    renderCharacters(chars);
}

function renderCharacters(chars) {
    var slots = ["slot-1", "slot-2", "slot-3"];
    
    slots.forEach(function(slotId, i) {
        var slot = document.getElementById(slotId);
        if (!slot) return;
        
        if (i >= chars.length) {
            slot.classList.add("hidden");
            return;
        }
        
        var c = chars[i];
        slot.classList.remove("hidden", "dim");
        
        slot.querySelector('[id$="-rank"], .p-rank').innerText = c.rank || "---";
        slot.querySelector('[id$="-name"], .p-name').innerText = (c.name || "---").toUpperCase();
        slot.querySelector('[id$="-unit"], .profile-sub').innerText = c.unit || "Unbekannte Einheit";
        
        // Tags rendern
        var tagsEl = slot.querySelector('.profile-tags');
        if (tagsEl && c.tags && c.tags.length) {
            tagsEl.innerHTML = c.tags.map(function(t) {
                return '<span class="char-tag">' + t + '</span>';
            }).join('');
        }
    });
}

// ─────────────────────────────────────────────────────────
// CHANGELOG RENDER
// ─────────────────────────────────────────────────────────
function renderChangelog() {
    var container = document.getElementById('changelog-entries');
    var versionEl = document.getElementById('cl-version');
    if (!container) return;

    if (versionEl) versionEl.innerText = CHANGELOG_VERSION;

    var tagLabels = { new: "NEU", fix: "FIX", update: "UPDATE", remove: "ENTF" };

    container.innerHTML = CHANGELOG.map(function(entry, idx) {
        var label = tagLabels[entry.type] || entry.type.toUpperCase();
        var delay  = (idx * 80) + "ms";
        return '<div class="cl-entry" style="animation-delay:' + delay + '">'
             + '<div class="cl-date">' + entry.date + '</div>'
             + '<div class="cl-tag tag-' + entry.type + '">' + label + '</div>'
             + '<div class="cl-text">' + entry.text + '</div>'
             + '</div>';
    }).join('');
}

// ─────────────────────────────────────────────────────────
// WELCOME MESSAGE (Lua-Aufruf nach Authentifizierung)
// ─────────────────────────────────────────────────────────
function SetWelcomeMsg(playerName) {
    document.getElementById('status').innerText =
        "LINK ESTABLISHED: WILLKOMMEN ZURÜCK, " + playerName.toUpperCase();
    
    // Ersten Slot mit Spielername setzen falls noch nicht via SetCharacterProfiles gesetzt
    var slot1 = document.getElementById('slot-1');
    if (slot1) {
        var nameEl = slot1.querySelector('.p-name');
        if (nameEl && nameEl.innerText === "Authentifizierung...") {
            slot1.querySelector('.p-rank').innerText = "---";
            nameEl.innerText = playerName.toUpperCase();
            slot1.querySelector('.profile-sub').innerText = "Einheit wird geladen...";
        }
    }
}

// ─────────────────────────────────────────────────────────
// UI HELPER
// ─────────────────────────────────────────────────────────
function updateFileCount() {
    document.getElementById('files-needed').innerText =
        "Files: " + filesDone + " / " + totalFiles;
}

function updateProgressBar() {
    var percent = totalFiles > 0 ? (filesDone / totalFiles) * 100 : 0;
    percent = Math.min(100, Math.max(0, percent));
    document.getElementById('progress-bar').style.width   = percent + "%";
    document.getElementById('progress-percent').innerText = Math.round(percent) + "%";
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
// AUTO-SCAN ANIMATION
// ─────────────────────────────────────────────────────────
var profileNames = ["SYNCING...", "ENCRYPTING...", "SEARCHING...", "DECRYPTING..."];
var nameIdx = 0;

setInterval(function() {
    var bioName = document.getElementById('bio-name');
    if (bioName && bioName.innerText === "Authentifizierung...") {
        bioName.innerText = profileNames[nameIdx % profileNames.length];
        nameIdx++;
    }
}, 1500);

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
window.onload = function() {
    // Changelog rendern
    renderChangelog();

    // Demo-Charaktere anzeigen (werden in GMod durch Lua überschrieben)
    renderCharacters(DEFAULT_CHARS);

    // Audio
    var audio = document.getElementById("loading-audio");
    if (audio) {
        audio.volume = 0.5;
        document.body.onclick = function() { audio.play(); };
    }
};
