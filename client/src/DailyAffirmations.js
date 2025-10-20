import React, { useState, useEffect } from "react";

const affirmations = [
  "I am calm, centered, and in control of my emotions.",
  "I deserve happiness, love, and peace of mind.",
  "Each breath I take fills me with relaxation and clarity.",
  "I am strong enough to handle anything that comes my way.",
  "Today, I choose joy, positivity, and gratitude.",
  "I am proud of how far I’ve come, and I’m excited for what’s ahead.",
  "I release stress and welcome inner peace.",
  "I am enough — just as I am.",
  "My thoughts create my reality, and I choose positive ones.",
  "I am becoming the best version of myself every single day.",
];

const DailyAffirmations = () => {
  const [affirmation, setAffirmation] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    // Pick random affirmation on load
    generateAffirmation();

    // Check if browser supports speech
    if ("speechSynthesis" in window) {
      setVoiceSupported(true);
    }
  }, []);

  const generateAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);
  };

  const speakAffirmation = () => {
    if (!voiceSupported) return alert("Speech not supported in your browser 😔");
    const utterance = new SpeechSynthesisUtterance(affirmation);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">🌞 Daily Affirmation</h1>
        <p className="text-lg text-gray-700 italic mb-6">"{affirmation}"</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={generateAffirmation}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            ✨ New Affirmation
          </button>

          {voiceSupported && (
            <button
              onClick={speakAffirmation}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              🔊 Listen
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        ⬅️ Return to Dashboard
      </button>
    </div>
  );
};

export default DailyAffirmations;
