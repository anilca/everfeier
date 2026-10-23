// Excludes look-alike characters 0, O, 1, I.
export const ORDER_NO_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const ORDER_NO_PATTERN = /^EF-[2-9A-HJ-NP-Z]{6}$/;

export function generateOrderNo(random: (n: number) => Uint8Array = randomBytes): string {
  // 32 symbols divide 256 evenly, so `byte % 32` is unbiased.
  const bytes = random(6);
  let code = "";
  for (const b of bytes) code += ORDER_NO_ALPHABET[b % ORDER_NO_ALPHABET.length];
  return `EF-${code}`;
}

/** Normalizes user input like " ef-7k3qxm " to "EF-7K3QXM"; returns null if it cannot be an order number. */
export function normalizeOrderNo(input: string): string | null {
  const value = input.trim().toUpperCase();
  return ORDER_NO_PATTERN.test(value) ? value : null;
}

function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}
