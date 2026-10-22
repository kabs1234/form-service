#!/usr/bin/env node
/**
 * clean-code-ts gate
 *
 * PreToolUse  (Write|Edit) — denies writes to .ts/.tsx until the clean-code-ts
 *                            skill has been loaded in this session.
 * PostToolUse (Skill)      — records that the skill was loaded, so later writes
 *                            pass silently.
 *
 * Fails open: any unexpected input, missing field, or IO error exits 0 so a
 * broken hook can never wedge the session.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SKILL_NAME = 'clean-code-ts';
const GATED_EXTENSIONS = /\.tsx?$/;
const MARKER_DIR = path.join(os.tmpdir(), 'claude-clean-code-ts');
const TRANSCRIPT_TAIL_BYTES = 8 * 1024 * 1024;

/** Text that only exists inside the skill body, so a bare mention of the skill
 *  name in a user message doesn't satisfy the gate. */
const SKILL_BODY_SENTINEL = 'reach for `interface` only when you need declaration merging';

const DENIAL_REASON = [
  `The ${SKILL_NAME} skill has not been loaded in this session, so this TypeScript write is blocked.`,
  '',
  `Invoke the ${SKILL_NAME} skill first (Skill tool, skill: "${SKILL_NAME}"), apply its rules to the code you were about to write, then retry this edit.`,
  '',
  'Do not work around this by writing the file under a different extension or by proposing the code as chat text.',
].join('\n');

function markerPathFor(sessionId) {
  const safeSessionId = String(sessionId || 'unknown').replace(/[^\w-]/g, '') || 'unknown';
  return path.join(MARKER_DIR, `${safeSessionId}.marker`);
}

function recordSkillLoaded(sessionId) {
  try {
    fs.mkdirSync(MARKER_DIR, { recursive: true });
    fs.writeFileSync(markerPathFor(sessionId), new Date().toISOString());
  } catch {
    // Marker is only a fast path — the transcript scan still covers us.
  }
}

function hasMarker(sessionId) {
  try {
    return fs.existsSync(markerPathFor(sessionId));
  } catch {
    return false;
  }
}

function readTranscriptTail(transcriptPath) {
  if (!transcriptPath) return '';
  try {
    const { size } = fs.statSync(transcriptPath);
    const start = Math.max(0, size - TRANSCRIPT_TAIL_BYTES);
    const length = size - start;
    if (length === 0) return '';

    const buffer = Buffer.alloc(length);
    const fileDescriptor = fs.openSync(transcriptPath, 'r');
    try {
      fs.readSync(fileDescriptor, buffer, 0, length, start);
    } finally {
      fs.closeSync(fileDescriptor);
    }
    return buffer.toString('utf8');
  } catch {
    return '';
  }
}

function skillIsLoaded(payload) {
  if (hasMarker(payload.session_id)) return true;
  return readTranscriptTail(payload.transcript_path).includes(SKILL_BODY_SENTINEL);
}

function handleSkillInvocation(payload) {
  const invokedSkill = String((payload.tool_input || {}).skill || '');
  if (invokedSkill.includes(SKILL_NAME)) recordSkillLoaded(payload.session_id);
}

function handleWrite(payload) {
  const toolInput = payload.tool_input || {};
  const filePath = String(toolInput.file_path || '');
  if (!GATED_EXTENSIONS.test(filePath)) return;
  if (skillIsLoaded(payload)) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: DENIAL_REASON,
      },
      systemMessage: `Blocked write to ${path.basename(filePath)} — loading the ${SKILL_NAME} skill first.`,
    })
  );
}

function main(rawInput) {
  let payload;
  try {
    payload = JSON.parse(rawInput);
  } catch {
    return;
  }

  if (payload.hook_event_name === 'PostToolUse' || payload.tool_name === 'Skill') {
    handleSkillInvocation(payload);
    return;
  }

  handleWrite(payload);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  main(input);
  process.exit(0);
});