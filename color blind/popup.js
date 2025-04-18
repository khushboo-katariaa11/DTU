// ========== popup.js ==========
window.onload = () => {
  chrome.storage.sync.get(["enableDyslexia", "fontSize", "spacing", "cbType"], (data) => {
    document.getElementById("enableDyslexia").checked = data.enableDyslexia ?? false;
    document.getElementById("fontSize").value = data.fontSize ?? 18;
    document.getElementById("spacing").value = data.spacing ?? 2;
    document.getElementById("cbType").value = data.cbType ?? "";

    // Update the displayed values on load
    document.getElementById("fontSizeValue").textContent = `${document.getElementById("fontSize").value}px`;
    document.getElementById("spacingValue").textContent = `${(document.getElementById("spacing").value / 10)}em`;
  });

  // Update displayed font size value on input change
  document.getElementById("fontSize").addEventListener("input", (event) => {
    document.getElementById("fontSizeValue").textContent = `${event.target.value}px`;
  });

  // Update displayed letter spacing value on input change
  document.getElementById("spacing").addEventListener("input", (event) => {
    document.getElementById("spacingValue").textContent = `${(event.target.value / 10)}em`;
  });
};

document.getElementById("apply").addEventListener("click", () => {
  const fontSize = document.getElementById("fontSize").value;
  const spacing = document.getElementById("spacing").value;
  const cbType = document.getElementById("cbType").value;
  const enableDyslexia = document.getElementById("enableDyslexia").checked;

  chrome.storage.sync.set({ enableDyslexia, fontSize, spacing, cbType }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: applyAccessibilityStyles,
        args: [enableDyslexia, fontSize, spacing, cbType]
      });
    });
  });
});

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.sync.clear(() => {
    document.getElementById("enableDyslexia").checked = false;
    document.getElementById("fontSize").value = 18;
    document.getElementById("spacing").value = 2;
    document.getElementById("cbType").value = "";

    // Update the displayed values on reset
    document.getElementById("fontSizeValue").textContent = "18px";
    document.getElementById("spacingValue").textContent = "0.2em";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removeAccessibilityStyles
      });
    });
    alert("Accessibility settings reset. Page styling removed.");
  });
});

function applyAccessibilityStyles(enableDyslexia, fontSize, spacing, cbType) {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const themes = {
    default: { bg: "#fef6e4", text: "#001858", buttonBg: "#8bd3dd", buttonText: "#172c66" },
    protanopia: { bg: "#e0f2f7", text: "#263238", buttonBg: "#4db6ac", buttonText: "#fff" }, /* Light Cyan & Teal */
    deuteranopia: { bg: "#f1f8e9", text: "#33691e", buttonBg: "#aed581", buttonText: "#fff" }, /* Light Green & Lime */
    tritanopia: { bg: "#f3e5f5", text: "#4a148c", buttonBg: "#ce93d8", buttonText: "#fff" }, /* Light Purple & Purple */
    achromatopsia: { bg: "#f5f5f5", text: "#212121", buttonBg: "#9e9e9e", buttonText: "#fff" }  /* Light Gray & Gray */
  };

  const theme = themes[cbType] || themes.default;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerText = `
    body * {
      font-family: ${enableDyslexia ? "'OpenDyslexic', sans-serif" : "inherit"} !important;
      ${enableDyslexia ? `letter-spacing: ${spacing / 10}em !important;` : ""}
      ${enableDyslexia ? "line-height: 1.6 !important;" : ""}
      ${enableDyslexia ? `font-size: ${fontSize}px !important;` : ""}
      -webkit-text-size-adjust: none !important; /* Prevent mobile zoom adjustments */
    }
    html, body {
      background-color: ${theme.bg} !important;
      color: ${theme.text} !important;
    }
    a {
      color: ${theme.text} !important;
    }
    button, input[type="button"], input[type="submit"] {
      background-color: ${theme.buttonBg} !important;
      color: ${theme.buttonText} !important;
      border: 1px solid ${theme.text} !important;
      padding: 0.5em 1em !important;
      border-radius: 0.3em !important;
      cursor: pointer !important;
      font-size: inherit !important; /* Inherit font size for consistency */
    }
    /* Add more specific element styling if needed */
  `;
  document.head.appendChild(style);
  alert("EduAdapt Accessibility Mode Activated ✅");
}

function removeAccessibilityStyles() {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
}