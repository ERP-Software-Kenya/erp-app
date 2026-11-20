# Android Release Setup

This runbook configures `erp-app` so every successful push or merge to `main` builds a signed APK with EAS and publishes it to a private Backblaze B2 bucket. Authenticated Web-ERP users retrieve release metadata and a short-lived download URL through Core APIs.

## Release output

The workflow publishes:

```text
releases/mobile/android/stable/<version>/<build-number>/erp-app.apk
releases/mobile/android/stable/latest/erp-app.apk
releases/mobile/android/stable/latest.json
```

The versioned APK is immutable. The `latest` APK and manifest are refreshed after every successful build.

## 1. Prepare Backblaze B2

1. Create a dedicated bucket such as `erp-mobile-releases`.
2. Keep the bucket private.
3. Create an application key restricted to this bucket with write access.
4. Copy the bucket's S3-compatible endpoint and region.

Do not reuse a broadly privileged account key. Do not put the B2 key or secret in the app, Web-ERP, or any `EXPO_PUBLIC_*`/`VITE_*` value. GitHub Actions needs a bucket-scoped write key; Core APIs should use a separate bucket-scoped read key.

## 2. Link and configure EAS once

Run these commands from `erp-app` using the Expo account that owns the production project:

```bash
npx eas login
npx eas init
npx eas build:configure
npx eas build:version:set
```

For version setup:

- choose Android;
- use the remote version source;
- initialize it to the last released Android `versionCode`, or `1` for the first release.

Create or verify the Android signing credentials:

```bash
npx eas credentials --platform android
```

Keep the same Android keystore for every release. Losing or changing it prevents a new APK from updating an existing installation.

The `release-apk` profile in `eas.json` uses the EAS `production` environment. Configure these EAS environment values:

```text
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
EXPO_PUBLIC_CENTRIFUGO_URL
EXPO_PUBLIC_RELEASE_CHANNEL=stable
EXPO_PUBLIC_RELEASE_CHECK_ENABLED=true
EXPO_PUBLIC_RELEASE_CHECK_INTERVAL_MS=21600000
```

The production API and WebSocket URLs must use HTTPS/WSS and must be reachable from physical Android devices.

## 3. Create an Expo access token

In the Expo account settings, create a personal access token for CI. Save it immediately; GitHub will store it as `EXPO_TOKEN`.

## 4. Configure the erp-app GitHub repository

Open **Settings → Secrets and variables → Actions**.

Add repository secrets:

| Secret | Value |
|---|---|
| `EXPO_TOKEN` | Expo personal access token |
| `B2_ACCESS_KEY_ID` | Bucket-scoped Backblaze key ID |
| `B2_SECRET_ACCESS_KEY` | Backblaze application key |

Add repository variables:

| Variable | Example |
|---|---|
| `B2_ENDPOINT` | `https://s3.us-west-004.backblazeb2.com` |
| `B2_REGION` | `us-west-004` |
| `B2_BUCKET` | `erp-mobile-releases` |

## 5. Configure Core APIs

Add the following production values to Core APIs using a read-only Backblaze application key:

```env
MOBILE_RELEASES_ENABLED=true
MOBILE_RELEASE_STORAGE_ENDPOINT=https://s3.<region>.backblazeb2.com
MOBILE_RELEASE_STORAGE_REGION=<region>
MOBILE_RELEASE_STORAGE_ACCESS_KEY_ID=<read-only-key-id>
MOBILE_RELEASE_STORAGE_SECRET_ACCESS_KEY=<read-only-application-key>
MOBILE_RELEASE_STORAGE_BUCKET=<bucket-name>
MOBILE_RELEASE_STORAGE_KEY_PREFIX=releases/mobile/android/stable
MOBILE_RELEASE_DOWNLOAD_URL_EXPIRY_SECONDS=300
```

Core APIs exposes authenticated metadata and download endpoints. Ensure the Web-ERP production origin is present in `CLERK_AUTHORIZED_PARTIES` so browser requests pass CORS and Clerk JWT validation.

## 6. Configure Web-ERP

Web-ERP only needs its existing production API and Clerk configuration:

```env
VITE_API_BASE_URL=https://<core-api-domain>
VITE_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
VITE_MOBILE_RELEASE_CHANNEL=stable
```

It must not receive a Backblaze URL or credential. Users sign in before Core APIs returns a five-minute signed download URL.

## 7. Create a release

Update the user-facing version in `app.json` when releasing a new semantic version:

```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

Merge the approved change into `main`. The **Release Android app** GitHub Actions workflow will:

1. install dependencies and validate TypeScript;
2. build a signed APK with EAS;
3. increment the remote Android build number;
4. calculate file size and SHA-256;
5. upload the immutable and `latest` artifacts;
6. publish `latest.json` and a workflow summary.

The workflow can also be started from **Actions → Release Android app → Run workflow**.

## 8. Verify the first release

Confirm that:

- the workflow uploads `latest.json` and `latest/erp-app.apk` to the private bucket;
- opening either Backblaze object URL without authentication is denied;
- the Web-ERP `/downloads` page shows the same metadata;
- signing out removes access to metadata and APK download;
- clicking download while signed in returns a temporary Backblaze URL;
- the APK installs on a clean Android device;
- a later build installs over the previous build without removing app data;
- Clerk login, warehouse workflows, driver tracking, and offline queue synchronization work on a physical device.

## Troubleshooting

### EAS project not found

Run `npx eas init`, commit the generated EAS project linkage in the Expo app configuration, and push it before running CI again.

### EAS cannot build non-interactively

Run one interactive Android build locally first so EAS can initialize and store the signing credentials:

```bash
npx eas build --platform android --profile release-apk
```

### Backblaze access denied

Verify that the application key is restricted to the correct bucket but has object write permission, and that `B2_ENDPOINT` and `B2_REGION` exactly match the bucket details.

### Web-ERP shows the release fallback

Verify Core APIs release configuration, confirm `MOBILE_RELEASES_ENABLED=true`, and check that its read-only Backblaze key can read `releases/mobile/android/stable/latest.json`.

### Users cannot update the installed app

Confirm that the Android package remains `com.erp.erpapp`, the same signing keystore was used, and the new EAS build number is greater than the installed build number.

## Rollback

Do not delete or overwrite versioned builds. To roll back, copy a known-good immutable APK to the `latest/erp-app.apk` key and publish a matching `latest.json`. Test the rollback APK first: Android normally rejects installing an APK with a lower build number over a newer installed version, so operational rollback may require publishing the known-good source as a new build with a higher build number.
