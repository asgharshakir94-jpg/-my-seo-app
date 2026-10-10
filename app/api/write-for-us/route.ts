import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}