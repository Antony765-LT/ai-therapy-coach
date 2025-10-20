import React, { useEffect, useRef, useState } from "react";

export default function VoiceControls({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join("");
      onTranscript && onTranscript(text);
    };
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
  }, [onTranscript]);

  const start = () => {
    const r = recognitionRef.current;
    if (!r) return alert("SpeechRecognition not supported in this browser.");
    setListening(true);
    r.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={start} disabled={listening} style={{ padding: 8 }}>🎤 Start</button>
      <button onClick={stop} disabled={!listening} style={{ padding: 8 }}>⏹ Stop</button>
      <button onClick={() => speak("Hi there — your AI will speak responses aloud.")} style={{ padding: 8 }}>🔊 Test TTS</button>
    </div>
  );
}
