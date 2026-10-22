# Deploy TeleTerm game 24/7 on Render

This Blueprint deploys the existing Express app as one paid, single-instance web service in Singapore. It serves the current `public/` game client and `/ws/world` from the same HTTPS origin, and keeps profile/session files on a persistent disk.

## Deploy

1. Push this repository to a GitHub repository and connect it to Render.
2. In Render, choose **New → Blueprint** and select the repository. Render reads `render.yaml`; review the paid `standard` web-service plan and persistent disk before creating it.
3. During setup, provide the OAuth client ID/secret values for Google and GitHub. At least one configured provider is required for sign-in. The secrets are entered in Render, not committed here.
4. After the first deploy, open the generated `https://<service>.onrender.com` address and configure the matching OAuth redirect URI for each provider:

   ```text
   https://<service>.onrender.com/api/auth/desktop/callback
   ```

5. Set `TELETERM_OWNER_IDS` in Render to the project owner's verified identity, for example `google:<provider-subject>` or `github:<provider-user-id>`. If a custom domain is added later, update `TELETERM_PUBLIC_ORIGIN` to that exact HTTPS origin and add the matching callback URI in the OAuth provider settings.
6. Open the game from two browsers and verify sign-in, player visibility, chat, movement, and reconnect after briefly disabling one browser's network.

Render supplies the listening `PORT` and TLS. The game client selects `wss://` automatically when opened over HTTPS. Keep this service at one instance for now: live world/room state is held in server memory and is not shared between instances.

## Notes

- This uses a paid plan because free web services can sleep; Render currently maps `standard` to 1 CPU and 2 GB RAM. Confirm the current amount on the Render creation screen before enabling it.
- The persistent disk is mounted at `/var/data` through `TELETERM_USER_DATA_PATH`. Back it up before deleting/recreating the service.
- Deploys, host maintenance, and network failures can briefly disconnect players; the game reconnects, but this is not a promise of zero downtime.
- Owner-only terminal/admin routes, if used on this deployment, operate inside the Render Linux container. They do not control the developer's Windows PC.
