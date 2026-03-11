import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateToken } from "@/lib/social/meta";
import { isDemoMode } from "@/lib/mock/demo-mode";
import { mockSocialAccounts } from "@/lib/mock/data";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

// GET — list connected social accounts
export async function GET() {
  if (isDemoMode()) return NextResponse.json(mockSocialAccounts);
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("social_accounts")
      .select("id, platform, account_name, account_id, profile_picture_url, followers_count, connected_at, last_synced_at, status")
      .eq("venue_id", VENUE_ID)
      .order("connected_at", { ascending: false });

    if (error) {
      console.error("Social accounts GET error:", error);
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }

    return NextResponse.json({ accounts: data || [] });
  } catch (err) {
    console.error("Social accounts GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — connect a new social account
export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true, account: { id: "demo-account" } });
  try {
    const body = await request.json();
    const { platform, accessToken } = body;

    if (!platform || !accessToken) {
      return NextResponse.json({ error: "Missing platform or access token" }, { status: 400 });
    }

    // Validate the token against Meta API
    const validation = await validateToken(accessToken);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid access token. Please check your token and try again." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Upsert — update if same platform already connected
    const { data, error } = await supabase
      .from("social_accounts")
      .upsert(
        {
          venue_id: VENUE_ID,
          platform: validation.platform || platform,
          account_name: validation.accountName,
          account_id: validation.accountId,
          access_token: accessToken,
          profile_picture_url: validation.profilePicture,
          followers_count: validation.followers,
          connected_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
          status: "active",
        },
        { onConflict: "venue_id,platform" }
      )
      .select("id, platform, account_name, followers_count, status")
      .single();

    if (error) {
      console.error("Social accounts POST error:", error);
      return NextResponse.json({ error: "Failed to connect account" }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: data });
  } catch (err) {
    console.error("Social accounts POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — disconnect an account
export async function DELETE(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ success: true });
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json({ error: "Missing account id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("social_accounts")
      .update({ status: "disconnected", access_token: null })
      .eq("id", accountId)
      .eq("venue_id", VENUE_ID);

    if (error) {
      console.error("Social accounts DELETE error:", error);
      return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Social accounts DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
