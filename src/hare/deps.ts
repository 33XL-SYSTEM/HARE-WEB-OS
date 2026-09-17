import type { InstalledRecord, PackageMeta } from './types';
import {
  compareVersions,
  matchesConstraint,
  parseConstraint,
  type Constraint,
} from './versions';

export interface Resolution {
  ok: boolean;
  error?: string;
  order: PackageMeta[];
  already: string[];
  auto: Set<string>;
  recommended: string[];
  upgrades: PackageMeta[];
}

export interface RemovePlan {
  ok: boolean;
  error?: string;
  order: string[];
}

/** An installed record satisfies a dependency constraint (name or provided). */
function installedSatisfies(
  installed: Map<string, InstalledRecord>,
  constraint: Constraint,
): InstalledRecord | null {
  for (const rec of installed.values()) {
    const matchName = rec.name === constraint.name || rec.provides.includes(constraint.name);
    if (!matchName) continue;
    if (!constraint.version || matchesConstraint(constraint, rec.version)) return rec;
  }
  return null;
}

function candidatesFor(
  available: Map<string, PackageMeta[]>,
  name: string,
): PackageMeta[] {
  const direct = available.get(name) ?? [];
  const viaProvides: PackageMeta[] = [];
  for (const metas of available.values()) {
    for (const m of metas) {
      if (m.provides.includes(name)) viaProvides.push(m);
    }
  }
  const merged = [...direct, ...viaProvides].filter(
    (m, i, arr) => arr.findIndex((x) => x.name === m.name) === i,
  );
  return merged.sort((a, b) => compareVersions(b.version, a.version));
}

/**
 * Resolves an install request into an ordered plan (dependencies first).
 * Handles version constraints, provides, conflicts, cycles and recommends.
 * Targets given without a constraint upgrade an installed older package.
 */
export function planInstall(
  installed: Map<string, InstalledRecord>,
  available: Map<string, PackageMeta[]>,
  specs: string[],
): Resolution {
  const order: PackageMeta[] = [];
  const planned = new Map<string, PackageMeta>();
  const already: string[] = [];
  const auto = new Set<string>();
  const recommended: string[] = [];
  const upgrades: PackageMeta[] = [];
  let error: string | null = null;

  const plannedPresents = (): Set<string> => {
    const s = new Set<string>();
    for (const m of planned.values()) {
      s.add(m.name);
      for (const p of m.provides) s.add(p);
    }
    return s;
  };

  const installedPresents = (): Set<string> => {
    const s = new Set<string>();
    for (const rec of installed.values()) {
      s.add(rec.name);
      for (const p of rec.provides) s.add(p);
    }
    return s;
  };

  const add = (
    meta: PackageMeta,
    isAuto: boolean,
    path: string[],
  ): void => {
    if (error) return;
    if (path.includes(meta.name)) {
      error = `CYCLE DETECTED: ${[...path, meta.name].join(' -> ')}`;
      return;
    }
    if (planned.has(meta.name)) return;

    const present = new Set<string>([...installedPresents(), ...plannedPresents()]);
    for (const conflict of meta.conflicts) {
      if (present.has(conflict)) {
        error = `CONFLICT: ${meta.name} conflicts with ${conflict} (already installed or selected)`;
        return;
      }
    }

    const prev = installed.get(meta.name);
    planned.set(meta.name, meta);
    order.push(meta);
    if (isAuto) auto.add(meta.name);
    if (prev && compareVersions(meta.version, prev.version) > 0) upgrades.push(meta);

    for (const dep of meta.depends) {
      expand(dep, true, [...path, meta.name]);
    }
    for (const rec of meta.recommends) {
      const before = error;
      error = null;
      expand(rec, true, [...path, meta.name]);
      if (error) {
        recommended.push(`recommend ${rec} could not be satisfied: ${error}`);
        error = before;
      }
    }
  };

  const expand = (spec: string, isAuto: boolean, path: string[]): void => {
    if (error) return;
    const constraint = parseConstraint(spec);

    const satisfied = installedSatisfies(installed, constraint);
    if (satisfied) {
      if (!isAuto && satisfied.name === constraint.name) {
        already.push(`${constraint.name} is already installed (${satisfied.version})`);
      }
      return;
    }

    const plannedRec = planned.get(constraint.name);
    if (plannedRec && (!constraint.version || matchesConstraint(constraint, plannedRec.version))) {
      return;
    }

    const candidates = candidatesFor(available, constraint.name).filter(
      (m) => !constraint.version || matchesConstraint(constraint, m.version),
    );
    if (candidates.length === 0) {
      error = `DEPENDENCY ERROR: ${constraint.name} has no installable candidate in enabled repositories`;
      return;
    }

    const installedAny = installed.get(constraint.name);
    if (installedAny && compareVersions(candidates[0]!.version, installedAny.version) <= 0) {
      already.push(`${constraint.name} is already the newest version (${installedAny.version})`);
      return;
    }

    add(candidates[0]!, isAuto, path);
  };

  for (const spec of specs) {
    if (error) break;
    expand(spec, false, []);
  }

  if (error) {
    return {
      ok: false,
      error,
      order: [],
      already,
      auto,
      recommended,
      upgrades,
    };
  }
  return { ok: true, order, already, auto, recommended, upgrades };
}

