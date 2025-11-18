import { useState, useEffect } from "react";
import { addReminder, getMedications } from "../api";

export default function Reminders() {
  const [form, setForm] = useState({
    medication_id: "",
    schedule: {
      type: "daily",
      times: ["08:00"],
      days: [],
      interval: 6
    }
  });

  const [meds, setMeds] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [customInterval, setCustomInterval] = useState("");

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");
        const res = await getMedications(userId, token);
        setMeds(res.data);
      } catch (err) {
        console.error("Error cargando medicamentos:", err);
      }
    };
    load();
  }, []);

  // =============================
  // SELECCIONAR MEDICAMENTO
  // =============================
  const handleMedicationChange = (id) => {
    setForm({ ...form, medication_id: id });

    const med = meds.find((m) => m.id === id);
    setSelectedMed(med || null);

    if (!med) return;

    if (med.frequency === "daily") {
      setForm({
        medication_id: id,
        schedule: { type: "daily", times: ["08:00"], days: [], interval: null }
      });
    }

    if (med.frequency === "weekly") {
      setForm({
        medication_id: id,
        schedule: { type: "weekly", times: ["08:00"], days: [], interval: null }
      });
    }

    if (med.frequency === "interval") {
      setForm({
        medication_id: id,
        schedule: { type: "interval", times: [], days: [], interval: 6 }
      });
    }
  };

  const DAYS = [
    ["monday", "Lunes"],
    ["tuesday", "Martes"],
    ["wednesday", "Miércoles"],
    ["thursday", "Jueves"],
    ["friday", "Viernes"],
    ["saturday", "Sábado"],
    ["sunday", "Domingo"]
  ];

  const translateFrequency = (freq) => {
    if (freq === "daily") return "Diario";
    if (freq === "weekly") return "Semanal";
    if (freq === "interval") return "Cada X horas";
    return freq;
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    let intervalValue =
      form.schedule.interval === "custom" ? Number(customInterval) : form.schedule.interval;

    const scheduleToSend = {
      type: form.schedule.type,
      times: form.schedule.type === "interval" ? [] : [...form.schedule.times],
      days: form.schedule.type === "weekly" ? [...form.schedule.days] : [],
      interval: form.schedule.type === "interval" ? intervalValue : null
    };

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      await addReminder(
        {
          user_id: userId,
          medication_id: form.medication_id,
          timezone: userTimezone,
          start_date: new Date().toISOString(),
          schedule: scheduleToSend
        },
        token
      );

      alert("Recordatorio creado con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al crear recordatorio");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded-xl shadow-md max-w-lg"
    >
      {/* MEDICAMENTO */}
      <div>
        <label className="font-semibold">Medicamento</label>
        <select
          className="border px-2 py-1 w-full rounded-md"
          value={form.medication_id}
          onChange={(e) => handleMedicationChange(e.target.value)}
        >
          <option value="">-- Selecciona un medicamento --</option>
          {meds.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.dose})
            </option>
          ))}
        </select>
      </div>

      {/* TARJETA */}
      {selectedMed && (
        <div className="p-3 bg-purple-50 border rounded-md">
          <h3 className="font-semibold text-purple-700">💊 {selectedMed.name}</h3>
          <p>Dosis: {selectedMed.dose}</p>
          <p>🕒 Frecuencia: {translateFrequency(selectedMed.frequency)}</p>
          {selectedMed.instructions && (
            <p>📌 Instrucciones: {selectedMed.instructions}</p>
          )}
        </div>
      )}

      {/* DAILY */}
      {form.schedule.type === "daily" && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <label className="font-semibold">Hora</label>
          <input
            type="time"
            value={form.schedule.times[0]}
            onChange={(e) =>
              setForm({ ...form, schedule: { ...form.schedule, times: [e.target.value] } })
            }
            className="border px-2 py-1 rounded-md w-full"
          />
        </div>
      )}

      {/* WEEKLY */}
      {form.schedule.type === "weekly" && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <label className="font-semibold">Días</label>
          <div className="grid grid-cols-3 gap-2">
            {DAYS.map(([id, label]) => (
              <label key={id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.schedule.days.includes(id)}
                  onChange={() =>
                    setForm({
                      ...form,
                      schedule: {
                        ...form.schedule,
                        days: form.schedule.days.includes(id)
                          ? form.schedule.days.filter((d) => d !== id)
                          : [...form.schedule.days, id]
                      }
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <label className="font-semibold">Hora</label>
          <input
            type="time"
            value={form.schedule.times[0]}
            onChange={(e) =>
              setForm({ ...form, schedule: { ...form.schedule, times: [e.target.value] } })
            }
            className="border px-2 py-1 rounded-md w-full"
          />
        </div>
      )}

      {/* INTERVAL */}
      {form.schedule.type === "interval" && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <label className="font-semibold">Cada cuántas horas</label>

          <select
            className="border px-2 py-1 w-full rounded-md"
            value={form.schedule.interval}
            onChange={(e) =>
              setForm({
                ...form,
                schedule: { ...form.schedule, interval: e.target.value }
              })
            }
          >
            <option value="4">Cada 4 horas</option>
            <option value="6">Cada 6 horas</option>
            <option value="8">Cada 8 horas</option>
            <option value="12">Cada 12 horas</option>
            <option value="24">Cada 24 horas</option>
            <option value="custom">Personalizado...</option>
          </select>

          {form.schedule.interval === "custom" && (
            <input
              type="number"
              min="1"
              className="border px-2 py-1 w-full rounded-md"
              placeholder="Ingresa las horas"
              value={customInterval}
              onChange={(e) => setCustomInterval(e.target.value)}
            />
          )}
        </div>
      )}

      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full">
        Crear recordatorio
      </button>
    </form>
  );
}
