const extractMeetIdFromUrl = () => {
  const match = window.location.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
  return match ? match[1] : null;
};

const getMeetId = () => {
  return new Promise((resolve) => {
    const tryGetMeetId = () => {
      const meetId = extractMeetIdFromUrl();
      if (meetId) {
        console.log("🆔 Meet ID (from URL):", meetId);
        resolve(meetId);
      } else {
        console.warn("⌛ Retrying Meet ID extraction...");
        setTimeout(tryGetMeetId, 1000);
      }
    };
    tryGetMeetId();
  });
};

let globalMeetId = null;

const observeCaptions = async () => {
  const targetSelector = 'div[aria-label="Captions"]';
  const targetNode = document.querySelector(targetSelector);

  if (!targetNode) {
    console.warn("❌ Captions container not found. Retrying in 1s...");
    setTimeout(observeCaptions, 1000);
    return;
  }

  console.log("✅ Captions container found.");

  try {
    globalMeetId = await getMeetId();
    console.log(`📋 Meet ID: ${globalMeetId}`);
  } catch (error) {
    console.warn("⚠️ Meet ID extraction failed:", error);
    globalMeetId = "unknown-meeting";
  }

  console.log("📡 Listening for all speaker captions...");

  let currentSpeaker = null;
  let currentTranscript = '';
  let inactivityTimeout = null;

  const logCurrentSpeaker = () => {
    if (currentSpeaker && currentTranscript) {
      const payload = {
        meetingId: globalMeetId,
        speaker: currentSpeaker,
        transcript: currentTranscript
      };

      console.log("📤 Sending transcript to backend:", payload);

      fetch("http://localhost:5000/api/transcripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          console.log("✅ Server response:", res.status, data);
        })
        .catch((err) => {
          console.error("❌ Network error while sending transcript:", err);
        });
    }
  };

  const processAllCaptionElements = () => {
    const allCaptionBlocks = targetNode.querySelectorAll("div");

    let latestSpeaker = null;
    let latestTranscript = "";

    for (let i = allCaptionBlocks.length - 1; i >= 0; i--) {
      const div = allCaptionBlocks[i];
      const speaker = div.querySelector(".NWpY1d")?.innerText.trim();
      const transcript = div.querySelector(".VbkSUe")?.innerText.trim();

      if (speaker && transcript) {
        latestSpeaker = speaker;
        latestTranscript = transcript;
        break;
      }
    }

    if (!latestSpeaker || !latestTranscript) return;

    if (currentSpeaker !== latestSpeaker) {
      console.log(`🔄 Speaker switched: ${currentSpeaker} ➡️ ${latestSpeaker}`);
      if (currentSpeaker && currentTranscript) {
        logCurrentSpeaker();
      }
      currentSpeaker = latestSpeaker;
      currentTranscript = latestTranscript;
    } else {
      currentTranscript = latestTranscript;
    }

    if (inactivityTimeout) clearTimeout(inactivityTimeout);

    inactivityTimeout = setTimeout(() => {
      console.log("⏳ Inactivity timeout triggered");
      logCurrentSpeaker();
      currentSpeaker = null;
      currentTranscript = '';
    }, 5000);
  };

  const observer = new MutationObserver(() => {
    processAllCaptionElements();
  });

  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.addEventListener("beforeunload", () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    logCurrentSpeaker();
  });
};

const startObserverWithRetry = () => {
  const retryInterval = setInterval(() => {
    const targetNode = document.querySelector('div[aria-label="Captions"]');
    if (targetNode) {
      clearInterval(retryInterval);
      observeCaptions();
    } else {
      console.log("🔍 Waiting for Captions container...");
    }
  }, 1000);
};

startObserverWithRetry();
