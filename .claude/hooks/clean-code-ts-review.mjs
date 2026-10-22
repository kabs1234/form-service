#!/usr/bin/env node
/**
 * clean-code-ts review
 *
 * PostToolUse (Write|Edit) — scans TypeScript that was just written and blocks
 * with a list of clean-code-ts violations so they get fixed before moving on.
 *
 * Write scans the whole file; Edit scans only the lines the patch added, so
 * pre-existing debt in a file you touched is never reported as yours.
 *
 * Fails open: bad input or an unreadable payload exits 0 rather than nagging.
 */

import path from 'node:path';

const REVIEWED_EXTENSIONS = /\.tsx?$/;
const MAX_PARAMETERS = 2;
const MIN_MAGIC_NUMBER_DIGITS = 4;
const ALLOWED_SHORT_NAMES = new Set(['i', 'j', 'k', 'x', 'y', 'z', '_']);

const isCommentLine = (line) => /^\s*(\/\/|\*|\/\*)/.test(line);

/** Digits and words inside strings or JSX text are prose, not code. Rules that
 *  inspect code tokens run against this stripped form so a URL like
 *  `.../relation/3386005` or a date like `<span>Июнь 2025</span>` isn't flagged. */
function codeOnly(line) {
  const withoutStrings = line
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');

  const looksLikeJsx = /<\/?[A-Za-z]/.test(withoutStrings);
  return looksLikeJsx ? withoutStrings.replace(/>[^<>]*</g, '><') : withoutStrings;
}

/** Destructured params, array types and generic arguments all contain commas
 *  that aren't parameter separators — `Map<string, User>` is one parameter. */
const collapseBrackets = (source) =>
  source
    .replace(/\{[^}]*\}/g, '{}')
    .replace(/\[[^\]]*\]/g, '[]')
    .replace(/<[^<>]*>/g, '<>');

function countParameters(parameterList) {
  return collapseBrackets(parameterList)
    .split(',')
    .map((parameter) => parameter.trim())
    .filter(Boolean).length;
}

function describeParameterCount(line) {
  const signature =
    line.match(/function\s+\w*\s*\(([^)]+)\)/) ||
    line.match(/(?:const|let|var)\s+\w+\s*=\s*\(([^)]+)\)\s*=>/);
  if (!signature) return undefined;

  const count = countParameters(signature[1]);
  if (count <= MAX_PARAMETERS) return undefined;
  return `${count} parameters — max is ${MAX_PARAMETERS}; consolidate into a named options type`;
}

