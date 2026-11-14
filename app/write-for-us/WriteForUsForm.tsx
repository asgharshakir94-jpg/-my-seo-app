"use client";

import { useEffect, useRef, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  business: "",
  website: "",
  title: "",
  article: "",
  agree: false,
  hp: "",
};

const inputClass =
  "w-full px-4 py-2 border-2 border-ink/20 rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from";

export default function WriteForUsForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const statusRef = useRef<HTMLParagraphElement>(null);

  // Bring the message into view so people never miss it.
  useEffect(() => {
    if (status) statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  const isLink = /^https?:\/\/\S+$/i.test(form.article.trim());
  const wordCount = form.article.split(/\s+/).filter(Boolean).length;
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/write-for-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({
          type: "ok",
          text: "Thank you! We received your article and will reply by email after we have read it.",
        });
        setForm(initialForm);
      } else {
        setStatus({ type: "error", text: data.error || "Something went wrong." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Network error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Your name</label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className={inputClass}
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          placeholder="jane@yourcompany.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Business name</label>
        <input
          name="business"
          required
          value={form.business}
          onChange={handleChange}
          className={inputClass}
          placeholder="Doe Roofing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Business website (optional)
        </label>
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          className={inputClass}
          placeholder="https://doeroofing.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Article title</label>
        <input
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          className={inputClass}
          placeholder="How I cut my cost per roofing lead in half"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Your article, or a link to it
        </label>
        <textarea
          name="article"
          required
          rows={12}
          value={form.article}
          onChange={handleChange}
          className={inputClass}
          placeholder="Paste your article here, or paste a Google Docs link (set to anyone with the link can view). 600 words or more is ideal."
        />
        <p className="mt-1 text-xs text-ink/60">
          {isLink
            ? "Link detected."
            : `${wordCount} words (600 or more needed, or paste a link instead)`}
        </p>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it in */}
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty</label>
        <input
          name="hp"
          tabIndex={-1}
          autoComplete="off"
          value={form.hp}
          onChange={handleChange}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          name="agree"
          required
          checked={form.agree}
          onChange={handleChange}
          className="mt-1"
        />
        <span>
          This article is my own original work, it has not been published
          elsewhere, and I am not paying or being paid for it.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 rounded-md font-medium bg-ink text-paper hover:opacity-90 transition disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit Article"}
      </button>

      {status && (
        <p
        ref={statusRef}  
        role="status"
          className={
            status.type === "ok"
              ? "text-sm text-ink bg-paper border border-line rounded-md p-3"
              : "text-sm text-red-600 border border-red-300 rounded-md p-3"
          }
        >
          {status.text}
        </p>
      )}
    </form>
  );
}