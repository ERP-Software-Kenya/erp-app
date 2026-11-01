import axios from 'axios';

const BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');

export type ReleaseMetadata = {
  application: string;
  platform: string;
  channel: string;
  version: string;
  buildNumber: string;
  sizeBytes: number;
  sha256: string;
  publishedAt: string;
};

export async function getLatestRelease(): Promise<ReleaseMetadata> {
  const { data } = await axios.get<ReleaseMetadata>(`${BASE}/v1/mobile-releases/latest`);
  return data;
}

export async function createReleaseDownloadUrl(): Promise<string> {
  const { data } = await axios.post<{ url: string; expiresAt: string }>(
    `${BASE}/v1/mobile-releases/latest/download`,
  );
  return data.url;
}
