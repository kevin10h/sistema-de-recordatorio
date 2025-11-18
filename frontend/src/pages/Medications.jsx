import { useState, useEffect } from "react";
import { addMedication, getMedications } from "../api";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function Medications() {
  const [form, setForm] = useState({
    name: "",
    dose: "",
    instructions: "",
    frequency: "",   // solo "daily" | "weekly" | "interval"
  });

  const [meds, setMeds] = useState([]);
  const navigate = useNavigate();

  // ======================
  // CARGAR MEDICAMENTOS
  // ======================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwt_decode(token);
      fetchMeds(decoded.sub, token);
    } catch (err) {
      navigate("/login");
    }
  }, []);

  const fetchMeds = async (userId, token) => {
    try {
      const res = await getMedications(userId, token);
      setMeds(res.data);
    } catch (err) {
      console.error("Error al obtener medicamentos");
    }
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const decoded = jwt_decode(token);

      const payload = {
        ...form,
        user_id: decoded.sub,
        frequency: form.frequency,  // AHORA ES SIMPLE, SIN JSON
      };

      const res = await addMedication(payload, token);
      setMeds((prev) => [...prev, res.data]);

      // reset
      setForm({ name: "", dose: "", instructions: "", frequency: "" });

    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el medicamento");
    }
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="p-4">

      <h2 className="text-xl font-bold mb-3">Mis Medicamentos</h2>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">

        <input
          placeholder="Nombre"
          className="border p-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Dosis"
          className="border p-2 w-full rounded"
          value={form.dose}
          onChange={(e) => setForm({ ...form, dose: e.target.value })}
          required
        />

        <input
          placeholder="Instrucciones (opcional)"
          className="border p-2 w-full rounded"
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        />

        {/* SELECTOR SIMPLE */}
        <select
          className="border p-2 w-full rounded"
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          required
        >
          <option value="">Selecciona frecuencia…</option>
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="interval">Cada X horas</option>
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Agregar medicamento
        </button>
      </form>

      {/* LISTA DE MEDS */}
      <ul className="mt-4 space-y-2">
        {meds.map((m) => (
          <li key={m.id} className="p-3 bg-white rounded shadow">
            <strong>{m.name}</strong> – {m.dose} <br />
            {m.instructions && <small>📌 {m.instructions}</small>} <br />

            <span className="text-sm text-purple-700 font-semibold">
              Frecuencia: {
                m.frequency === "daily"
                  ? "Diario"
                  : m.frequency === "weekly"
                  ? "Semanal"
                  : "Cada X horas"
              }
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
