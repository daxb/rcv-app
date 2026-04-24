// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { randomInt } from "crypto";
import { WORDLIST } from "./wordlist";

export function generatePassphrase(): string {
  const parts: string[] = [];
  for (let i = 0; i < 3; i++) {
    parts.push(WORDLIST[randomInt(WORDLIST.length)]);
  }
  return parts.join("-");
}
