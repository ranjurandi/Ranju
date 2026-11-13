import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import ContactForm from "@/components/ContactForm";

const DISMISSED_KEY = "gwt-welcome-dismissed";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!sessionStorage.getItem(DISMISSED_KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        sessionStorage.setItem(DISMISSED_KEY, "true");
        setOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const closePopup = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setOpen(false);
  };

  const openMessage = () => {
    setStep(1);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        data-testid="message-popup-trigger"
        aria-label="Send us a Message"
        onClick={openMessage}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-4 py-3 text-xs font-semibold text-white shadow-[0_0_24px_rgba(8,123,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(0,200,255,0.45)] sm:bottom-6 sm:right-6 sm:px-5 sm:text-sm"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4" />
        Send us a Message
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="welcome-popup"
            className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-[#02060c]/65 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.section
              role="dialog"
              aria-modal="false"
              aria-labelledby="welcome-popup-title"
              className="pointer-events-auto relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#071426] via-[#050B16] to-[#071426] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] sm:p-9"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                data-testid="welcome-popup-close"
                aria-label="Close welcome popup"
                onClick={closePopup}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan-300/40 hover:text-white sm:right-6 sm:top-6"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>

              {step === 0 ? (
                <div className="py-5 pr-8 sm:py-8">
                  <p className="eyebrow">Welcome to Godavari Wave</p>
                  <h2
                    id="welcome-popup-title"
                    className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl"
                  >
                    Based in <span className="text-gradient">Hyderabad, Telangana.</span>
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                    Tell us what you are building. Our team at Meenakshi Tech Park,
                    Gachibowli, will be happy to discuss your project.
                  </p>
                  <button
                    type="button"
                    data-testid="welcome-popup-next"
                    onClick={() => setStep(1)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(8,123,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(0,200,255,0.4)]"
                  >
                    Next
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="pt-8 sm:pt-10">
                  <h2 id="welcome-popup-title" className="sr-only">
                    Send us a Message
                  </h2>
                  <ContactForm />
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
