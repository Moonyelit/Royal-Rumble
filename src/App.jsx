// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage"; // Chemin corrigé
import BattleScene from "./components/BattleScene/BattleScene";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/battle" element={<BattleScene />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
