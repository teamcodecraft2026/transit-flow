import { useState, useRef, useEffect, type ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { AuthModal } from "./AuthModal";
import { BackHome } from "./BackHome";
import { MessageCircle, X, Send, Bus } from "lucide-react";

type Props = {
  children: ReactNode;
  theme?: "rose" | "navy";
  floatingNav?: boolean;
  hideFooter?: boolean;
  backHome?: boolean;
};

export function PageShell({
  children,
  theme = "rose",
  floatingNav = true,
  hideFooter = false,
  backHome = false,
}: Props) {
  return (
    <div className="anim-fade relative min-h-screen bg-canvas">
      <NavBar theme={theme} floating={floatingNav} />
      {backHome ? (
        <div className="pointer-events-none absolute inset-x-0 top-[104px] z-30 sm:top-[112px]">
          <div className="mx-auto w-full max-w-[1240px] px-6">
            <BackHome className="pointer-events-auto" />
          </div>
        </div>
      ) : null}
      <main className="stagger-rise">{children}</main>
      {hideFooter ? null : <Footer />}
      <AuthModal />
      <Chatbot />
    </div>
  );
}

/*  Floating Chatbot  */

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SYSTEM_PROMPT = `You are SmartBus Assistant, a helpful AI for the SmartBus public transit app in West Bengal, India. You help passengers with: booking tickets, Pink Card eligibility (eligible if female with annual income below 1.5 lakh, verified via PAN), checking trip status, conductor scan process, and general transit queries. Be concise, friendly, and answer in the language the user writes in (English or Bengali). Do not make up bus schedules. Keep answers short  2-3 sentences max unless the user asks for detail.`;

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm SmartBus Assistant  Ask me anything about booking tickets, Pink Card eligibility, or your trips.",
};

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop pulse after first open
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  // // Scroll to bottom on new message
  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, loading]);

  // Scroll to bottom on new message  only inside chat panel, not page
useEffect(() => {
  if (!open) return;
  const el = bottomRef.current;
  if (!el) return;
  const panel = el.closest(".chat-scroll-area");
  if (panel) {
    panel.scrollTop = panel.scrollHeight;
  }
}, [messages, loading, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.text }));

     const res = await fetch("https://bus-aiml.onrender.com/chatbot", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
       message: text,
       eligibility_context: {
      eligible: null,
      reason_code: "GENERAL_QUERY",
      income: null,
      threshold: 250000,
    },
  }),
});

const data = await res.json();
const reply =
  data?.response ??
  "Sorry, I'm having trouble connecting. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed bottom-[88px] right-5 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-[20px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:right-6 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ backgroundColor: "rgba(8,10,20,0.97)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-rose-500/20">
            <Bus className="size-4 text-rose-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-sans text-[13px] font-semibold text-white">SmartBus Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-400" />
              <p className="font-sans text-[11px] text-white/40">Online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll-area flex h-[340px] flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                  <Bus className="size-3 text-rose-400" strokeWidth={1.5} />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-[14px] px-3.5 py-2.5 font-sans text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-[4px] bg-rose-500 text-white"
                    : "rounded-tl-[4px] border border-white/10 bg-white/[0.07] text-white/90"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start gap-2">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
                <Bus className="size-3 text-rose-400" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-1.5 rounded-[14px] rounded-tl-[4px] border border-white/10 bg-white/[0.07] px-4 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-[12px] border border-white/15 bg-white/[0.05] px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about SmartBus"
              className="flex-1 bg-transparent font-sans text-[13px] text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-rose-500 text-white transition-opacity disabled:opacity-40"
            >
              <Send className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(244,63,94,0.45)] transition-transform duration-200 hover:scale-110 active:scale-95 sm:right-6"
        style={{
          background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
          animationFillMode: "both",
        }}
        aria-label="Open SmartBus Assistant"
      >
        {/* Pulse ring */}
        {pulse && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              animation: "chatPulse 2s ease-out infinite",
              background: "rgba(244,63,94,0.4)",
            }}
          />
        )}
        {open ? (
          <X className="size-5 text-white" strokeWidth={2} />
        ) : (
          <MessageCircle className="size-5 text-white" strokeWidth={2} />
        )}
      </button>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes chatPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// import type { ReactNode } from "react";
// import { NavBar } from "./NavBar";
// import { Footer } from "./Footer";
// import { AuthModal } from "./AuthModal";
// import { BackHome } from "./BackHome";

// type Props = {
//   children: ReactNode;
//   theme?: "rose" | "navy";
//   floatingNav?: boolean;
//   hideFooter?: boolean;
//   /** Show the subtle "Back to Home" link under the nav (interior pages). */
//   backHome?: boolean;
// };

// export function PageShell({
//   children,
//   theme = "rose",
//   floatingNav = true,
//   hideFooter = false,
//   backHome = false,
// }: Props) {
//   return (
//     <div className="anim-fade relative min-h-screen bg-canvas">
//       <NavBar theme={theme} floating={floatingNav} />
//       {backHome ? (
//         <div className="pointer-events-none absolute inset-x-0 top-[104px] z-30 sm:top-[112px]">
//           <div className="mx-auto w-full max-w-[1240px] px-6">
//             <BackHome className="pointer-events-auto" />
//           </div>
//         </div>
//       ) : null}
//       <main className="stagger-rise">{children}</main>
//       {hideFooter ? null : <Footer />}
//       <AuthModal />
//     </div>
//   );
// }
