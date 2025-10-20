import React, { useState, useEffect } from "react";

const symbols = ["🌸", "🌞", "🌙", "🌊", "🍃", "🔥", "⭐", "💎"];

const GameMemory = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  // Shuffle cards at start
  useEffect(() => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffled);
  }, []);

  // Handle flip logic
  const handleFlip = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    setFlipped([...flipped, id]);
    setMoves((prev) => prev + 1);
  };

  // Check for matches
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.symbol === card2.symbol) {
        setMatched((prev) => [...prev, first, second]);
      }

      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards]);

  // Check for win
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setWon(true);
    }
  }, [matched, cards]);

  const resetGame = () => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-blue-50 p-6">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">🧠 Memory Match</h1>
      <p className="text-gray-700 mb-6">Calm your mind and sharpen your memory.</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <div
              key={card.id}
              onClick={() => handleFlip(index)}
              className={`w-20 h-20 flex items-center justify-center rounded-xl cursor-pointer text-3xl font-bold transition-all duration-300 ${
                isFlipped
                  ? "bg-white shadow-lg text-indigo-700"
                  : "bg-indigo-500 hover:bg-indigo-600 text-transparent"
              }`}
            >
              {isFlipped ? card.symbol : "💫"}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          🔄 Restart
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ⬅️ Return
        </button>
      </div>

      <p className="mt-4 text-gray-600">Moves: {moves}</p>

      {won && (
        <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-semibold shadow-md">
          🌟 Congratulations! You’ve matched all cards in {moves} moves!
        </div>
      )}
    </div>
  );
};

export default GameMemory;
