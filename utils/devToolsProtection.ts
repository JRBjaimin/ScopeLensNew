/**
 * DevTools Protection - Cross-Browser Compatible
 * Supports: Chrome, Firefox, Safari, Edge, Opera, Brave, Samsung Internet, Mobile browsers
 * Note: Complete prevention is impossible, but this adds strong deterrents
 */

// Detect browser and OS
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const isWindows = navigator.platform.toUpperCase().indexOf("WIN") >= 0;
const isLinux = navigator.platform.toUpperCase().indexOf("LINUX") >= 0;
const isChrome =
  /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
const isFirefox = /Firefox/.test(navigator.userAgent);
const isSafari =
  /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
const isEdge =
  /Edge/.test(navigator.userAgent) || /Edg/.test(navigator.userAgent);
const isOpera =
  /Opera/.test(navigator.userAgent) || /OPR/.test(navigator.userAgent);
const isBrave =
  /Brave/.test(navigator.userAgent) ||
  ((navigator as any).brave && (navigator as any).brave.isBrave);
const isSamsung =
  /SamsungBrowser/.test(navigator.userAgent) ||
  /Samsung/.test(navigator.userAgent);
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Disable right-click context menu (all browsers)
document.addEventListener(
  "contextmenu",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  true
);

// Disable keyboard shortcuts - Cross-browser support
document.addEventListener(
  "keydown",
  (e) => {
    const ctrlKey = e.ctrlKey || e.metaKey; // Cmd on Mac, Ctrl on Windows/Linux
    const shiftKey = e.shiftKey;
    const altKey = e.altKey;
    const key = e.key;
    const keyCode = e.keyCode || (e as any).which;

    // F12 (All browsers)
    if (key === "F12" || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Chrome/Edge/Brave/Samsung: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (ctrlKey && shiftKey && (key === "I" || key === "i" || keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (ctrlKey && shiftKey && (key === "J" || key === "j" || keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (ctrlKey && shiftKey && (key === "C" || key === "c" || keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Brave browser: Additional shortcuts (same as Chrome but explicitly handled)
    if (
      isBrave &&
      ctrlKey &&
      shiftKey &&
      (key === "I" || key === "i" || keyCode === 73)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Samsung Internet: Uses Chrome shortcuts (Ctrl+Shift+I/J/C)
    if (
      isSamsung &&
      ctrlKey &&
      shiftKey &&
      (key === "I" || key === "i" || keyCode === 73)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Firefox: Ctrl+Shift+K (Console), Ctrl+Shift+E (Network)
    if (ctrlKey && shiftKey && (key === "K" || key === "k" || keyCode === 75)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (ctrlKey && shiftKey && (key === "E" || key === "e" || keyCode === 69)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Safari: Cmd+Option+I, Cmd+Option+C
    if (
      isMac &&
      ctrlKey &&
      altKey &&
      (key === "I" || key === "i" || keyCode === 73)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (
      isMac &&
      ctrlKey &&
      altKey &&
      (key === "C" || key === "c" || keyCode === 67)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // View Source: Ctrl+U (Windows/Linux), Cmd+Option+U (Mac)
    if (
      (!isMac && ctrlKey && (key === "U" || key === "u" || keyCode === 85)) ||
      (isMac &&
        ctrlKey &&
        altKey &&
        (key === "U" || key === "u" || keyCode === 85))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Save Page: Ctrl+S (Windows/Linux), Cmd+S (Mac)
    if (ctrlKey && (key === "S" || key === "s" || keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Print: Ctrl+P (Windows/Linux), Cmd+P (Mac)
    if (ctrlKey && (key === "P" || key === "p" || keyCode === 80)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Opera: Ctrl+Shift+I, Ctrl+Shift+J
    if (
      isOpera &&
      ctrlKey &&
      shiftKey &&
      (key === "I" || key === "i" || keyCode === 73)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Mobile: Prevent long-press context menu
    if (isMobile && (keyCode === 93 || (e as any).button === 2)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  true
);

// Multiple DevTools detection methods (cross-browser)
let devToolsOpen = false;
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

const detectDevTools = () => {
  // Method 1: Window size difference (Chrome, Firefox, Edge)
  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;
  const threshold = 160;

  // Method 2: Console detection (all browsers)
  let consoleOpen = false;
  try {
    const start = performance.now();
    console.log("%c", "");
    const end = performance.now();
    if (end - start > 100) {
      consoleOpen = true;
    }
  } catch (e) {}

  // Method 3: Debugger detection
  let debuggerDetected = false;
  try {
    (function () {
      const noop = function () {};
      const devtools = {
        open: false,
        orientation: null,
      };
      const element = new Image();
      Object.defineProperty(element, "id", {
        get: function () {
          devtools.open = true;
          debuggerDetected = true;
        },
      });
      console.log(element);
    })();
  } catch (e) {}

  // Method 4: Window size change detection
  const widthChanged = Math.abs(window.innerWidth - lastWidth) > 50;
  const heightChanged = Math.abs(window.innerHeight - lastHeight) > 50;

  if (
    widthDiff > threshold ||
    heightDiff > threshold ||
    consoleOpen ||
    debuggerDetected ||
    widthChanged ||
    heightChanged
  ) {
    if (!devToolsOpen) {
      devToolsOpen = true;
      document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a1a; color: #fff; font-family: system-ui; flex-direction: column; gap: 20px; padding: 20px; text-align: center;">
          <h1 style="font-size: 2rem; margin: 0;">⚠️ Developer Tools Detected</h1>
          <p style="font-size: 1.2rem; opacity: 0.8;">Please close Developer Tools to continue.</p>
          <p style="font-size: 0.9rem; opacity: 0.6;">This website is protected.</p>
        </div>
      `;
      document.body.style.overflow = "hidden";
    }
  } else {
    devToolsOpen = false;
  }

  lastWidth = window.innerWidth;
  lastHeight = window.innerHeight;
};

// Run detection multiple ways
setInterval(detectDevTools, 500);
setInterval(() => {
  if (devToolsOpen) {
    detectDevTools();
  }
}, 100);

// Additional protection: Detect if DevTools was opened before page load
if (
  window.outerWidth - window.innerWidth > 160 ||
  window.outerHeight - window.innerHeight > 160
) {
  detectDevTools();
}

// Prevent opening DevTools via browser menu (additional check)
window.addEventListener("resize", () => {
  detectDevTools();
});

// Disable copy (all browsers)
document.addEventListener(
  "copy",
  (e) => {
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", "");
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  true
);

// Disable cut
document.addEventListener(
  "cut",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  true
);

// Clear console (all browsers)
const noop = () => {};
const methods = [
  "log",
  "debug",
  "info",
  "warn",
  "error",
  "assert",
  "dir",
  "dirxml",
  "group",
  "groupEnd",
  "time",
  "timeEnd",
  "count",
  "trace",
  "profile",
  "profileEnd",
  "table",
  "clear",
];

methods.forEach((method) => {
  try {
    if ((console as any)[method]) {
      (console as any)[method] = noop;
    }
  } catch (e) {}
});

// Override console object completely (additional protection)
try {
  Object.defineProperty(window, "console", {
    value: {},
    writable: false,
    configurable: false,
  });
} catch (e) {
  // Fallback if defineProperty fails
}

// Disable image dragging (all browsers)
document.addEventListener(
  "dragstart",
  (e) => {
    if (e.target && (e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  true
);

// Disable text selection (all browsers)
document.addEventListener(
  "selectstart",
  (e) => {
    if (
      e.target &&
      (e.target as HTMLElement).tagName !== "INPUT" &&
      (e.target as HTMLElement).tagName !== "TEXTAREA" &&
      (e.target as HTMLElement).tagName !== "SELECT"
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  true
);

// Disable drag and drop
document.addEventListener(
  "drag",
  (e) => {
    e.preventDefault();
    return false;
  },
  true
);

document.addEventListener(
  "drop",
  (e) => {
    e.preventDefault();
    return false;
  },
  true
);

// Mobile: Disable long-press
if (isMobile) {
  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - ((window as any).lastTouchEnd || 0) < 300) {
        e.preventDefault();
      }
      (window as any).lastTouchEnd = now;
    },
    { passive: false }
  );
}

// Warn on beforeunload if DevTools might be open
window.addEventListener("beforeunload", (e) => {
  if (devToolsOpen) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});
