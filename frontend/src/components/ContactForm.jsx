import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { SITE } from "@/data/content";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

const FIELD =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-[border-color,box-shadow] duration-300 focus:border-cyan-400/60 focus:ring-2 focus:ring-[#087BFF]/30";

export default function ContactForm() {
  const empty = { name: "", email: "", phone: "", company: "", message: "" };
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent!", {
        description: "Send us a message — we'll promptly discuss your project with you.",
      });
      setForm(empty);
    } catch {
      toast.error(`Could not send your message. Please call us at ${SITE.phonePrimary}.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} data-testid="contact-form" className="glass-card glass-glow relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#087BFF]/20 blur-3xl" />
      <h3 className="font-display text-2xl font-bold text-white">Send Us A Message</h3>
      <p className="mt-2 text-sm text-slate-400">
        Give us chance to serve and bring magic to your brand.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          data-testid="contact-input-name"
          className={FIELD}
          placeholder="Full Name *"
          value={form.name}
          onChange={set("name")}
        />
        <input
          data-testid="contact-input-email"
          className={FIELD}
          type="email"
          placeholder="Your Email *"
          value={form.email}
          onChange={set("email")}
        />
        <input
          data-testid="contact-input-phone"
          className={FIELD}
          placeholder="Your Phone Number"
          value={form.phone}
          onChange={set("phone")}
        />
        <input
          data-testid="contact-input-company"
          className={FIELD}
          placeholder="Your Company Name"
          value={form.company}
          onChange={set("company")}
        />
        <textarea
          data-testid="contact-input-message"
          className={`${FIELD} sm:col-span-2 min-h-[130px] resize-y`}
          placeholder="Message"
          value={form.message}
          onChange={set("message")}
        />
      </div>
      <button
        type="submit"
        data-testid="contact-submit-button"
        disabled={sending}
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00C8FF] px-8 py-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(8,123,255,0.4)] transition-all duration-300 hover:shadow-[0_0_44px_rgba(0,200,255,0.55)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
