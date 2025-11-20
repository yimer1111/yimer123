import React, { useState } from 'react';
import { login } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const user = await login(username);
    if (user) {
      onLogin(user);
    } else {
      setError('Usuario no encontrado. Prueba con: admin, pharma, o viewer');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">PharmaControl Pro</h1>
          <p className="text-gray-500 text-sm mt-2">Sistema de Gestión Financiera Farmacéutica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin, pharma, viewer"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">Roles disponibles para demo:</p>
          <div className="flex justify-center gap-3 mt-2">
             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200" onClick={() => setUsername('admin')}>admin</span>
             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200" onClick={() => setUsername('pharma')}>pharma</span>
             <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer hover:bg-gray-200" onClick={() => setUsername('viewer')}>viewer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;