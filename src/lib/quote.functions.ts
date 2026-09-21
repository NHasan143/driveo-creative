import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const quoteSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(40),
  serviceType: z.enum(["Airport transfer", "Point-to-point", "Hourly hire", "Private event"]),
  pickupCity: z.enum(["London", "Paris", "Bulgaria", "Dubai"]),
  pickupLocation: z.string().trim().min(2).max(300),
  destination: z.string().trim().max(300),
  hireHours: z.number().int().min(2).max(16).nullable(),
  journeyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  journeyTime: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.number().int().min(1).max(30),
  vehicleClass: z.enum(["Business Class", "First Class", "Business Van", "Please advise"]),
  luggage: z.number().int().min(0).max(8),
  notes: z.string().trim().max(1500),
  company: z.string().max(0),
}).superRefine((input, context) => {
  if (input.serviceType === "Hourly hire" && input.hireHours === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["hireHours"], message: "Select the number of hours" });
  }
  if (input.serviceType !== "Hourly hire" && input.destination.trim().length < 2) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["destination"], message: "Enter a destination" });
  }
  const passengerLimit = input.vehicleClass === "Business Van" ? 7 : 4;
  const luggageLimit = input.vehicleClass === "Business Van" ? 8 : 3;
  if (input.passengers > passengerLimit) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["passengers"], message: `This vehicle takes up to ${passengerLimit} passengers` });
  }
  if (input.luggage > luggageLimit) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["luggage"], message: `This vehicle takes up to ${luggageLimit} luggage items` });
  }
});

type QuoteInput = z.infer<typeof quoteSchema>;

function formatQuote(input: QuoteInput, reference: string) {
  return [
    `NEW DRIVEO QUOTE · ${reference.slice(0, 8).toUpperCase()}`,
    "",
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `City: ${input.pickupCity}`,
    `Service: ${input.serviceType}`,
    input.serviceType === "Hourly hire"
      ? `Hire: ${input.pickupLocation} · ${input.hireHours} hours`
      : `Journey: ${input.pickupLocation} → ${input.destination}`,
    `Date: ${input.journeyDate} at ${input.journeyTime}`,
    `Passengers: ${input.passengers}`,
    `Luggage: ${input.luggage}`,
    `Vehicle: ${input.vehicleClass}`,
    `Notes: ${input.notes || "None"}`,
  ].join("\n");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function emailQuote(input: QuoteInput, reference: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
  if (!lovableKey || !gmailKey) return false;

  const recipient = "driveolimited@gmail.com";
  const subject = `New Driveo quote · ${reference.slice(0, 8).toUpperCase()} · ${input.fullName}`;
  const raw = encodeBase64Url([
    `To: ${recipient}`,
    `Reply-To: ${input.email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    formatQuote(input, reference),
  ].join("\r\n"));

  const response = await fetch(
    "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  if (!response.ok) {
    console.error(`Gmail quote delivery failed [${response.status}]: ${await response.text()}`);
  }
  return response.ok;
}

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("quote_requests")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        service_type: data.serviceType,
        pickup_city: data.pickupCity,
        pickup_location: data.pickupLocation,
        destination: data.serviceType === "Hourly hire" ? `Hourly hire · ${data.hireHours} hours` : data.destination,
        hire_hours: data.hireHours,
        journey_date: data.journeyDate,
        journey_time: data.journeyTime,
        passengers: data.passengers,
        vehicle_class: data.vehicleClass,
        luggage: data.luggage,
        notes: data.notes || null,
      })
      .select("id")
      .single();

    if (error || !request) throw new Error("We could not save your request. Please try again.");

    let emailStatus = "failed";
    try {
      emailStatus = (await emailQuote(data, request.id)) ? "sent" : "failed";
    } catch (deliveryError) {
      console.error("Gmail quote delivery failed", deliveryError);
    }

    await supabaseAdmin
      .from("quote_requests")
      .update({ whatsapp_status: "disabled", email_status: emailStatus })
      .eq("id", request.id);

    if (emailStatus !== "sent") {
      throw new Error("Your request was saved, but the email could not be delivered. Please try again.");
    }

    return { ok: true, reference: request.id.slice(0, 8).toUpperCase() };
  });