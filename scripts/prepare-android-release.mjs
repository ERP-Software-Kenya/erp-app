import { createHash } from 'node:crypto';
import { createReadStream, readFileSync, statSync, writeFileSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { Readable } from 'node:stream';

const requiredEnv = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const buildJsonPath = requiredEnv('BUILD_JSON_PATH');
const apkPath = requiredEnv('APK_PATH');
const metadataPath = requiredEnv('RELEASE_METADATA_PATH');
const keyPrefix = requiredEnv('RELEASE_KEY_PREFIX').replace(/^\/+|\/+$/g, '');

const parsed = JSON.parse(readFileSync(buildJsonPath, 'utf8'));
const build = Array.isArray(parsed) ? parsed[0] : parsed;
const artifactUrl = build?.artifacts?.buildUrl;

if (!artifactUrl || !/^https:\/\//i.test(artifactUrl)) {
  throw new Error('EAS build did not return a valid HTTPS APK artifact URL');
}

const response = await fetch(artifactUrl, { redirect: 'follow' });
if (!response.ok || !response.body) {
  throw new Error(`Unable to download EAS artifact: HTTP ${response.status}`);
}

await finished(Readable.fromWeb(response.body).pipe((await import('node:fs')).createWriteStream(apkPath)));

const hash = createHash('sha256');
await new Promise((resolve, reject) => {
  const stream = createReadStream(apkPath);
  stream.on('data', (chunk) => hash.update(chunk));
  stream.once('end', resolve);
  stream.once('error', reject);
});

const version = String(build.appVersion ?? '1.0.0');
const buildNumber = String(build.appBuildVersion ?? build.id ?? process.env.GITHUB_RUN_NUMBER ?? '1');
const artifactKey = `${keyPrefix}/latest/erp-app.apk`;

const metadata = {
  application: 'erp-app',
  platform: 'android',
  channel: 'stable',
  version,
  buildNumber,
  sizeBytes: statSync(apkPath).size,
  sha256: hash.digest('hex'),
  publishedAt: new Date().toISOString(),
  artifactKey,
  gitCommit: process.env.GITHUB_SHA ?? null,
  easBuildId: build.id ?? null,
};

writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
console.log(`Prepared Android ${version} (${buildNumber}) for publication`);