function dependents(
  installed: Map<string, InstalledRecord>,
  target: InstalledRecord,
): InstalledRecord[] {
  const targetNames = new Set<string>([target.name, ...target.provides]);
  const out: InstalledRecord[] = [];
  for (const rec of installed.values()) {
    if (rec.name === target.name) continue;
    const hits = rec.depends.some((d) => targetNames.has(parseConstraint(d).name));
    if (hits) out.push(rec);
  }
  return out;
}

export function planRemove(
  installed: Map<string, InstalledRecord>,
  names: string[],
  force = false,
): RemovePlan {
  const requested = names.map((n) => parseConstraint(n).name);
  const missed = requested.filter((n) => !installed.has(n));
  if (missed.length > 0) {
    return {
      ok: false,
      error: `package(s) are not installed: ${missed.join(', ')}`,
      order: [],
    };
  }
  const order: string[] = [];
  const seen = new Set<string>();
  const visit = (name: string): void => {
    if (seen.has(name)) return;
    const rec = installed.get(name);
    if (!rec) return;
    const deps = dependents(installed, rec).filter((d) => !seen.has(d.name));
    if (deps.length > 0 && !force) {
      return; // handles below via error
    }
    for (const dep of deps) visit(dep.name);
    seen.add(name);
    order.push(name);
  };
  let blocked = false;
  for (const name of requested) {
    const deps = dependents(installed, installed.get(name)!);
    if (deps.length > 0 && !force) blocked = true;
  }
  if (blocked) {
    const namesRequired: string[] = [];
    for (const name of requested) {
      for (const dep of dependents(installed, installed.get(name)!)) {
        namesRequired.push(`${dep.name} depends on ${name}`);
      }
    }
    return {
      ok: false,
      error: `the following packages depend on the requested ones and must be removed first (or use --force):\n  ${namesRequired.join('\n  ')}`,
      order: [],
    };
  }
  for (const name of requested) visit(name);
  return { ok: true, order };
}

export function listUpgradable(
  installed: Map<string, InstalledRecord>,
  available: Map<string, PackageMeta[]>,
): PackageMeta[] {
  const out: PackageMeta[] = [];
  for (const rec of installed.values()) {
    const cands = candidatesFor(available, rec.name).filter(
      (m) => compareVersions(m.version, rec.version) > 0,
    );
    if (cands.length > 0) out.push(cands[0]!);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function collectAutoremovable(
  installed: Map<string, InstalledRecord>,
): InstalledRecord[] {
  const manual = [...installed.values()].filter((r) => !r.auto);
  const autoRecs = [...installed.values()].filter((r) => r.auto);
  if (autoRecs.length === 0) return [];

  const satisfiesWith = (name: string): boolean =>
    [...installed.values()].some((r) => r.name === name || r.provides.includes(name));

  const required = new Set<string>();
  for (const r of manual) {
    required.add(r.name);
    for (const p of r.provides) required.add(p);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const rec of installed.values()) {
      const needed =
        required.has(rec.name) || rec.provides.some((p) => required.has(p));
      if (!needed) continue;
      for (const dep of rec.depends) {
        const dn = parseConstraint(dep).name;
        if (!required.has(dn) && satisfiesWith(dn)) {
          required.add(dn);
          changed = true;
        }
      }
    }
  }

  return autoRecs.filter((r) => !required.has(r.name));
}