/** Each rule returns a message when the line violates it, otherwise undefined. */
const RULES = [
  {
    id: 'explicit-any',
    appliesToComments: false,
    describe: (line) =>
      /:\s*any\b|<any>|\bas\s+any\b/.test(line)
        ? '`any` — use `unknown` and narrow, or write the real type'
        : undefined,
  },
  {
    id: 'non-null-assertion',
    appliesToComments: false,
    describe: (line) =>
      /\w!\s*[.);,\]]/.test(line)
        ? 'Non-null assertion (`!`) — narrow properly instead of silencing the compiler'
        : undefined,
  },
  {
    id: 'ts-ignore',
    readsRawText: true,
    appliesToComments: true,
    describe: (line) =>
      /@ts-ignore/.test(line)
        ? '`@ts-ignore` — use `@ts-expect-error` with a reason, and only as a last resort'
        : undefined,
  },
  {
    id: 'hungarian-interface',
    appliesToComments: false,
    describe: (line) => {
      const match = line.match(/\b(?:interface|type)\s+(I[A-Z]\w*)/);
      return match ? `Type prefix in \`${match[1]}\` — name it \`${match[1].slice(1)}\`` : undefined;
    },
  },
  {
    id: 'too-many-parameters',
    appliesToComments: false,
    describe: describeParameterCount,
  },
  {
    id: 'boolean-parameter',
    appliesToComments: false,
    describe: (line) => {
      const match = line.match(/\(\s*[^)]*?\b(\w+)\s*:\s*boolean\b/);
      return match
        ? `Boolean flag parameter \`${match[1]}\` — split into two clearly named functions`
        : undefined;
    },
  },
  {
    id: 'boolean-argument',
    appliesToComments: false,
    describe: (line) =>
      /\w+\s*\([^)]*,\s*(?:true|false)\s*\)/.test(line)
        ? 'Boolean literal passed as an argument — split into two clearly named functions'
        : undefined,
  },
  {
    id: 'magic-number',
    appliesToComments: false,
    describe: (line) => {
      const magic = line.match(new RegExp(`\\b\\d{${MIN_MAGIC_NUMBER_DIGITS},}\\b`));
      if (!magic) return undefined;
      if (/(?:const|readonly)\s+[A-Z][A-Z0-9_]*\s*[:=]/.test(line)) return undefined;
      return `Magic number \`${magic[0]}\` — extract a SCREAMING_SNAKE_CASE constant`;
    },
  },
  {
    id: 'thrown-string',
    readsRawText: true,
    appliesToComments: false,
    describe: (line) =>
      /throw\s+['"`]/.test(line) ? 'Throwing a string — use `throw new Error(...)`' : undefined,
  },
  {
    id: 'empty-catch',
    appliesToComments: false,
    describe: (line) =>
      /catch\s*\([^)]*\)\s*\{\s*\}/.test(line)
        ? 'Empty catch block — handle the error or re-throw it'
        : undefined,
  },
  {
    id: 'logged-error',
    appliesToComments: false,
    describe: (line) =>
      /console\.log\(\s*(?:e|err|error)\b/.test(line)
        ? '`console.log` on an error — use a logger or re-throw'
        : undefined,
  },
  {
    id: 'promise-any',
    appliesToComments: false,
    describe: (line) =>
      /Promise<any>/.test(line) ? '`Promise<any>` — type the resolved value' : undefined,
  },
  {
    id: 'single-letter-name',
    appliesToComments: false,
    describe: (line) => {
      const match = line.match(/\b(?:const|let|var)\s+([a-zA-Z])\s*[=:]/);
      if (!match || ALLOWED_SHORT_NAMES.has(match[1])) return undefined;
      return `Single-letter name \`${match[1]}\` — use a meaningful, searchable name`;
    },
  },
  {
    id: 'negative-name',
    appliesToComments: false,
    describe: (line) =>
      /function\s+\w*(?:Not|No)[A-Z]/.test(line) ||
      /(?:const|let|var)\s+\w*(?:Not|No)[A-Z]\w*\s*=\s*(?:function|\()/.test(line)
        ? "Negative name — use the positive form and negate with `!` at the call site"
        : undefined,
  },
  {
    id: 'commented-out-code',
    readsRawText: true,
    appliesToComments: true,
    describe: (line) =>
      /^\s*\/\/\s*(?:const|let|var|function|return|if|for|while|class|import|export)\b/.test(line)
        ? 'Commented-out code — delete it, git remembers'
        : undefined,
  },
  {
    id: 'positional-marker',
    readsRawText: true,
    appliesToComments: true,
    describe: (line) =>
      /^\s*\/\/\s*=====/.test(line) ? 'Positional marker comment — delete it' : undefined,
  },
];

function violationsOn({ lineNumber, text }) {
  const withinComment = isCommentLine(text);
  const code = codeOnly(text);

  return RULES.filter((rule) => rule.appliesToComments || !withinComment)
    .map((rule) => rule.describe(rule.readsRawText ? text : code))
    .filter(Boolean)
    .map((message) => `Line ${lineNumber}: ${message}`);
}

function linesFromWrite(toolInput) {
  const content = toolInput.content || '';
  return content.split('\n').map((text, index) => ({ lineNumber: index + 1, text }));
}

function linesFromEdit(toolInput, toolResponse) {
  const patches = toolResponse.structuredPatch || [];
  if (patches.length === 0) {
    const replacement = toolInput.new_string || '';
    return replacement.split('\n').map((text, index) => ({ lineNumber: index + 1, text }));
  }

  const added = [];
  for (const hunk of patches) {
    let lineNumber = hunk.newStart;
    for (const patchLine of hunk.lines) {
      if (patchLine.startsWith('+')) {
        added.push({ lineNumber, text: patchLine.slice(1) });
        lineNumber += 1;
      } else if (!patchLine.startsWith('-')) {
        lineNumber += 1;
      }
    }
  }
  return added;
}

function review(payload) {
  const toolInput = payload.tool_input || {};
  const toolResponse = payload.tool_response || {};

  const filePath = toolInput.file_path || toolResponse.filePath || '';
  if (!REVIEWED_EXTENSIONS.test(filePath)) return;

  const lines =
    payload.tool_name === 'Write'
      ? linesFromWrite(toolInput)
      : linesFromEdit(toolInput, toolResponse);

  const violations = lines.flatMap(violationsOn);
  if (violations.length === 0) return;

  const reason = [
    `clean-code-ts violations in ${path.basename(filePath)} (${violations.length}):`,
    ...violations.map((violation) => `  - ${violation}`),
    '',
    'Fix these now, in this file, before continuing. If one is a deliberate exception, say why.',
  ].join('\n');

  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    review(JSON.parse(input));
  } catch {
    // Never let a scanner bug block the session.
  }
  process.exit(0);
});