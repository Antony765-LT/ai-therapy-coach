import React from "react";
import { Link } from "react-router-dom";

const games = [
  { name: "🧠 Memory Match", path: "/game-memory" },
  { name: "🎯 Focus Dot", path: "/game-focus" },
  { name: "💡 Color Flow", path: "/game-color" },
];

const MindfulGames = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-700 mb-8">🪷 Mindful Games</h1>
      <p className="text-gray-700 mb-10 text-lg text-center max-w-2xl">
        Sharpen your focus and calm your mind through light, relaxing mini-games.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.name}
            to={game.path}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 text-center text-blue-600 font-semibold text-lg hover:bg-blue-50 transition-all"
          >
            {game.name}
          </Link>
        ))}
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-12 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        ⬅️ Return to Dashboard
      </button>
    </div>
  );
};

export default MindfulGames;
