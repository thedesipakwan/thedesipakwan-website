import { z } from "zod";
import { INDIAN_STATES } from "@/data/states";

// No control characters (newlines, tabs, etc.) — same rule as the order API.
const noControl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((s) => !/[\u0000-\u001F\u007F]/.test(s));

/**
 * The details a customer may choose to keep for next checkout. Contact and
 * delivery only — never payment details or the delivery note. Unknown keys
 * are stripped, so nothing else can end up in the cookie.
 */
export const savedDetailsSchema = z.object({
  name: noControl(80).pipe(z.string().min(2)),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().trim().email().max(120),
  address1: noControl(120).pipe(z.string().min(3)),
  address2: noControl(120).optional().default(""),
  city: noControl(60).pipe(z.string().min(2)),
  state: z.string().refine((s) => INDIAN_STATES.includes(s)),
  pin: z.string().regex(/^\d{6}$/),
});

export type SavedDetails = z.infer<typeof savedDetailsSchema>;
