import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Player from "./pages/Player";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shorts" element={<Player />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
