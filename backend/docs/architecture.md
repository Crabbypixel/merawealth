Authentication Model

A Session or OTP Log belongs to exactly one authenticated identity.

Rules:
- CLIENT → userId is set, adminId is NULL.
- ADMIN → adminId is set, userId is NULL.
- role must always match the populated foreign key.
- Both foreign keys must never be populated simultaneously.
- Both foreign keys must never be NULL.