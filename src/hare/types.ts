export interface Repository {
  name: string;
  url: string;
  kind: 'embedded' | 'http';
  enabled: boolean;
  description: string;
}

export interface PackageMeta {
  name: string;
  version: string;
  arch: string;
  summary: string;
  description: string;
  depends: string[];
  recommends: string[];
  provides: string[];
  conflicts: string[];
  repo: string;
  size: number;
}

export interface PackageFileEntry {
  path: string;
  content: string;
  mode?: number;
}

export interface PackageBundle extends PackageMeta {
  files: PackageFileEntry[];
}

export interface InstalledRecord {
  name: string;
  version: string;
  arch: string;
  summary: string;
  depends: string[];
  provides: string[];
  conflicts: string[];
  files: string[];
  repo: string;
  auto: boolean;
  installedAt: number;
}

export type PkgState = 'installed' | 'upgradable' | 'available' | 'orphan' | 'unknown';

export interface ActionReport {
  ok: boolean;
  summary: string;
  details: string[];
  changed: string[];
}

export const PM_ROOT = '/workspace/.hare';
export const PM_DB_PATH = `${PM_ROOT}/db/packages.json`;
export const PM_REPOS_PATH = `${PM_ROOT}/repos.json`;
export const PM_LISTS_DIR = `${PM_ROOT}/lists`;
export const PM_LOG_PATH = `${PM_ROOT}/logs/pm.log`;