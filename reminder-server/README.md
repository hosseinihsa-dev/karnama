# Karnama Android reminder service

## Cloudflare Workers

From this directory, install the dependencies with `npm install`, then run
`npx wrangler login` and approve the browser prompt for the target account.
`wrangler.toml` configures a SQLite-backed Durable Object per device. The object
sets a Cloudflare alarm for the next pending reminder and schedules the following
alarm after delivery. A running desktop or open browser tab is unnecessary.

Generate a VAPID key pair once with `npx web-push generate-vapid-keys`. Set
`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` with
`npx wrangler secret put <NAME>`. Keep the same key pair across deployments.
Run `npx wrangler deploy`, set `REMINDER_SERVICE_URL` in the frontend to the
resulting HTTPS URL, and publish Pages. Follow the Android verification below.

## Standalone Node.js

Run one persistent Node.js 24+ service behind an HTTPS reverse proxy. Mount persistent
storage for the SQLite database. GitHub Pages hosts the frontend and requires this
separate service to dispatch reminders when the browser is closed.

```sh
npm install
npx web-push generate-vapid-keys
npm start
```

Set environment variables before starting:

- `APP_ORIGIN` to `https://hosseinihsa-dev.github.io` for production.
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to the generated pair. Keep the private key in the hosting provider's secrets.
- `VAPID_SUBJECT` to a valid operator contact such as a `mailto:` address.
- `REMINDER_DB` to a writable path on persistent storage.
- `BIND` and `PORT` as needed by the hosting provider. Defaults are loopback and port 8080.

Set `REMINDER_SERVICE_URL` in `views.js` to the deployed HTTPS endpoint before
publishing Pages. On Android Chrome, enable reminders in the menu, create a task due
in under 15 minutes, close the PWA, and check that tapping the notification reopens it.
Test disabling reminders and editing or completing a scheduled task before its alert.

The client sends future reminder times, an anonymous device token, and the browser's
push subscription. Task titles and notes stay on the phone. Schedules cover up to 30 days
at a time and refresh when the app reconnects or the task list changes. The HTTPS proxy
should rate-limit requests to this public opt-in endpoint.
