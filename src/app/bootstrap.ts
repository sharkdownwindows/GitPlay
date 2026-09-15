import { progressStore } from "../progress/store";

export async function bootstrap() {
  await progressStore.load();

  // TIER2-START
  const { attachSync } = await import("../sync/attach");
  attachSync(progressStore);
  // TIER2-END
}
