import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { Property } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  properties: Property[];
  brandGreenColor: string;
}

export function Chatbot({ properties, brandGreenColor }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Bienvenido a **HAVN**. 🏠✨ Soy **Dave**, tu asesor virtual. ¿En qué puedo ayudarte hoy?\n\nPuedes preguntarme por nuestro inventario, zonas disponibles, o cómo te ayudamos con el financiamiento de tu próxima propiedad.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "¿Qué propiedades tienen disponibles?",
    "¿Cómo funciona HAVN Capital?",
    "¿Qué es HAVN Crédito?",
    "¿Cuáles son las zonas de cobertura?",
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = typeof window !== "undefined" && window.location ? window.location.origin : "";
      const fetchUrl = `${baseUrl}/api/chat`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            properties: (properties || []).map((p) => ({
              title: p.title,
              price: p.price,
              location: p.location,
              bedrooms: p.beds,
              bathrooms: p.baths,
              area: p.sqm,
              tag: p.tag,
            })),
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo obtener respuesta del servidor.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Ocurrió un error al enviar el mensaje.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl text-white cursor-pointer relative group border border-white/10"
        style={{ backgroundColor: brandGreenColor }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              {/* Pulsing indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed md:absolute bottom-24 md:bottom-16 right-4 md:right-0 w-[calc(100vw-2rem)] md:w-[400px] h-[500px] md:h-[550px] max-h-[75vh] md:max-h-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${brandGreenColor}20` }}
                >
                  <Bot className="w-5 h-5" style={{ color: brandGreenColor }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    Dave
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <span className="text-[11px] text-slate-400">Asesor de Propiedades & Financiero</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg, index) => {
                const isBot = msg.role === "assistant";
                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        isBot
                          ? "bg-slate-800/80 text-slate-100 border border-slate-700/50"
                          : "text-white"
                      }`}
                      style={{
                        backgroundColor: isBot ? undefined : brandGreenColor,
                      }}
                    >
                      {/* Very basic Markdown parser for bolding and emojis */}
                      {msg.content.split("\n").map((paragraph, pIdx) => {
                        // Replace **bold text** with bold tag
                        const parts = paragraph.split(/\*\*([^*]+)\*\*/g);
                        return (
                          <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                            {parts.map((part, partIdx) =>
                              partIdx % 2 === 1 ? (
                                <strong key={partIdx} className="font-extrabold text-white">
                                  {part}
                                </strong>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-800/80 rounded-2xl px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 text-red-300 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Error de Conexión</p>
                    <p className="mt-0.5 text-[11px] text-red-400/90">{error}</p>
                    <button
                      onClick={() => handleSend(messages[messages.length - 1]?.content || "")}
                      className="mt-2 text-[10px] underline hover:text-white"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions suggestion chip layout */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 pt-1 border-t border-slate-800/40 bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Preguntas Sugeridas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full border border-slate-700/55 transition-all text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje aquí..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-700 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                style={{ backgroundColor: brandGreenColor }}
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
