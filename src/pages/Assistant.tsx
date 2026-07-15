import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/ai';
import type { ChatMessage } from '../api/ai';
import { Send, Sparkles, User, Bot, Mic, MicOff } from 'lucide-react';

const Assistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isBlinking, setIsBlinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Efecto de parpadeo (abrir y cerrar los ojos)
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true); // Ojos cerrados
      setTimeout(() => {
        setIsBlinking(false); // Ojos abiertos
      }, 150); // Cerrado por 150ms
    };

    // Parpadea cada 3.5 segundos
    const interval = setInterval(blink, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Permite pausar al hablar sin que se corte
      recognition.interimResults = false; 
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        setInput(fullTranscript.trim());
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efecto de parpadeo (abrir y cerrar los ojos)
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true); // Ojos cerrados
      setTimeout(() => {
        setIsBlinking(false); // Ojos abiertos
      }, 150); // Cerrado por 150ms
    };

    // Parpadea cada 3.5 segundos
    const interval = setInterval(blink, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI
    const newUserMsg: ChatMessage = { role: 'user', parts: [{ text: userMsg }] };
    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const responseText = await sendChatMessage(userMsg, messages);
      
      const modelMsg: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error('Error al comunicarse con la IA:', error);
      const errorMsg: ChatMessage = { role: 'model', parts: [{ text: 'Hubo un error al procesar tu solicitud. Asegúrate de tener tu GEMINI_API_KEY configurada.' }] };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent p-4 md:p-6 border-b border-primary/10 flex flex-col items-center justify-center relative flex-shrink-0">
        <div className="w-32 h-32 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-full overflow-hidden shadow-md border-4 border-white dark:border-gray-700 bg-white dark:bg-gray-800 mb-3 relative transition-transform hover:scale-105 duration-300 flex-shrink-0">
          <img 
            src={isBlinking ? "/Hoviuia1.png" : "/Hoviuia.png"} 
            alt="AI Avatar" 
            className="w-full h-full object-cover transition-opacity duration-75"
          />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
            Hovi <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tu Asistente Inteligente</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p>Escribe algo para empezar a organizar tu día.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}>
                {/* Parse basic markdown like bold or newlines if needed, for now just text */}
                <p className="whitespace-pre-wrap text-sm">{msg.parts[0].text}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Ej: ¿Qué tarea tengo para hoy? o Crear tarea..."}
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;
