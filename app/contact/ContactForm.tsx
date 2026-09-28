"use client";

import { useState } from "react";
import { site, waLink } from "@/data/site";

/**
 * No backend: the message is composed here and handed to WhatsApp or the
 * visitor's email app, pre-filled. Nothing is stored on the site.
 */

const topics = ["Order question", "Bulk / corporate gifting", "Chhath pre-order", "Just saying hi"];

export default function ContactForm() {
  const [topic, setTopic] = useState(topics[0]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const compose = () => {
    if (!name.trim() || !message.trim()) {
      setError("Add your name and a message first.");
      return null;
    }
    setError(null);
    return `Hi Desi Pakwan! I'm ${name.trim()}.\nTopic: ${topic}\n\n${message.trim()}`;
  };

  const sendWhatsApp = () => {
    const text = compose();
    if (text) window.open(waLink(text), "_blank", "noopener,noreferrer");
  };

  const sendEmail = () => {
    const text = compose();
    if (!text) return;
    const subject = encodeURIComponent(`${topic} — ${name.trim()}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(text)}`;
  };

  const field =
    "w-full rounded-[14px] border-2 border-pista-200 bg-white px-4 py-3 text-[16px] text-paan-900 placeholder:text-paan-700/35 transition-colors focus:border-kesariya-500 focus:outline-none";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendWhatsApp();
      }}
      className="rounded-[28px] bg-white/70 p-6 shadow-[0_24px_60px_rgba(6,28,19,0.10)] md:p-8"
      noValidate
    >
      <h2 className="font-display text-[28px] font-black leading-tight text-paan-900">Write to us</h2>
      <p className="mt-1 text-[15px] text-paan-700/70">Pick a topic, say it your way, send it where you like.</p>

      {/* topic chips */}
      <fieldset className="mt-6">
        <legend className="mb-2.5 text-[14px] font-bold text-paan-900">What&apos;s it about?</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === topic}
              onClick={() => setTopic(t)}
              className={`rounded-full border-2 px-4 py-2 text-[14px] font-bold transition-all duration-200 ${
                t === topic
                  ? "border-paan-900 bg-paan-900 text-kesariya-500"
                  : "border-paan-900/15 text-paan-900 hover:border-paan-900/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-[14px] font-bold text-paan-900">Your name</span>
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="e.g. Priya"
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[14px] font-bold text-paan-900">Message</span>
        <textarea
          className={`${field} min-h-[140px] resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            topic === "Bulk / corporate gifting"
              ? "How many boxes, which products, and by when?"
              : topic === "Chhath pre-order"
                ? "Which products, how much, and your delivery city?"
                : "Tell us anything…"
          }
        />
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-[14px] font-bold text-sindoor-600">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex h-14 items-center gap-2.5 rounded-full bg-mehndi-600 px-7 text-[16px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          <WhatsAppGlyph className="h-5 w-5" />
          Send on WhatsApp
        </button>
        <button
          type="button"
          onClick={sendEmail}
          className="inline-flex h-14 items-center rounded-full border-2 border-paan-900/20 px-7 text-[16px] font-bold text-paan-900 transition-colors hover:border-paan-900"
        >
          Send by email
        </button>
      </div>
      <p className="mt-4 text-[13px] text-paan-700/55">
        Opens WhatsApp or your email app with the message ready — nothing is stored on this site.
      </p>
    </form>
  );
}

export function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.5-1.4-.7-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
