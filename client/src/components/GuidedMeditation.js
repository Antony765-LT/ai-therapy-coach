import React, { useState, useRef } from "react";

const GuidedMeditation = () => {
  const [type, setType] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const synth = window.speechSynthesis;
  const bgAudioRef = useRef(null);

  const startMeditation = async () => {
    if (!type) return alert("Please select a meditation type.");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/guided-meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        setText(data.text);
        startBackgroundSound();
        speakMeditation(data.text);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start meditation.");
    } finally {
      setLoading(false);
    }
  };

  const speakMeditation = (text) => {
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices().find((v) => v.name.includes("Female") || v.name.includes("Google"));
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => {
      stopBackgroundSound();
      setPlaying(false);
    };

    synth.speak(utterance);
    setPlaying(true);
  };

  const stopMeditation = () => {
    synth.cancel();
    stopBackgroundSound();
    setPlaying(false);
  };

  const startBackgroundSound = () => {
    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio("/sounds/meditation-bg.mp3");
      bgAudioRef.current.loop = true;
      bgAudioRef.current.volume = 0.3;
    }
    bgAudioRef.current.play().catch((err) => console.warn("Audio play blocked:", err));
  };

  const stopBackgroundSound = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">🧘‍♀️ Guided Meditation</h1>
      <p className="text-gray-600 mb-8">
        Choose a meditation type and let the AI guide you through a peaceful, relaxing session.
      </p>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border border-gray-300 rounded-lg p-3 mb-6 w-full"
      >
        <option value="">Select Meditation Type</option>
        <option value="calm relaxation">Calm Relaxation</option>
        <option value="confidence boost">Confidence Boost</option>
        <option value="deep sleep">Deep Sleep</option>
        <option value="stress relief">Stress Relief</option>
        <option value="focus and clarity">Focus & Clarity</option>
      </select>

      <div className="flex justify-center gap-4 mb-6">
        {!playing ? (
          <button
            onClick={startMeditation}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Generating..." : "▶️ Start Meditation"}
          </button>
        ) : (
          <button
            onClick={stopMeditation}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            ⏸️ Stop Meditation
          </button>
        )}
      </div>

      {text && (
        <div className="bg-white p-6 rounded-xl shadow-lg text-left text-gray-700">
          <h2 className="font-semibold text-indigo-600 mb-2">Meditation Script:</h2>
          <p className="whitespace-pre-line leading-relaxed">{text}</p>
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        ⬅️ Return to Dashboard
      </button>
    </div>
  );
};

export default GuidedMeditation;


