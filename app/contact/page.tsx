"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Thanks! We'll be in touch shortly.");
        setForm({ name: "", email: "", company: "", message: "" });
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-surface border border-line rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Talk to Sales</h1>
        <p className="text-ink/70 mb-8">
          Tell us about your team and we&apos;ll get back to you within one
          business day.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-ink/20 rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Work Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-ink/20 rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-ink/20 rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Message</label>
            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-ink/20 rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
              placeholder="Tell us what you're looking for..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md font-medium bg-ink text-paper hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}