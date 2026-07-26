import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route uses the Supabase SERVICE ROLE key to create user accounts
// It must be called from a server-side API route, never exposed to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // must be set in Vercel env vars
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pwd = "";
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  // Format: XXXX-XXXX for readability on paper
  return `${pwd.slice(0, 4)}-${pwd.slice(4)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ecoleNom, province } = body as { ecoleNom: string; province: string };

    if (!ecoleNom || !province) {
      return NextResponse.json({ error: "ecoleNom et province sont requis." }, { status: 400 });
    }

    // Build a deterministic email from school name
    const slug = ecoleNom
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const email = `${slug}@formateur.smartcaravan.ma`;
    const password = generatePassword();

    // Try to create user with Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation
      user_metadata: {
        role: "formateur",
        ecole: ecoleNom,
        province,
      },
    });

    if (error) {
      // If user already exists, return existing info
      if (error.message.includes("already") || error.message.includes("exists")) {
        return NextResponse.json({ email, password: "***déjà créé***", alreadyExists: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also insert a profile row so the formateur space can read the school info
    if (data.user) {
      await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        full_name: `Formateurs - ${ecoleNom}`,
        role: "formateur",
        ecole: ecoleNom,
        province,
      });
    }

    return NextResponse.json({ email, password, userId: data.user?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
