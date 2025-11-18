import { useEffect, useState } from "react";
import { getUserProfile, getMedications, getReminders } from "../api";
import jwt_decode from "jwt-decode";

import { Bar, Pie } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import "chart.js/auto";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ===========================
  // CARGA DE DATOS
  // ===========================
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwt_decode(token);
      const userId = decoded.sub;

      try {
        const userRes = await getUserProfile(userId, token);
        setUser(userRes.data);

        const medRes = await getMedications(userId, token);
        setMedications(medRes.data);

        const remRes = await getReminders(userId, token);
        setReminders(remRes.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      }
    };

    loadData();
  }, []);

  // ===========================
  // PARSEADOR DE SCHEDULE
  // ===========================
  const parseSchedule = (raw) => {
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (_) {
        console.warn("⚠ Schedule inválido:", raw);
        return null;
      }
    }

    return {
      type: raw.type || null,
      times: Array.isArray(raw.times) ? raw.times : [],
      days: Array.isArray(raw.days) ? raw.days : [],
      interval: raw.interval || null,
    };
  };

  // =================================================
  // 1️⃣ Frecuencia por medicación (BARRA)
  // =================================================
  const getMedicationFrequency = () => {
    const freqMap = {};

    reminders.forEach((r) => {
      const schedule = parseSchedule(r.schedule);
      if (!schedule) return;

      const med = medications.find((m) => m.id === r.medication_id);
      if (!med) return;

      if (!freqMap[med.name]) freqMap[med.name] = 0;

      if (schedule.type === "daily") {
        freqMap[med.name] += schedule.times.length;
      } else if (schedule.type === "weekly") {
        freqMap[med.name] += schedule.times.length;
      } else if (schedule.type === "interval") {
        freqMap[med.name] += 1;
      }
    });

    return {
      labels: Object.keys(freqMap),
      datasets: [{ label: "Frecuencia", data: Object.values(freqMap) }],
    };
  };

  // =================================================
  // 2️⃣ Recordatorios por día de la semana
  // =================================================
  const getRemindersByDay = () => {
    const days = { Lun: 0, Mar: 0, Mie: 0, Jue: 0, Vie: 0, Sab: 0, Dom: 0 };

    const mapDays = {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mie",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sab",
      sunday: "Dom",
    };

    reminders.forEach((r) => {
      const schedule = parseSchedule(r.schedule);
      if (!schedule) return;

      if (schedule.type === "weekly") {
        schedule.days.forEach((d) => {
          const key = mapDays[d.toLowerCase()];
          if (key) days[key]++;
        });
      }

      if (schedule.type === "daily") {
        Object.keys(days).forEach((k) => (days[k] += schedule.times.length));
      }
    });

    return {
      labels: Object.keys(days),
      datasets: [{ label: "Recordatorios", data: Object.values(days) }],
    };
  };

  // =================================================
  // 3️⃣ Top medicinas más recordadas (TORTA)
  // =================================================
  const getTopMedications = () => {
    const countMap = {};

    reminders.forEach((r) => {
      const med = medications.find((m) => m.id === r.medication_id);
      if (!med) return;

      const schedule = parseSchedule(r.schedule);
      if (!schedule) return;

      if (!countMap[med.name]) countMap[med.name] = 0;

      if (schedule.type === "daily") {
        countMap[med.name] += schedule.times.length;
      } else if (schedule.type === "weekly") {
        countMap[med.name] += schedule.times.length;
      } else if (schedule.type === "interval") {
        countMap[med.name] += 1;
      }
    });

    return {
      labels: Object.keys(countMap),
      datasets: [{ data: Object.values(countMap) }],
    };
  };

  // =================================================
  // 4️⃣ Eventos en el calendario
  // =================================================
  const getEventsForDate = (date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    return reminders.filter((r) => {
      const schedule = parseSchedule(r.schedule);
      if (!schedule) return false;

      if (schedule.type === "daily") return true;

      if (schedule.type === "weekly") {
        return schedule.days?.includes(dayName);
      }

      return false;
    });
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded-xl">
          <h2 className="text-lg font-bold">Medicaciones</h2>
          <p className="text-3xl">{medications.length}</p>
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          <h2 className="text-lg font-bold">Recordatorios</h2>
          <p className="text-3xl">{reminders.length}</p>
        </div>

        <div className="bg-white shadow p-4 rounded-xl">
          <h2 className="text-lg font-bold">Usuario</h2>
          <p className="text-sm break-all">{user?.email}</p>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="font-bold text-xl mb-2">Calendario de Recordatorios</h2>

        <Calendar value={selectedDate} onChange={setSelectedDate} />

        <div className="mt-4">
          <h3 className="font-semibold text-lg">Recordatorios del día</h3>

          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">No hay recordatorios.</p>
          ) : (
            <ul className="space-y-2">
              {getEventsForDate(selectedDate).map((r, idx) => {
                const schedule = parseSchedule(r.schedule);
                const med = medications.find((m) => m.id === r.medication_id);

                return (
                  <li key={idx} className="bg-gray-100 p-2 rounded">
                    <strong>{med?.name}</strong> — {schedule.type}
                    <br />
                    🕒 {schedule.times.join(", ")}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="font-bold text-xl mb-2">Frecuencia por Medicación</h2>
        <Bar data={getMedicationFrequency()} />
      </div>

      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="font-bold text-xl mb-2">Recordatorios por Día de la Semana</h2>
        <Bar data={getRemindersByDay()} />
      </div>

      <div className="bg-white p-4 shadow rounded-xl">
        <h2 className="font-bold text-xl mb-2">Medicinas con más Recordatorios</h2>
        <Pie data={getTopMedications()} />
      </div>
    </div>
  );
}
