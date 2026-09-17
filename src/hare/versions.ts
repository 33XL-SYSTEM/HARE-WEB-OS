const NUM = /[0-9]/;

function splitVersion(v: string): (string | number)[] {
  const parts: (string | number)[] = [];
  let cur = '';
  for (const ch of v) {
    const numeric = NUM.test(ch);
    if (cur === '') {
      cur = ch;
      continue;
    }
    if (numeric !== NUM.test(cur[0])) {
      parts.push(NUM.test(cur[0]) ? parseInt(cur, 10) : cur);
      cur = ch;
      continue;
    }
    cur += ch;
  }
  if (cur !== '') parts.push(NUM.test(cur[0]) ? parseInt(cur, 10) : cur);
  return parts;
}

/** apt-like version comparison over dotted numeric segments. */
export function compareVersions(a: string, b: string): number {
  const pa = splitVersion(a);
  const pb = splitVersion(b);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (typeof x === 'number' && typeof y === 'number') {
      if (x !== y) return x < y ? -1 : 1;
    } else if (typeof x === 'string' && typeof y === 'string') {
      if (x !== y) return x < y ? -1 : 1;
    } else {
      return typeof x === 'number' ? -1 : 1;
    }
  }
  return 0;
}

export interface Constraint {
  name: string;
  op?: '=' | '>=' | '<=' | '>' | '<' | '~>';
  version?: string;
}

export function parseConstraint(spec: string): Constraint {
  const m = /^\s*([^\s<>=~]+)\s*(>=|<=|>|<|=|~>)?\s*([^\s]*)\s*$/.exec(spec);
  if (!m) return { name: spec.trim() };
  return {
    name: m[1]!,
    op: (m[2] as Constraint['op'] | undefined) ?? undefined,
    version: m[3] || undefined,
  };
}

export function matchesConstraint(constraint: Constraint, version: string): boolean {
  if (!constraint.op || !constraint.version) return true;
  const c = compareVersions(version, constraint.version);
  switch (constraint.op) {
    case '=':
      return c === 0;
    case '>=':
      return c >= 0;
    case '<=':
      return c <= 0;
    case '>':
      return c > 0;
    case '<':
      return c < 0;
    case '~>':
      return c >= 0;
  }
  return true;
}