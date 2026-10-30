#!/usr/bin/env node
/* CodeLedger generated runtime forwarder — runtime.json is the installation authority. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {resolveRuntimePin, compareRuntimeVersions} = (() => {
/** Strict SemVer 2.0, shared by pin validation and explicit installation. */
function parseRuntimeVersion(value) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
  if (!match || match[0] !== value) throw new Error(`Invalid runtime version: ${value}. Use an exact semantic version.`);
  const core = match.slice(1, 4).map(Number);
  const prerelease = match[4]?.split('.') ?? [];
  if (core.some((n) => !Number.isSafeInteger(n)) || prerelease.some((p) => /^\d+$/.test(p) && (p.length > 1 && p.startsWith('0')))) {
    throw new Error(`Invalid runtime version: ${value}`);
  }
  return { core, prerelease };
}

function compareRuntimeVersions(left, right) {
  const a = parseRuntimeVersion(left);
  const b = parseRuntimeVersion(right);
  for (let i = 0; i < 3; i++) {
    if (a.core[i] !== b.core[i]) return a.core[i] < b.core[i] ? -1 : 1;
  }
  if (!a.prerelease.length || !b.prerelease.length) {
    return a.prerelease.length === b.prerelease.length ? 0 : a.prerelease.length ? -1 : 1;
  }
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const x = a.prerelease[i];
    const y = b.prerelease[i];
    if (x === y) continue;
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    const xn = /^\d+$/.test(x);
    const yn = /^\d+$/.test(y);
    if (xn && yn) return x.length !== y.length ? (x.length < y.length ? -1 : 1) : x < y ? -1 : 1;
    if (xn !== yn) return xn ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

function runtimeGenerationSha256(bytes, notices, crypto) {
  return crypto.createHash('sha256').update(String(bytes.length) + ':').update(bytes).update(notices === null ? '-1:' : String(notices.length) + ':').update(notices || Buffer.alloc(0)).digest('hex');
}

function resolveRuntimePin(
  codeledgerDir,
  io,
  compare,
) {
  const manifestPath = io.path.join(codeledgerDir, 'runtime.json');
  if (!io.fs.existsSync(manifestPath)) return null;
  if (io.fs.lstatSync(codeledgerDir).isSymbolicLink() || io.fs.lstatSync(manifestPath).isSymbolicLink()) throw new Error('Runtime state must not be symlinked. Run codeledger vendor from the owning repository.');
  if (io.fs.statSync(manifestPath).size > 65536) throw new Error('runtime.json exceeds its 64 KiB contract bound. Repair with codeledger vendor.');
  let raw;
  try { raw = JSON.parse(io.fs.readFileSync(manifestPath, 'utf8')); } catch (error) { throw new Error('.codeledger/runtime.json is not valid JSON (' + error.message + '). Restore it from version control, or repair with codeledger vendor.'); }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid runtime.json: expected an object. Repair with codeledger vendor.');
  const m = raw;
  if (m.schema_version !== 'codeledger/runtime/v1' || typeof m.installation_id !== 'string' || typeof m.version !== 'string' || typeof m.min_runtime !== 'string'
    || typeof m.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(m.sha256)
    || (m.distribution !== 'full' && m.distribution !== 'open') || !['fail-open-v1', 'legacy'].includes(m.hook_contract)
    || !m.source || typeof m.source.kind !== 'string' || typeof m.source.location !== 'string'
    || !m.build || m.build.content_sha256 !== m.sha256 || (m.build.revision !== null && typeof m.build.revision !== 'string')
    || (m.build.source_dirty !== undefined && m.build.source_dirty !== null && typeof m.build.source_dirty !== 'boolean')
    || (m.build.generation_sha256 === undefined && m.build.legal_sha256 !== undefined)
    || (m.build.generation_sha256 !== undefined && (typeof m.build.generation_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(m.build.generation_sha256) || (m.build.legal_sha256 !== null && !/^[a-f0-9]{64}$/.test(m.build.legal_sha256))))
    || typeof m.entrypoint !== 'string' || m.entrypoint !== `bin/runtime/${m.version}-${m.build.generation_sha256 || m.sha256}/codeledger-standalone.cjs`) {
    throw new Error('Invalid runtime.json contract. Repair with codeledger vendor.');
  }
  for (const reference of [m.previous, m.migration_fallback]) {
    if (reference === undefined) continue;
    if (!reference || typeof reference !== 'object' || !/^[a-f0-9]{64}$/.test(reference.sha256) || typeof reference.entrypoint !== 'string') throw new Error('Invalid previous runtime reference. Repair with codeledger vendor.');
    if (reference.version !== null) compare(reference.version, reference.version);
    const generation = reference.generation_sha256 || reference.sha256;
    if (!/^[a-f0-9]{64}$/.test(generation) || (reference.entrypoint !== `bin/runtime/legacy-${reference.sha256}/codeledger-standalone.cjs` && (reference.version === null || reference.entrypoint !== `bin/runtime/${reference.version}-${generation}/codeledger-standalone.cjs`))) throw new Error('Invalid previous runtime path. Repair with codeledger vendor.');
  }
  if (compare(m.version, m.min_runtime) < 0) throw new Error('Pinned runtime is older than its configuration contract. Run codeledger upgrade.');
  if (compare(m.version, '0.10.82-0') >= 0 && m.build.generation_sha256 === undefined) throw new Error('Runtime generation identity is missing. Repair with codeledger vendor.');
  const root = io.fs.realpathSync(codeledgerDir);
  if (!io.fs.existsSync(io.path.resolve(root, m.entrypoint))) throw new Error('Pinned runtime is missing: .codeledger/' + m.entrypoint + '. Restore it from version control (git checkout -- .codeledger/bin), or repair with codeledger vendor.');
  const runtimePath = io.fs.realpathSync(io.path.resolve(root, m.entrypoint));
  const rel = io.path.relative(root, runtimePath);
  if (rel.startsWith('..') || io.path.isAbsolute(rel) || runtimePath !== io.path.resolve(root, m.entrypoint) || !io.fs.statSync(runtimePath).isFile()) {
    throw new Error('Pinned runtime escapes the repository. Repair with codeledger vendor.');
  }
  const bytes = io.fs.readFileSync(runtimePath);
  if (io.crypto.createHash('sha256').update(bytes).digest('hex') !== m.sha256) {
    throw new Error('Pinned runtime checksum mismatch. Repair with codeledger vendor; do not execute the modified artifact.');
  }
  if (m.build.generation_sha256 !== undefined) {
    let notices = null;
    if (m.build.legal_sha256 !== null) {
      const legal = runtimePath + '.LEGAL.txt';
      if (!io.fs.existsSync(legal)) throw new Error('Pinned notices are missing: ' + legal + '. Restore them from version control, or repair with codeledger vendor.');
      if (io.fs.lstatSync(legal).isSymbolicLink()) throw new Error('Pinned notices must not be symlinked. Repair with codeledger vendor.');
      notices = io.fs.readFileSync(legal);
      if (io.crypto.createHash('sha256').update(notices).digest('hex') !== m.build.legal_sha256) throw new Error('Pinned notices checksum mismatch. Repair with codeledger vendor.');
    }
    if (runtimeGenerationSha256(bytes, notices, io.crypto) !== m.build.generation_sha256) throw new Error('Pinned generation checksum mismatch. Repair with codeledger vendor.');
  }
  const header = bytes.subarray(0, 65536).toString('utf8');
  const version = /^\/\* CODELEDGER_STANDALONE_VERSION:([^\s*]+) \*\//m.exec(header)?.[1];
  const flavor = header.includes('/* CodeLedger Open CLI') ? 'open' : header.includes('/* CodeLedger Standalone CLI') ? 'full' : null;
  if (version !== m.version || flavor !== m.distribution) throw new Error('Pinned runtime version or distribution does not match runtime.json.');
  return { manifest: m, path: runtimePath };
}


function runtimeTrustKey(root, manifest, io) {
  return io.crypto.createHash('sha256').update(JSON.stringify([io.fs.realpathSync(root), manifest])).digest('hex');
}
function isRuntimePinTrusted(root, manifest, io, trustDir) {
  if (!trustDir || trustDir === 'disabled') return false;
  try {
    const directory = io.fs.realpathSync(trustDir);
    const repo = io.fs.realpathSync(root);
    const relative = io.path.relative(repo, directory);
    if (!relative || (!relative.startsWith('..' + io.path.sep) && relative !== '..' && !io.path.isAbsolute(relative))) return false;
    const key = runtimeTrustKey(root, manifest, io);
    const file = io.path.join(directory, key + '.json');
    const stat = io.fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) return false;
    const receipt = JSON.parse(io.fs.readFileSync(file, 'utf8'));
    return receipt.schema === 1 && receipt.key === key;
  } catch { return false; }
}
return {parseRuntimeVersion, compareRuntimeVersions, resolveRuntimePin, runtimeGenerationSha256, runtimeTrustKey, isRuntimePinTrusted};
})();
try {
  const codeledgerDir = path.resolve(path.dirname(process.argv[1]), '..');
  const pin = resolveRuntimePin(codeledgerDir, {fs, path, crypto}, compareRuntimeVersions);
  let selected = pin && pin.path;
  const fallback = {"version":"0.10.80","sha256":"448d451fbb9857d988804ec66b34b605610613bdb5177d8128121874353b7b20","entrypoint":"bin/runtime/legacy-448d451fbb9857d988804ec66b34b605610613bdb5177d8128121874353b7b20/codeledger-standalone.cjs"};
  if (!selected && fallback) {
    const root = fs.realpathSync(codeledgerDir);
    const expected = path.resolve(root, fallback.entrypoint);
    const previous = fs.realpathSync(expected);
    const relative = path.relative(root, previous);
    if (previous !== expected || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Legacy fallback escapes the repository. Repair with codeledger vendor.');
    if (crypto.createHash('sha256').update(fs.readFileSync(previous)).digest('hex') !== fallback.sha256) throw new Error('Legacy migration checksum mismatch. Run codeledger vendor to repair.');
    selected = previous;
  }
  if (!selected) throw new Error('runtime.json is missing. Run the installed codeledger vendor command to repair this repository.');
  process.env.CODELEDGER_DELEGATED = '1';
  process.argv[1] = selected;
  require(selected);
} catch (error) {
  process.stderr.write('codeledger: ' + error.message + '\n');
  process.exitCode = 1;
}
