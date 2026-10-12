# Supabase integration boundary

The first build is **local play**, as requested. It does not sign in anonymously, send email, upload local progress, or synchronize devices. `lib/supabase` and the migration are preparation, not a working cloud integration. Adding environment variables alone does not activate sync.

For the separate integration step:

1. Create a Supabase project, review and apply the migration on a development database, and enable anonymous authentication. Confirm RLS isolation with two anonymous users before any production use. The migration has not been executed in this cloud environment.
2. Set the public URL and publishable key in `.env.local` inside the project. Never expose a service-role key to the client. Add the development and deployment URLs to the auth redirect allowlist.
3. Add `@supabase/ssr` session-refresh middleware and anonymous bootstrap, with an explicit local-to-cloud migration choice. Never upload another browser user's cartridge silently.
4. Implement TanStack Query reads and a persisted, identity-scoped mutation queue. The existing Query provider is installed; the current Zustand store is browser persistence, not a server queue. Replay idempotent inserts with the database constraints and preserve immutable day results.
5. Add transactional RPCs for `GREATEST` target ratchets, first-completion rest locking, rolling-seven-day rest limits, validated timezone/day boundaries, and settlement. Client-only read-modify-write snapshots are insufficient across devices. The prepared schema protects ownership and result immutability, but does not yet enforce the full economy against a malicious client.
6. Test simultaneous settlement, stale task edits, offline undo/reconnect, anonymous-to-email upgrade in place, account deletion and sign out. Only then expose account controls in Settings.
7. Background push is a later milestone: VAPID credentials, permission opt-in, subscription storage, scheduled Edge Function delivery and iOS install guidance. None of those are silently enabled in local play.

Derived levels, streaks and badges should remain computed from immutable results. Keep daily `timezone`, task snapshots, first-completion status, peak XP and difficulty persisted; they cannot be reconstructed safely from today's mutable tasks.
