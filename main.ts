// Two Days of Quiet Dread — make.fun bounty
// u-hakimi-neko-ai-two-days-of-quiet-dread-94fa1018
//
// Writes one code review comment — a single line of at most 140
// characters that approves a pull request while carrying quiet
// existential dread — to /output/entry.txt. Deterministic, stdlib
// only, no network, no wall-clock time, no randomness.
//
// The comment (chosen against the judge's brief: it must approve the
// PR, carry quiet dread, be funny on the first read with the laugh
// coming from the dread itself, stay flat and understated, and read
// like something a tired engineer would really paste before clicking
// approve):
//   "Approved. The tests are green, the diff is tidy, and entropy
//    has already filed its own review. Merging."
// The dread is the universe's own code review: entropy has already
// filed its review of everything, including this PR and the reviewer.
// It approves twice ("Approved", "Merging"), stays flat, and the
// turn — entropy filing a review — is a fresh phrase rather than a
// stock "heat death" line. 103 characters, one line.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The comment. Exactly one line, no trailing newline in the file.
const COMMENT =
  "Approved. The tests are green, the diff is tidy, and entropy " +
  "has already filed its own review. Merging.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 140
// characters, not only white space. Enforce the same bounds here so
// a bad line can never reach the gate.
const MIN_CHARS = 1;
const MAX_CHARS = 140;

function validateComment(text: string): void {
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `comment must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("comment must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("comment must be a single line");
  }
}

// Re-read what was written and prove it is exactly the validated
// line: same bytes, same character count, still inside the gate. A
// mismatch here is a hard failure, never a silent pass.
function verifyWritten(outPath: string, expected: string): void {
  const back = readFileSync(outPath, "utf8");
  if (back !== expected) {
    throw new Error(`verify failed: ${outPath} differs from the comment`);
  }
  const chars = [...back].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`verify failed: written file is ${chars} characters`);
  }
  console.log(`verified ${outPath}: ${chars} chars, byte-identical`);
}

// Self-test: prove the validator enforces the gate instead of
// trusting it. Run with `node main.ts --self-test`. The chosen line
// must pass; a too-long line, a multi-line line and a whitespace-only
// line must each be rejected, so a regression in validateComment
// fails loudly here instead of at the sealed gate.
function selfTest(): void {
  validateComment(COMMENT);
  const probes: Array<[string, string]> = [
    ["too long", "x".repeat(MAX_CHARS + 1)],
    ["multi-line", "Approved.\nMerging."],
    ["whitespace only", "   "],
  ];
  for (const [name, probe] of probes) {
    let rejected = false;
    try {
      validateComment(probe);
    } catch {
      rejected = true;
    }
    if (!rejected) {
      throw new Error(`self-test failed: ${name} probe was not rejected`);
    }
    console.log(`self-test: ${name} probe rejected as expected`);
  }
  console.log(
    `self-test passed: comment is ${[...COMMENT].length} chars, ` +
      `inside ${MIN_CHARS}-${MAX_CHARS}`,
  );
}

function main(): void {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }
  validateComment(COMMENT);
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, COMMENT, "utf8");
  verifyWritten(outPath, COMMENT);
  console.log(`wrote ${[...COMMENT].length} chars to ${outPath}`);
  console.log(COMMENT);
}

main();
