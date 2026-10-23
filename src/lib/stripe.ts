import "server-only";
import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

/** Lazily created so builds do not need the secret key. */
export function getStripe(): Stripe {
  client ??= new Stripe(env("STRIPE_SECRET_KEY"));
  return client;
}
