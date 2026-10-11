import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Where the new-submission alert is sent. Change if your inbox differs.
const ALERT_TO = "hello@rankinseo.xyz";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

async function sendAlert(s: {
  name: string;
  email: string;
  business: string;
  website: string;
  title: string;
  article: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.FINDER_FROM_EMAIL) {
    console.error("write-for-us alert skipped: missing RESEND_API_KEY or FINDER_FROM_EMAIL");
    return;
  }

  const preview =
    s.article.length > 1500 ? s.article.slice(0, 1500) + "\n[...cut, full text in Supabase]" : s.article;

  const text =
    `New "Write for us" submission\n\n` +
    `Name: ${s.name}\n` +
    `Email: ${s.email}\n` +
    `Business: ${s.business}\n` +
    `Website: ${s.website || "(none)"}\n` +
    `Title: ${s.title}\n\n` +
    `Article (${s.article.length} characters):\n${preview}\n\n` +
    `Full submission: Supabase > Table Editor > guest_submissions`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FINDER_FROM_EMAIL,
      to: [ALERT_TO],
      reply_to: s.email,
      subject: `New guest article: ${oneLine(s.title).slice(0, 120)}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("write-for-us alert failed, Resend status:", res.status);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Spam trap: bots fill the hidden field. Pretend it worked.
    if (body.hp) {
      return NextResponse.json({ success: true });
    }

    const name = clean(body.name, 200);
    const email = clean(body.email, 320);
    const business = clean(body.business, 200);
    const website = clean(body.website, 500);
    const title = clean(body.title, 300);
    const article = clean(body.article, 60000);

    if (!name || !email || !business || !title || !article) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (body.agree !== true) {
      return NextResponse.json(
        { error: "Please confirm the originality statement." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (article.length < 200) {
      return NextResponse.json(
        { error: "Please paste your article, or a link to it, in the article box." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("guest_submissions")
      .insert({ name, email, business, website: website || null, title, article });

    if (error) {
      console.error("guest_submissions insert failed:", error.message);
      return NextResponse.json(
        { error: "Could not save your submission. Please try again." },
        { status: 500 }
      );
    }

    // The row is saved. An email problem must never make the form look broken.
    try {
      await sendAlert({ name, email, business, website, title, article });
    } catch (alertErr) {
      console.error("write-for-us alert error:", alertErr instanceof Error ? alertErr.message : "unknown");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}