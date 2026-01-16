/**
 * DevTools Protection - Cross-Browser Compatible
 * Supports: Chrome, Firefox, Safari, Edge, Opera, Brave, Samsung Internet, Mobile browsers
 * Note: Complete prevention is impossible, but this adds strong deterrents
 */

// ============================================
// 🔧 DEVTOOLS PROTECTION TOGGLE
// ============================================
// Comment out the line below to DISABLE DevTools protection (for testing)
// Uncomment it to ENABLE DevTools protection (for production)
const ENABLE_DEVTOOLS_PROTECTION = false; // 👈 COMMENT THIS LINE TO DISABLE PROTECTION
// ============================================

// If protection is disabled, exit early
if (!ENABLE_DEVTOOLS_PROTECTION) {
  console.log("🔓 DevTools Protection is DISABLED (for testing)");
  // Early return - no protection code runs
} else {
  // Wait for DOM to be ready before applying protection
  const initProtection = () => {
    console.log("🔒 DevTools Protection is ENABLED");

    // Detect browser and OS
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isWindows = navigator.platform.toUpperCase().indexOf("WIN") >= 0;
    const isLinux = navigator.platform.toUpperCase().indexOf("LINUX") >= 0;
    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      /Apple Computer/.test(navigator.vendor);
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
        if (
          ctrlKey &&
          shiftKey &&
          (key === "I" || key === "i" || keyCode === 73)
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (
          ctrlKey &&
          shiftKey &&
          (key === "J" || key === "j" || keyCode === 74)
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (
          ctrlKey &&
          shiftKey &&
          (key === "C" || key === "c" || keyCode === 67)
        ) {
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
        if (
          ctrlKey &&
          shiftKey &&
          (key === "K" || key === "k" || keyCode === 75)
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (
          ctrlKey &&
          shiftKey &&
          (key === "E" || key === "e" || keyCode === 69)
        ) {
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
          (!isMac &&
            ctrlKey &&
            (key === "U" || key === "u" || keyCode === 85)) ||
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
    // DISABLED: Body replacement to prevent white screen issues
    // Only keyboard shortcuts and right-click protection are active
    // The detection below is commented out to prevent false positives

    // Note: We keep keyboard shortcuts and right-click blocking active
    // but disable the aggressive body replacement that causes white screen

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

    // Clear console (all browsers) - Only non-critical methods to avoid breaking React
    // Note: We keep error/warn for React to work properly
    const noop = () => {};
    const methods = [
      "debug",
      "info",
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

    // DO NOT override console completely - it breaks React rendering
    // Only disable specific methods above

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

    // Note: Body replacement detection removed to prevent white screen issues
    // Keyboard shortcuts and right-click blocking remain active for protection
  };

  // Initialize protection after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProtection);
  } else {
    // DOM already ready, but wait a bit for React to initialize
    setTimeout(initProtection, 100);
  }
}
