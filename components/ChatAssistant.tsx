import React, { useState, useRef, useEffect } from 'react';
import { askRegulatoryAssistant } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([
    { role: 'ai', text: "Hola. Soy tu asistente regulatorio. Pregúntame sobre resoluciones del INVIMA, precios controlados o normatividad vigente." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await askRegulatoryAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "No encontré información.", sources: response.sources }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Lo siento, hubo un error al consultar la regulación." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Asistente Regulatorio (Conectado a Google Search)
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              <p>{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-xs font-semibold opacity-70 mb-1">Fuentes encontradas:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {m.sources.map((chunk, idx) => (
                      <li key={idx} className="text-xs truncate max-w-[200px]">
                        <a href={chunk.web?.uri} target="_blank" rel="noreferrer" className="underline hover:text-blue-400">
                          {chunk.web?.title || 'Fuente Web'}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ej: ¿Cuál es el margen máximo para medicamentos del Fondo Nacional?"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;