export type SmartHomeDevice = "light" | "ventilation" | "plug" | "camera" | "spotify" | "scene";

// HomeOS REST wiring lands in a later build step (Prompt 12).
export async function smartHomeHandler(
  device: SmartHomeDevice,
  action: string,
  value?: unknown
): Promise<void> {
  const baseUrl = process.env.HOMEOS_BASE_URL;
  if (!baseUrl) {
    console.warn("HOMEOS_BASE_URL not configured; smarthome no-op", { device, action, value });
    return;
  }
  await fetch(`${baseUrl}/devices/${device}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}
