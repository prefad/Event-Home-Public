import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Star } from "lucide-react";
import Vector from "./Vector";
import Vector16 from "./Vector-16-985";
import { hotels as hotelData } from "./hotel-data";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hotelIds?: string[];
}

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

const StarRating = memo(function StarRating({ rating }: { rating: number }) {
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
});

const ChatHotelCard = memo(function ChatHotelCard({ hotelId }: { hotelId: string }) {
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
});

// Shared styles for typing dots / message bubbles
const TYPING_DOT_STYLE = { backgroundColor: 'var(--color-text-secondary)' } as const;
const BUBBLE_CONTAINER_STYLE = {
  backgroundColor: 'var(--color-chat-assistant-bg)',
} as const;
const USER_BUBBLE_STYLE = { backgroundColor: '#ffffff', color: '#000000' } as const;
const ASSISTANT_BUBBLE_STYLE = { ...BUBBLE_CONTAINER_STYLE, color: 'var(--color-chat-assistant-text)' } as const;

// Parse **bold** markdown into [text, isBold] tuples per line, only once per message content.
// Cached keyed on content string to avoid re-parsing identical strings.
const markdownCache = new Map<string, Array<Array<[string, boolean]>>>();
function parseMarkdown(content: string): Array<Array<[string, boolean]>> {
  const hit = markdownCache.get(content);
  if (hit) return hit;
  const lines = content.split("\n").map((line) =>
    line.split(/(\*\*.*?\*\*)/).map(
      (part) =>
        [part.startsWith("**") && part.endsWith("**") ? part.slice(2, -2) : part, part.startsWith("**") && part.endsWith("**")] as [string, boolean]
    )
  );
  markdownCache.set(content, lines);
  return lines;
}

function TypingDots() {
  return (
    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1" style={BUBBLE_CONTAINER_STYLE}>
      <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={TYPING_DOT_STYLE} />
      <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={TYPING_DOT_STYLE} />
      <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={TYPING_DOT_STYLE} />
    </div>
  );
}

