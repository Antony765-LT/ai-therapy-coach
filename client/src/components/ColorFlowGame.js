import React, { useState, useEffect } from "react";

const generateColors = () => {
  // Generate random pastel colors
  const randomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
  return Array.from({ length: 16 }, () => randomColor());
};

const ColorFlowGame = () => {
  const [colors, setColors] = useState(generateColors());
  const [message, setMessage] = useState("Tap tiles to relax 🌈");
  const [audio] = useState(new Audio("/sounds/relax.mp3")); // optional calm background

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Prevent autoplay errors
    return () => audio.pause();
  }, [audio]);

  const blendColors = (i) => {
    // Slightly shift hue to create a "flow" effect
    const newColors = [...colors];
    newColors[i] = `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
    setColors(newColors);
  };

  const resetGame = () => {
    setColors(generateColors());
    setMessage("New color flow started 🎨");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 transition-all duration-700">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">🎨 ColorFlow Game</h1>
      <p className="text-gray-600 mb-6">{message}</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => blendColors(i)}
            style={{
              backgroundColor: color,
              width: "70px",
              height: "70px",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              transition: "background-color 0.5s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        🔁 Refresh Colors
      </button>

      <button
        onClick={() => window.history.back()}
        className="mt-4 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
      >
        ⬅️ Return to Dashboard
      </button>
    </div>
  );
};

export default ColorFlowGame;
