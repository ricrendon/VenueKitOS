import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Create auth user via service role — email_confirm: true bypasses
    // the "Email not confirmed" error regardless of Supabase dashboard settings.
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError || !authData.user) {
      console.error("Auth createUser error:", authError);
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create auth user" },
        { status: 400 }
      );
    }

    // Create parent_accounts profile row
    const { error: profileError } = await admin.from("parent_accounts").insert({
      auth_user_id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
    });

    if (profileError) {
      console.error("Profile insert error:", profileError);
      // Clean up the orphaned auth user
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create account profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
