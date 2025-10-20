import React, { useState, useRef } from "react";

const sounds = [
  { name: "🌧️ Rain", src: "/sounds/rain.mp3" },
  { name: "🌊 Ocean Waves", src: "/sounds/ocean.mp3" },
  { name: "🔥 Fireplace", src: "/sounds/fire.mp3" },
  { name: "🌿 Forest Birds", src: "/sounds/birds.mp3" },
  { name: "🎶 Soft Piano", src: "/sounds/piano.mp3" },
];

const CalmingSounds = () => {
  const [playing, setPlaying] = useState({});
  const audioRefs = useRef({});

  const toggleSound = (name, src) => {
    // Create audio object if not already created
    if (!audioRefs.current[name]) {
      const audio = new Audio(src);
      audio.loop = true; // ensures it auto-repeats
      audioRefs.current[name] = audio;
    }

    // Toggle play/pause
    if (playing[name]) {
      audioRefs.current[name].pause();
    } else {
      audioRefs.current[name].play();
    }

    // Update playing state
    setPlaying((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">🎵 Calming Sounds</h1>
      <p className="text-gray-600 mb-8">
        Relax and mix soothing nature and ambient sounds for focus or meditation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sounds.map(({ name, src }) => (
          <div
            key={name}
            className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center"
          >
            <h2 className="text-lg font-semibold mb-3">{name}</h2>
            <button
              onClick={() => toggleSound(name, src)}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                playing[name] ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {playing[name] ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>
        ))}
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

export default CalmingSounds;