function MessageBubble({ msg, maxW }: { msg: Message; maxW: string }) {
  const isUser = msg.role === "user";
  const lines = useMemo(() => parseMarkdown(msg.content), [msg.content]);
  return (
    <div className={`${maxW} space-y-2`}>
      <div
        className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm shadow-sm"
        }`}
        style={isUser ? USER_BUBBLE_STYLE : ASSISTANT_BUBBLE_STYLE}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line.map(([text, isBold], j) =>
              isBold ? (
                <strong
                  key={j}
                  style={{ color: isUser ? '#000000' : 'var(--color-text-heading)' }}
                >
                  {text}
                </strong>
              ) : (
                <span key={j}>{text}</span>
              )
            )}
            {i < lines.length - 1 && <br />}
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
}

export function AiChat({
  variant = "default",
  overlayOpen,
  onOverlayChange,
  messages: messagesProp,
  onMessagesChange,
  inputValue: inputValueProp,
  onInputValueChange,
  isTyping: isTypingProp,
  onIsTypingChange,
}: {
  variant?: "default" | "mobile-float";
  overlayOpen?: boolean;
  onOverlayChange?: (open: boolean) => void;
  messages?: Message[];
  onMessagesChange?: React.Dispatch<React.SetStateAction<Message[]>>;
  inputValue?: string;
  onInputValueChange?: React.Dispatch<React.SetStateAction<string>>;
  isTyping?: boolean;
  onIsTypingChange?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [_isOverlayOpen, _setIsOverlayOpen] = useState(false);
  const isOverlayOpen = overlayOpen !== undefined ? overlayOpen : _isOverlayOpen;
  const setIsOverlayOpen = useCallback(
    (open: boolean) => {
      onOverlayChange?.(open);
      _setIsOverlayOpen(open);
    },
    [onOverlayChange]
  );
  // Controlled/uncontrolled: parent can lift state so it survives remounts between
  // the bottom-bar and full-overlay positions.
  const [_messages, _setMessages] = useState<Message[]>([]);
  const [_inputValue, _setInputValue] = useState("");
  const [_isTyping, _setIsTyping] = useState(false);
  const messages = messagesProp ?? _messages;
  const setMessages = onMessagesChange ?? _setMessages;
  const inputValue = inputValueProp ?? _inputValue;
  const setInputValue = onInputValueChange ?? _setInputValue;
  const isTyping = isTypingProp ?? _isTyping;
  const setIsTyping = onIsTypingChange ?? _setIsTyping;
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const overlayMessagesEndRef = useRef<HTMLDivElement>(null);

  // Focus input + scroll to bottom after overlay opens
  useEffect(() => {
    if (!isOverlayOpen) return;
    const t = setTimeout(() => {
      overlayMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      overlayInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, [isOverlayOpen]);

  // Auto-scroll on new messages while overlay is open
  useEffect(() => {
    if (isOverlayOpen) {
      overlayMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOverlayOpen]);

  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content) return;

    // Always open the overlay when send is clicked
    setIsOverlayOpen(true);

    const now = Date.now();
    const userMsg: Message = {
      id: now.toString(),
      role: "user",
      content,
      timestamp: new Date(now),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(content);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.text,
          timestamp: new Date(),
          hotelIds: response.hotelIds,
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }, [inputValue, setIsOverlayOpen, setMessages, setInputValue, setIsTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    []
  );

  const handleCloseOverlay = useCallback(() => setIsOverlayOpen(false), [setIsOverlayOpen]);

  const allOverlayMessages = useMemo(
    () => [...PREFILLED_MESSAGES, ...messages],
    [messages]
  );

  const hasInput = inputValue.trim().length > 0;

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
                  <MessageBubble msg={msg} maxW="max-w-[85%]" />
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                    <Vector16 />
                  </div>
                  <TypingDots />
                </div>
              )}
              <div ref={overlayMessagesEndRef} />
            </div>

            {/* Overlay input bar */}
            <div className="px-4 py-3 shrink-0 space-y-2.5" style={{ backgroundColor: 'var(--color-page-bg)' }}>
              <div className="flex items-center gap-2 rounded-[10px] pl-2.5 pr-2.5 py-2 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}>
                <input
                  ref={overlayInputRef}
                  type="text"
                  placeholder="Ask Booking Assistant anything..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base placeholder-gray-500 outline-none min-w-0"
                  style={{ color: 'var(--color-text-heading)' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!hasInput}
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: hasInput ? 'var(--color-action)' : 'var(--color-chip-bg)', color: hasInput ? 'var(--color-action-text)' : 'var(--color-text-secondary)' }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
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
              {/* Chat content card — mt-0 so top edge is flush with map's top */}
              <div className="border rounded-[16px] flex flex-col flex-1 overflow-hidden mx-4 mb-0 min-h-0" style={{ borderColor: 'var(--color-divider)' }}>
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
                    onClick={handleCloseOverlay}
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
                      <MessageBubble msg={msg} maxW="max-w-[80%]" />
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 shrink-0 mr-2 mt-0.5 text-brand">
                        <Vector16 />
                      </div>
                      <TypingDots />
                    </div>
                  )}
                  <div ref={overlayMessagesEndRef} />
                </div>
              </div>

              {/* Overlay input bar — pb-0 so the input sits flush with the map's bottom edge */}
              <div className="px-4 pt-3 shrink-0 space-y-2.5" style={{ backgroundColor: 'var(--color-page-bg)' }}>
                <div className="flex items-center gap-2 rounded-[10px] pl-2.5 pr-2.5 py-2 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}>
                  <button
                    onClick={handleCloseOverlay}
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
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-base placeholder-gray-500 outline-none min-w-0"
                    style={{ color: 'var(--color-text-heading)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!hasInput}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: hasInput ? 'var(--color-action)' : 'var(--color-chip-bg)', color: hasInput ? 'var(--color-action-text)' : 'var(--color-text-secondary)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Bottom bar — hidden on desktop when overlay is open (overlay has its own input) */}
      {!(variant === "default" && isOverlayOpen) && (
        <div
          className={`shrink-0 flex flex-col ${
            variant === "mobile-float"
              ? "fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-[12px] overflow-hidden"
              : ""
          }`}
          style={variant === "mobile-float" ? { backgroundColor: 'var(--color-page-bg)' } : undefined}
        >
          <div className="flex items-center gap-2 rounded-[10px] pl-2.5 pr-2.5 py-2 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--color-input-border)' }}>
            <button
              onClick={handleCloseOverlay}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <div className="w-5 h-[22px]">
                <Vector />
              </div>
            </button>
            <input
              type="text"
              placeholder="Ask Booking Assistant anything..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-base placeholder-gray-500 outline-none min-w-0"
              style={{ color: 'var(--color-text-heading)' }}
            />
            <button
              onClick={handleSend}
              disabled={!hasInput}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: hasInput ? 'var(--color-action)' : 'var(--color-chip-bg)', color: hasInput ? 'var(--color-action-text)' : 'var(--color-text-secondary)' }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}