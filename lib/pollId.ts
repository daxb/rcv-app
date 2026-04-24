// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { randomInt } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const LENGTH = 4;

export function generateShortId(): string {
  let out = "";
  for (let i = 0; i < LENGTH; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}
