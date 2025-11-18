import { useState, useEffect } from "react";
import { login, getUserProfile } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya hay token guardado, redirigir
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Completa todos los campos ⚠️");
      return;
    }

    setLoading(true);
    try {
      const res = await login(form);

      // Guardar token y user_id
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_id", res.data.user_id);

      // 🔥 Obtener perfil del usuario (nombre)
      const profile = await getUserProfile(res.data.user_id, res.data.access_token);

      localStorage.setItem("user_name", profile.data.name);

      toast.success(`Bienvenido ${profile.data.name} 👋`);
      navigate("/dashboard");

    } catch (err) {
      toast.error("Email o contraseña incorrecta ❌");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
