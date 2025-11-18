import { useState } from "react";
import { register } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) {
      toast.error("Completa todos los campos");
      return;
    }
    try {
      await register(form);
      toast.success("Usuario registrado con éxito ✅");
      navigate("/");
    } catch (err) {
      toast.error("Error al registrar ❌");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
