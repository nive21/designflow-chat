import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visualizing, setVisualizing] = useState(false);
  const [lastQuote, setLastQuote] = useState(""); // 🆕 Save last assistant quote for viz prompt

  // 🎉 Random welcome messages
  useEffect(() => {
    const welcomes = [
      "🌿 Welcome! I’m your design buddy. What kind of space are you imagining today?",
      "✨ Hi there! Ready to shape your dream room? Tell me your vibe.",
      "🛋️ Hello! I can help you style, price, and visualize your setup. What’s your vision?",
    ];
    setMessages([
      {
        sender: "assistant",
        text: welcomes[Math.floor(Math.random() * welcomes.length)],
      },
    ]);
  }, []);

  // 📝 Handle user question
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/analyze", {
        question: input,
      });
      const botMsg = { sender: "assistant", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
      setLastQuote(res.data.answer); // 🆕 store last quote
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "⚠️ Error fetching response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Generate visualization with dynamic prompt
  const handleGenerateImage = async () => {
    setVisualizing(true);

    // 🆕 Build prompt from lastQuote
    const vizPrompt = `
      Create a cozy 3D visualization of a living room setup based on this quote:
      "${lastQuote}"

      Show the recommended furniture in a modern, minimalist style.
      Include warm lighting, wooden flooring, and neutral walls to keep it inviting.
    `;

    try {
      const res = await axios.post("http://localhost:5000/visualize-products", {
        description: vizPrompt,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Here’s a preview of your design:",
          image: res.data.imageUrl,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "⚠️ Failed to generate image." },
      ]);
    } finally {
      setVisualizing(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex flex-col items-center py-6 px-4 font-sans"
      style={{
        margin: "40px",
        backgroundColor: "#F2FFE0",
        borderRadius: "15px",
        height: "100%",
        padding: "40px 10vw",
      }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🪴 Cozy Interior Design Assistant
      </motion.h1>

      <motion.div
        className="border rounded-2xl shadow-lg bg-white p-4 w-full max-w-lg h-[500px] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-4 py-2 rounded-2xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white align-right"
                  : "bg-green-100 text-gray-800"
              }`}
              style={{
                padding: "10px 20px",
                margin: "8px 0",
                borderRadius: "10px",
                display: "inline-flex",
                flexDirection: "column",
                alignContent: msg.sender === "user" ? "right" : "left",
                textAlign: msg.sender === "user" ? "right" : "left",
                border:
                  msg.sender === "user"
                    ? "1px solid rgb(11, 11, 11)"
                    : "1px solid #ccc",
                backgroundColor:
                  msg.sender === "user" ? "#ffffff40" : "rgb(237, 255, 212)",
              }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </motion.div>
            {msg.image && (
              <motion.img
                src={msg.image}
                alt="visualization"
                className="mt-3 rounded-xl shadow-md border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  maxWidth: "100%",
                  borderRadius: "10px",
                  margin: "10px 0",
                  border: "1px solid #ccc",
                }}
              />
            )}
          </div>
        ))}
        {loading && (
          <p className="text-gray-400 italic">⏳ Generating quote...</p>
        )}
        {visualizing && (
          <p className="text-gray-400 italic">🎨 Creating visualization...</p>
        )}
      </motion.div>

      {/* Suggestion chips */}
      {messages.length > 1 && !loading && !visualizing && (
        <div className="flex gap-3 mt-4" style={{ marginTop: "15px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleGenerateImage}
            className="px-4 py-2 bg-green-400 text-white rounded-full shadow-md hover:bg-green-500"
            style={{
              border: "none",
              padding: "4px 8px",
              color: "rgb(237, 255, 212)",
              backgroundColor: "#212121",
              cursor: "pointer",
              borderRadius: "4px",
              marginRight: "4px",
            }}
          >
            🌟 Generate Visualization
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => alert("A designer will be reaching out soon!")}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full shadow-md hover:bg-yellow-500"
            style={{
              border: "none",
              padding: "4px 8px",
              color: "rgb(237, 255, 212)",
              backgroundColor: "#212121",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            ✏️ Get in touch with a designer
          </motion.button>
        </div>
      )}

      {/* Input */}
      <div
        className="mt-4 flex w-full max-w-lg"
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: "5px",
        }}
      >
        <input
          className="flex-grow border p-3 rounded-l-xl shadow-inner focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your request..."
          style={{
            padding: "5px 16px",
            marginRight: "10px",
            height: "40px",
            borderRadius: "10px",
            border: "1px solid #fff",
            width: `calc(100% - 100px)`,
          }}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-6 rounded-r-xl shadow-md hover:bg-blue-600"
          style={{
            height: "50px",
            width: "50px",
            borderRadius: "10px",
            cursor: "pointer",
            backgroundColor: "ffffff",
            border: "1px solid rgb(201, 255, 126)",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
