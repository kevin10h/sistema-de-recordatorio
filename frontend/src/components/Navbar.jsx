import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token al cerrar sesión
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-3 flex gap-4">
      {token ? (
        <>
          <Link to="/medications">Medicamentos</Link>
          <Link to="/reminders">Recordatorios</Link>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={handleLogout} className="text-white">Cerrar sesión</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
        </>
      )}
    </nav>
  );
}
