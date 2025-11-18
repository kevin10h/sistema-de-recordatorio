import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-center">Bienvenido a PillReminder</h1>
        <div className="text-center">
          <p className="mb-4">Tu aplicación para gestionar tus medicamentos y recordatorios.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Iniciar sesión
          </Link>
          <p className="mt-4">¿No tienes cuenta? <Link to="/register" className="text-blue-500">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}
