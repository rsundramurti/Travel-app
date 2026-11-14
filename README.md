# Our Hanoi Journey

Ray and Shay's shared trip board.

- **Website:** published automatically by GitHub Pages on every change (`Publish site` workflow).
- **Android app:** the `Build Android app` workflow puts `our-hanoi-journey.apk` under **Releases → app**.
- **Data:** stored in Supabase behind the shared password, with a daily copy in the `backups` table. `supabase/setup.sql` creates everything.
- **Backup file:** Customize → Backup → Save a backup file. Restore from a file adds the items back without deleting anything.
