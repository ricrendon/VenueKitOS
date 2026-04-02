/** Returns true when the app is running in demo mode (no real DB). */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
