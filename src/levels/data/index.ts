import type { CommandKind } from "../../core/types";
import type { Level } from "../schema";
import first from "./01-first-commit.json";
import branching from "./02-branching.json";
import switchVsCheckout from "./03-switch-vs-checkout.json";
import detachedHead from "./04-detached-head.json";

export const levels: readonly Level[] = [first, branching, switchVsCheckout, detachedHead].map(
  (level) => ({ ...level, allowed: level.allowed as CommandKind[] }),
);
