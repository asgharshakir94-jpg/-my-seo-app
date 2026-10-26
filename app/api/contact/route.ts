import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendAlert(
  name: string,
  email: string,
  company: string,
  message: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FINDER_FROM_EMAIL;
  const to = (process.env.ADMIN_EMAILS || "").split(",")[0]?.trim();

  if (!apiKey || !from || !to) {
    console.error(
      "contact alert skipped: missing RESEND_API_KEY, FINDER_FROM_EMAIL or ADMIN_EMAILS"
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New contact form message from ${name.replace(/[\r\n]+/g, " ")}`,
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!res.ok) {
      console.error("contact alert failed, Resend status:", res.status);
    }
  } catch (err) {
    console.error("contact alert error:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (
      !emailLooksValid ||
      name.length > 100 ||
      email.length > 200 ||
      company.length > 150 ||
      message.length > 3000
    ) {
      return NextResponse.json(
        { error: "Please check your details and try again." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("contact_submissions")
      .insert({ name, email, company, message });

    if (error) {
      console.error("contact insert failed:", error.message);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }

    await sendAlert(name, email, company, message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}