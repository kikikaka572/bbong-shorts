import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Player from "./pages/Player";
import Ranking from "./pages/Ranking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/:category/play" element={<Player />} />
        <Route path="/:category" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
