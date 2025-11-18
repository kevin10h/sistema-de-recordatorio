import axios from "axios";

// =====================
// BASE URLs por servicio
// =====================
const API_AUTH = "http://127.0.0.1:8001";
const API_MED = "http://127.0.0.1:8002";
const API_REM = "http://127.0.0.1:8003";

// =====================
// AUTH
// =====================

// Registrar usuario
export async function register(user) {
  return axios.post(`${API_AUTH}/register`, user);
}

// Login
export async function login(user) {
  return axios.post(`${API_AUTH}/login`, user);
}

// Obtener perfil del usuario
// (Tu backend usa /users/{user_id})
export async function getUserProfile(user_id, token) {
  return axios.get(`${API_AUTH}/users/${user_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// =====================
// MEDICATIONS
// =====================

// Crear medicación
export async function addMedication(med, token) {
  return axios.post(`${API_MED}/medications`, med, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener medicaciones por usuario
export async function getMedications(userId, token) {
  return axios.get(`${API_MED}/medications/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// =====================
// REMINDERS
// =====================

// Crear recordatorio
export async function addReminder(reminder, token) {
  return axios.post(`${API_REM}/reminders`, reminder, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Obtener recordatorios por usuario
export async function getReminders(userId, token) {
  return axios.get(`${API_REM}/reminders/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
