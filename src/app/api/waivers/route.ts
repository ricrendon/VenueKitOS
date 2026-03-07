import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VENUE_ID = "a1b2c3d4-0001-4000-8000-000000000001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone,
      emergencyContactName,
      emergencyContactPhone,
      children,
      signatureDataUrl,
    } = body;

    if (!parentFirstName || !parentLastName || !parentEmail || !children?.length || !signatureDataUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find or create parent account
    let parentId: string;
    const { data: existingParent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("email", parentEmail)
      .single();

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      const { data: newParent, error: parentError } = await supabase
        .from("parent_accounts")
        .insert({
          first_name: parentFirstName,
          last_name: parentLastName,
          email: parentEmail,
          phone: parentPhone || null,
        })
        .select("id")
        .single();

      if (parentError || !newParent) {
        console.error("Create parent error:", parentError);
        return NextResponse.json({ error: "Failed to create parent account" }, { status: 500 });
      }
      parentId = newParent.id;
    }

    // Process each child
    const waiverIds: string[] = [];
    for (const child of children) {
      // Find or create child
      let childId: string;
      const { data: existingChild } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", parentId)
        .eq("first_name", child.firstName)
        .eq("last_name", child.lastName)
        .single();

      if (existingChild) {
        childId = existingChild.id;
      } else {
        const { data: newChild, error: childError } = await supabase
          .from("children")
          .insert({
            parent_id: parentId,
            first_name: child.firstName,
            last_name: child.lastName,
            date_of_birth: child.dateOfBirth || null,
            allergies: child.allergies || null,
          })
          .select("id")
          .single();

        if (childError || !newChild) {
          console.error("Create child error:", childError);
          continue;
        }
        childId = newChild.id;
      }

      // Create waiver
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { data: waiver, error: waiverError } = await supabase
        .from("waivers")
        .insert({
          venue_id: VENUE_ID,
          parent_id: parentId,
          child_id: childId,
          parent_name: `${parentFirstName} ${parentLastName}`,
          child_name: `${child.firstName} ${child.lastName}`,
          emergency_contact_name: emergencyContactName || null,
          emergency_contact_phone: emergencyContactPhone || null,
          signature_data_url: signatureDataUrl,
          signed_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          status: "signed",
        })
        .select("id")
        .single();

      if (waiverError) {
        console.error("Create waiver error:", waiverError);
        continue;
      }
      if (waiver) waiverIds.push(waiver.id);
    }

    return NextResponse.json({
      success: true,
      parentId,
      waiverIds,
      count: waiverIds.length,
    });
  } catch (err) {
    console.error("Waiver API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
