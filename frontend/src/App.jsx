import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Medications from "./pages/Medications";
import Reminders from "./pages/Reminders";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";  // Importa el componente de la página de bienvenida
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-4 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Página principal de bienvenida */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
