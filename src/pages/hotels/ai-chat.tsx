import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Send,
  X,
  Sparkles,
  Hotel,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import Vector from "./Vector";
import Vector16 from "./Vector-16-985";
const ecLogo = "";
import { hotels as hotelData } from "./hotel-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hotelIds?: string[];
}

const SUGGESTIONS = [
  { icon: Hotel, label: "Hotels with pools under $200" },
  { icon: MapPin, label: "Closest hotels to the venue" },
  { icon: DollarSign, label: "Best value for my group" },
];

const MOCK_RESPONSES: Record<string, { text: string; hotelIds?: string[] }> = {
  default: {
    text: "I can help you find the perfect hotel for the Champions Tournament! I have access to all 8 hotels with group rates. Try asking me about pricing, amenities, proximity to the venue, or recommendations for your group size.",
  },
  pool: {
    text: "Great news! The Hilton Garden Inn ($189/night) and Best Western Plus ($142/night) both have pools. The Hilton Garden Inn also includes breakfast and is just 1.2 mi from the venue — it's a solid pick if pool access matters to your group.",
    hotelIds: ["4", "2"],
  },
  closest: {
    text: "The closest hotels to the venue are:\n\n1. **Holiday Inn Express** — 0.8 mi (3 min drive), $168/night\n2. **Hilton Garden Inn** — 1.2 mi (5 min drive), $189/night\n3. **Best Western Plus** — 1.5 mi (6 min drive), $142/night\n\nThe Holiday Inn Express is the top pick for proximity, plus it includes breakfast and WiFi.",
    hotelIds: ["1", "4", "2"],
  },
  value: {
    text: "For the best group value, I'd recommend **Best Western Plus** at $142/night — it has WiFi, parking, and a pool. If you want something a step up, **Comfort Inn & Suites** at $128/night is the most affordable with breakfast included. Both have plenty of availability for groups.",
    hotelIds: ["2", "6"],
  },
  cheap: {
    text: "The most affordable options are:\n\n1. **Comfort Inn & Suites** — $128/night (breakfast, WiFi)\n2. **Best Western Plus** — $142/night (WiFi, parking, pool)\n3. **Hampton Inn** — $155/night (breakfast, WiFi, parking)\n\nAll three have group rates locked in for the tournament dates.",
    hotelIds: ["6", "2", "7"],
  },
};

const PREFILLED_MESSAGES: Message[] = [
  {
    id: "pre-1",
    role: "user",
    content: "Hi! I need a hotel for the Champions Tournament. What do you recommend?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "pre-2",
    role: "assistant",
    content: "Welcome! I'd be happy to help you find the perfect hotel for the Champions Tournament 2025. Based on group rates and proximity to the venue, here are my top picks:",
    hotelIds: ["3", "1", "2"],
    timestamp: new Date(Date.now() - 280000),
  },
  {
    id: "pre-3",
    role: "user",
    content: "The Lambton Inn looks great! Does it include breakfast?",
    timestamp: new Date(Date.now() - 200000),
  },
  {
    id: "pre-4",
    role: "assistant",
    content: "Yes! The **Lambton Inn on the River** includes complimentary breakfast, free WiFi, and parking — all included in the $140/night group rate. As the Host Hotel, it also offers a dedicated check-in area for tournament guests and a 10% discount at their on-site restaurant.",
    hotelIds: ["3"],
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "pre-5",
    role: "user",
    content: "What about late checkout? We might need it on the last day.",
    timestamp: new Date(Date.now() - 100000),
  },
  {
    id: "pre-6",
    role: "assistant",
    content: "Great question! The Lambton Inn offers **late checkout until 1 PM** for tournament guests at no extra charge (subject to availability). I'd recommend requesting it at check-in to secure it. Would you like me to help you compare room types or check availability for your dates?",
    hotelIds: ["3"],
    timestamp: new Date(Date.now() - 80000),
  },
];

function getResponse(input: string): { text: string; hotelIds?: string[] } {
  const lower = input.toLowerCase();
  if (lower.includes("pool") || lower.includes("swim"))
    return MOCK_RESPONSES.pool;
  if (
    lower.includes("close") ||
    lower.includes("near") ||
    lower.includes("proximity") ||
    lower.includes("distance")
  )
    return MOCK_RESPONSES.closest;
  if (lower.includes("value") || lower.includes("group") || lower.includes("team"))
    return MOCK_RESPONSES.value;
  if (
    lower.includes("cheap") ||
    lower.includes("affordable") ||
    lower.includes("budget") ||
    lower.includes("price") ||
    lower.includes("cost")
  )
    return MOCK_RESPONSES.cheap;
  return MOCK_RESPONSES.default;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`f${i}`} className="w-3 h-3 fill-amber-400 text-amber-400" />
      ))}
      {halfStar && (
        <div className="relative w-3 h-3">
          <Star className="w-3 h-3 text-gray-200 absolute" />
          <div className="overflow-hidden w-1.5 absolute">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} className="w-3 h-3 text-gray-200" />
      ))}
    </div>
  );
}

