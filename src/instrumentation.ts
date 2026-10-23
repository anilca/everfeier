export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { findEnvProblems } = await import("@/lib/env");
  const problems = findEnvProblems(process.env);
  if (problems.length > 0) {
    throw new Error(
      `Konfiguration unvollständig (siehe .env.example):\n- ${problems.join("\n- ")}`,
    );
  }
}
