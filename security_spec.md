# App Store Security Specification

## Data Invariants
1. **Application Schema Rigor**: Only valid fields defined in the database schema can be written. Shadows or injected properties are strictly blocked.
2. **Admin-Locked Editing**: All metadata modifications, category insertions, and app deletions are locked behind authorized admin identity.
3. **Download Auditing Sandbox**: Anonymous users can increment the `downloads` counter, but they cannot edit APK files, descriptions, banners, or any other data.
4. **ID Sanitization**: App and category slug IDs must follow the `^[a-zA-Z0-9_\-]+$` regex and be limited to standard sizes.

## Relational Hierarchy & Actions
- `/categories/{categoryId}`:
  - Read: Public (anyone can list categories)
  - Write (Create, Update, Delete): Authenticated Admin Only

- `/apps/{appId}`:
  - Read: Public (anyone can browse and view app details)
  - Create/Delete: Authenticated Admin Only
  - Update: Authenticated Admin OR Public Action (only modifying `downloads` by exactly `+1`)

- `/admins/{adminId}`:
  - Read/Write: Locked (can only be configured through system console or default super-user check)

## Invariant Payloads for Rules Testing (The Dirty Dozen)
Below are 12 malicious payloads that our security rules will block:
1. Public attacker tries to overwrite `apkUrl` of a popular app (Expected: Permission Denied).
2. Public attacker tries to delete a published app (Expected: Permission Denied).
3. Public attacker tries to inject extra properties (e.g., `injected_field`) while updating download count (Expected: Permission Denied).
4. Public attacker tries to increment download count by more than 1 (e.g., set downloads to 1,000,000) (Expected: Permission Denied).
5. Public attacker tries to decrement download count (Expected: Permission Denied).
6. Non-admin signed-in user tries to create a new category (Expected: Permission Denied).
7. Non-admin signed-in user tries to set their own profile role as admin (Expected: Permission Denied).
8. Admin with extremely long, malicious string for app ID (e.g., 20KB junk data) (Expected: Permission Denied).
9. Attacker tries to create an app with empty required fields (Expected: Permission Denied).
10. Attacker tries to update an app's category with an invalid, non-alphanumeric value (Expected: Permission Denied).
11. Public user tries to perform batch edits across multiple apps' metadata (Expected: Permission Denied).
12. Attacker tries to read private admin registry logs or access control documents (Expected: Permission Denied).