function ChatHotelCard({ hotelId }: { hotelId: string }) {
  const hotel = hotelData.find((h) => h.id === hotelId);
  if (!hotel) return null;
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-[8px] hover:shadow-sm transition-all cursor-pointer group" style={{ backgroundColor: 'var(--color-icon-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-divider)' }}>
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-14 h-14 rounded-[6px] object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] truncate" style={{ color: 'var(--color-text-heading)' }}>{hotel.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StarRating rating={hotel.hotelRating} />
          <span className="text-[10px] text-green-600 bg-green-50 px-1 py-px rounded">{hotel.guestRating}</span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{hotel.distance} · {hotel.driveTime}</p>
      </div>
      <div className="text-right shrink-0 pr-1">
        <p className="text-[15px]" style={{ color: 'var(--color-text-heading)' }}>${hotel.price}</p>
        <p className="text-[9px]" style={{ color: 'var(--color-text-secondary)' }}>per night</p>
      </div>
    </div>
  );
}

export function AiChat({ variant = "default", overlayOpen, onOverlayChange }: { variant?: "default" | "mobile-float"; overlayOpen?: boolean; onOverlayChange?: (open: boolean) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [_isOverlayOpen, _setIsOverlayOpen] = useState(false);
  const isOverlayOpen = overlayOpen !== undefined ? overlayOpen : _isOverlayOpen;
  const setIsOverlayOpen = (open: boolean) => {
    if (onOverlayChange) onOverlayChange(open);
    _setIsOverlayOpen(open);
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const overlayMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOverlayOpen) {
      setTimeout(() => {
        overlayMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        overlayInputRef.current?.focus();
      }, 300);
    }
  }, [isOverlayOpen]);

  useEffect(() => {
    if (isOverlayOpen) {
      overlayMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOverlayOpen]);

  // Auto-send removed — suggestion pills now show hotel strip instead of chat

  const handleSend = (text?: string) => {
    const content = text || inputValue.trim();
    if (!content) return;

    // Open the overlay when a message is sent from the bottom bar
    if (!isOverlayOpen) {
      setIsOverlayOpen(true);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getResponse(content).text,
        timestamp: new Date(),
        hotelIds: getResponse(content).hotelIds,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (label: string) => {
    if (!isExpanded) setIsExpanded(true);
    setTimeout(() => handleSend(label), 100);
  };

  const allOverlayMessages = [...PREFILLED_MESSAGES, ...messages];

  const renderMessageContent = (msg: Message, maxW: string = "max-w-[85%]") => (
    <div className={`${maxW} space-y-2`}>
      <div
        className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
          msg.role === "user"
            ? "rounded-br-sm"
            : "rounded-bl-sm shadow-sm"
        }`}
        style={
          msg.role === "user"
            ? { backgroundColor: 'var(--color-chat-user-bg)', color: 'var(--color-chat-user-text)' }
            : { backgroundColor: 'var(--color-chat-assistant-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chat-assistant-border)', color: 'var(--color-chat-assistant-text)' }
        }
      >
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>
            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} style={{ color: msg.role === "user" ? 'var(--color-chat-user-text)' : 'var(--color-text-heading)' }}>
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
            {i < msg.content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
      {msg.hotelIds && msg.hotelIds.length > 0 && (
        <div className="space-y-1.5">
          {msg.hotelIds.map((hId) => (
            <ChatHotelCard key={hId} hotelId={hId} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile full-screen overlay chat */}
      <AnimatePresence>
        {isOverlayOpen && variant === "mobile-float" && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-[60] flex flex-col"
            style={{ top: "var(--header-height, 120px)", backgroundColor: 'var(--color-page-bg)' }}
          >
            {/* Overlay header - mobile */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-divider)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 shrink-0 text-brand">
                  <Vector16 />
                </div>
                <div>
                  <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>Booking Assistant</span>
                  <span className="text-[9px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full ml-2">AI</span>
                </div>
              </div>
              <button
                onClick={() => setIsOverlayOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              {allOverlayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                      <Vector16 />
                    </div>
                  )}
                  {renderMessageContent(msg)}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                    <Vector16 />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1" style={{ backgroundColor: 'var(--color-chat-assistant-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chat-assistant-border)' }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                  </div>
                </div>
              )}
              <div ref={overlayMessagesEndRef} />
            </div>

            {/* Overlay input bar */}
            <div className="px-4 py-3 shrink-0 space-y-2.5" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              <div className="flex items-center gap-2 rounded-2xl pl-3 pr-2.5 py-3 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}>
                <input
                  ref={overlayInputRef}
                  type="text"
                  placeholder="Ask Booking Assistant anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base placeholder-gray-400 outline-none min-w-0"
                  style={{ color: 'var(--color-text-heading)' }}
                />
                {inputValue.trim() ? (
                  <button
                    onClick={() => handleSend()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                    style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                    style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop overlay chat — renders as flow element, fills parent when open */}
      {variant === "default" && (
        <AnimatePresence>
          {isOverlayOpen && (
            <motion.div
              key="desktop-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              style={{ backgroundColor: 'var(--color-page-bg)' }}
            >
              {/* Chat content card */}
              <div className="border rounded-[16px] flex flex-col flex-1 overflow-hidden mx-4 mt-1.5 mb-2 min-h-0" style={{ borderColor: 'var(--color-divider)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 shrink-0 text-brand">
                      <Vector16 />
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: 'var(--color-text-heading)' }}>Booking Assistant</span>
                      <span className="text-[9px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full ml-2">AI</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOverlayOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-hide" style={{ backgroundColor: 'var(--color-page-bg)' }}>
                  {allOverlayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                          <Vector16 />
                        </div>
                      )}
                      {renderMessageContent(msg, "max-w-[80%]")}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                        <Vector16 />
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1" style={{ backgroundColor: 'var(--color-chat-assistant-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chat-assistant-border)' }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                      </div>
                    </div>
                  )}
                  <div ref={overlayMessagesEndRef} />
                </div>
              </div>

              {/* Overlay input bar */}
              <div className="px-4 py-3 shrink-0 space-y-2.5" style={{ backgroundColor: 'var(--color-page-bg)' }}>
                <div className="flex items-center gap-2 rounded-2xl pl-2.5 pr-2.5 py-3 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}>
                  <button
                    onClick={() => setIsOverlayOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <div className="w-5 h-[22px]">
                      <Vector />
                    </div>
                  </button>
                  <input
                    ref={overlayInputRef}
                    type="text"
                    placeholder="Ask Booking Assistant anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-base placeholder-gray-400 outline-none min-w-0"
                    style={{ color: 'var(--color-text-heading)' }}
                  />
                  {inputValue.trim() ? (
                    <button
                      onClick={() => handleSend()}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                    style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                      style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Bottom bar — hidden on desktop when overlay is open (overlay has its own input) */}
      {!(variant === "default" && isOverlayOpen) && (
      <div className={`shrink-0 flex flex-col ${
        variant === "mobile-float"
          ? "fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-[12px] overflow-hidden"
          : ""
      }`} style={variant === "mobile-float" ? { backgroundColor: 'var(--color-page-bg)' } : undefined}>
        {/* Expanded chat panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 320, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 shrink-0 text-brand">
                      <Vector16 />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      Chat with Booking Assistant
                    </span>
                    <span className="text-[9px] text-brand bg-brand-light px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-[6px] transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide" style={{ backgroundColor: 'var(--color-page-bg)' }}>
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                      <div className="w-10 h-10 shrink-0 text-brand">
                        <Vector16 />
                      </div>
                      <p className="text-xs text-center max-w-[260px]" style={{ color: 'var(--color-text-secondary)' }}>
                        Ask me anything about hotels, rates, or recommendations for your group.
                      </p>
                      <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s.label}
                            onClick={() => handleSuggestion(s.label)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] transition-colors"
                            style={{ backgroundColor: 'var(--color-chip-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chip-border)', color: 'var(--color-chip-text)' }}
                          >
                            <s.icon className="w-3 h-3" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-5 h-5 shrink-0 mr-2 mt-0.5 text-brand">
                          <Vector16 />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-br-sm"
                            : "rounded-bl-sm shadow-sm"
                        }`}
                        style={
                          msg.role === "user"
                            ? { backgroundColor: 'var(--color-chat-user-bg)', color: 'var(--color-chat-user-text)' }
                            : { backgroundColor: 'var(--color-chat-assistant-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chat-assistant-border)', color: 'var(--color-chat-assistant-text)' }
                        }
                      >
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                              part.startsWith("**") && part.endsWith("**") ? (
                                <strong key={j} style={{ color: msg.role === "user" ? 'var(--color-chat-user-text)' : 'var(--color-text-heading)' }}>
                                  {part.slice(2, -2)}
                                </strong>
                              ) : (
                                part
                              )
                            )}
                            {i < msg.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-5 h-5 shrink-0 mr-2 mt-0.5 text-brand">
                        <Vector16 />
                      </div>
                      <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1" style={{ backgroundColor: 'var(--color-chat-assistant-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-chat-assistant-border)' }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: 'var(--color-text-secondary)' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar — always visible */}
        <div className="px-0 pt-0 pb-0">
          <div className="flex items-center gap-2 rounded-xl pl-2.5 pr-2.5 py-3 transition-all" style={{ backgroundColor: 'var(--color-chip-bg)' }}>
            <button
              onClick={() => {
                if (isOverlayOpen) {
                  setIsOverlayOpen(false);
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isExpanded ? (
                <X className="w-5 h-5" />
              ) : (
                <div className="w-5 h-[22px]">
                  <Vector />
                </div>
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Booking Assistant anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-base placeholder-gray-400 outline-none min-w-0"
              style={{ color: 'var(--color-text-heading)' }}
            />
            {inputValue.trim() ? (
              <button
                onClick={() => handleSend()}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                    style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0"
                style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-action-text)' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </>
  );
}