import React, { useState } from "react";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    try {
      const res = await axios.post("http://localhost:5000/analyze", {
        question,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Salesforce + Perplexity Assistant</h1>
      <textarea
        rows={4}
        cols={50}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something about Salesforce data..."
      />
      <br />
      <button onClick={handleAsk}>Ask</button>
      <div style={{ marginTop: "20px" }}>
        <h2>Answer:</h2>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default App;
