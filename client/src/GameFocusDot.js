import React, { useState, useEffect } from "react";

const GameFocusDot = () => {
  const [dotVisible, setDotVisible] = useState(false);
  const [message, setMessage] = useState("Relax and get ready...");
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [score, setScore] = useState([]);
  const [gameActive, setGameActive] = useState(false);

  // Starts a new round
  const startRound = () => {
    setMessage("Wait for it...");
    setGameActive(true);
    setDotVisible(false);
    setReactionTime(null);

   const delay = Math.random() * 1500 + 500; // random 0.5–2 seconds

    setTimeout(() => {
      setDotVisible(true);
      setStartTime(Date.now());
      setMessage("Click the dot!");
    }, delay);
  };

  // Handles user click
  const handleClick = () => {
    if (!dotVisible) {
      setMessage("Too soon! Try again.");
      setGameActive(false);
      return;
    }

    const reaction = Date.now() - startTime;
    setReactionTime(reaction);
    setScore((prev) => [...prev, reaction]);
    setMessage(`Great! Reaction Time: ${reaction}ms`);
    setDotVisible(false);
    setGameActive(false);
  };

  const averageTime =
    score.length > 0
      ? Math.round(score.reduce((a, b) => a + b, 0) / score.length)
      : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-indigo-100 p-6">
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">🎯 Focus Dot</h1>
      <p className="text-gray-600 mb-6">
        Train your focus and reflexes — stay calm, wait, and react.
      </p>

      <div
        className="relative w-80 h-80 bg-white shadow-lg rounded-xl flex items-center justify-center"
        style={{ overflow: "hidden" }}
      >
        {dotVisible && (
          <div
            className="absolute w-10 h-10 bg-indigo-600 rounded-full cursor-pointer transition-transform transform hover:scale-110"
            onClick={handleClick}
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        )}
        {!dotVisible && (
          <p className="text-gray-500 text-center px-4">{message}</p>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={startRound}
          disabled={gameActive}
          className={`px-6 py-2 rounded-lg text-white font-medium ${
            gameActive ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {gameActive ? "Get Ready..." : "🎯 Start Round"}
        </button>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ⬅️ Return
        </button>
      </div>

      {reactionTime && (
        <p className="mt-4 text-lg text-indigo-700 font-semibold">
          Your Reaction Time: {reactionTime}ms
        </p>
      )}

      {score.length > 0 && (
        <p className="mt-2 text-gray-700">
          Average Time: <span className="font-semibold">{averageTime}ms</span>
        </p>
      )}
    </div>
  );
};

export default GameFocusDot;
