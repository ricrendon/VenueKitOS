import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authUserId, firstName, lastName, email, phone } = body;

    if (!authUserId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("parent_accounts").insert({
      auth_user_id: authUserId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
    });

    if (error) {
      console.error("Register API error:", error);
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
