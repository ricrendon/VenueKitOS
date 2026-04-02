import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVenueId } from "@/lib/utils/venue";

export const dynamic = "force-dynamic";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PT-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const venueId = await getVenueId();
    const body = await request.json();
    const {
      // Package
      packageId,
      packageName,
      packagePrice,
      durationMinutes,
      // Date & time
      date,        // "YYYY-MM-DD"
      startTime,   // "HH:MM"
      // Party info
      childFirstName,
      childLastName,
      childBirthday,
      childAge,
      estimatedGuestCount,
      specialNotes,
      // Add-ons
      addOns,       // [{ id, name, price, quantity }]
      // Contact
      firstName,
      lastName,
      email,
      phone,
    } = body;

    if (!date || !startTime || !childFirstName || !email || !packagePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find or create parent account
    let parentId: string;
    const { data: existingParent } = await supabase
      .from("parent_accounts")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingParent) {
      parentId = existingParent.id;
    } else {
      const { data: newParent, error: parentError } = await supabase
        .from("parent_accounts")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          phone: phone || null,
        })
        .select("id")
        .single();

      if (parentError || !newParent) {
        console.error("Create parent error:", parentError);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }
      parentId = newParent.id;
    }

    // Calculate pricing
    const addOnsTotal = (addOns || []).reduce(
      (sum: number, ao: { price: number; quantity: number }) => sum + ao.price * (ao.quantity || 1),
      0
    );
    const subtotal = Number(packagePrice) + addOnsTotal;
    const taxRate = 0.08;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const totalDue = Number((subtotal + tax).toFixed(2));
    const deposit = Number((totalDue * 0.5).toFixed(2));
    const balanceRemaining = Number((totalDue - deposit).toFixed(2));

    // Build timestamps
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = startTime.split(":").map(Number);
    const startDt = new Date(year, month - 1, day, hour, minute);
    const endDt = new Date(startDt.getTime() + (durationMinutes || 120) * 60 * 1000);

    const confirmationCode = generateCode();

    // Create party reservation
    const { data: reservation, error: resError } = await supabase
      .from("party_reservations")
      .insert({
        venue_id: venueId,
        parent_id: parentId,
        package_id: packageId || null,
        status: "pending",
        payment_status: "unpaid",
        date,
        start_time: startDt.toISOString(),
        end_time: endDt.toISOString(),
        child_name: `${childFirstName} ${childLastName || ""}`.trim(),
        child_birthday: childBirthday || null,
        child_age: childAge ? Number(childAge) : null,
        estimated_guest_count: estimatedGuestCount ? Number(estimatedGuestCount) : 10,
        deposit,
        total_due: totalDue,
        balance_remaining: balanceRemaining,
        special_notes: specialNotes || null,
      })
      .select("id")
      .single();

    if (resError || !reservation) {
      console.error("Create reservation error:", resError);
      return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }

    // Also create a bookings row so it shows in /admin/reservations
    await supabase.from("bookings").insert({
      venue_id: venueId,
      parent_id: parentId,
      type: "party",
      status: "pending",
      payment_status: "unpaid",
      date,
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      child_count: estimatedGuestCount || 10,
      adult_count: 0,
      subtotal,
      tax,
      total: totalDue,
      confirmation_code: confirmationCode,
      notes: specialNotes || null,
    });

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        confirmationCode,
        packageName,
        date,
        startTime,
        childName: `${childFirstName} ${childLastName || ""}`.trim(),
        estimatedGuestCount: estimatedGuestCount || 10,
        deposit,
        totalDue,
        balanceRemaining,
      },
    });
  } catch (err) {
    console.error("Party reservation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
