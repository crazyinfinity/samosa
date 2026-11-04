# Security Specification: darkDVM Platform

## 1. Data Invariants

1. **RBAC & Zero Trust Admin Invariant**: Only authenticated users whose `uid` exists in the `/admins/$(request.auth.uid)` collection or has admin verification can create users, edit accounts, upload or modify materials, approve/reject/revoke permissions, and write audit logs.
2. **Student Isolation Invariant**: Students can read their own user record `/users/$(request.auth.uid)`, but cannot view other students' user documents or list the general `/users` collection.
3. **Strict Material Read Gating**: Students can only read a material document if an active `approved` permission exists for that specific `(studentUid, materialId)` tuple, OR if the reader is an admin.
4. **Immutable Identity**: Users cannot alter their own `role`, `accountStatus`, or `gradeAccess`.
5. **No Orphaned Permissions**: A permission record cannot exist without valid target student `uid` and `materialId`.
6. **No Client Role Escalation**: Students cannot write to `/admins` or update their role to `"admin"`.

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)

1. **Student Self-Promotion**: A student trying to update their own role from `"student"` to `"admin"`. (DENIED)
2. **Student Material Read Without Approval**: A student requesting `/materials/{materialId}` when no approved permission exists for their UID. (DENIED)
3. **Student Bypassing Status Check**: A student reading a material whose permission status is `"rejected"` or `"pending"`. (DENIED)
4. **Student Unauthorized Approval**: A student attempting to write to `/permissions/{permissionId}` setting `status: "approved"`. (DENIED)
5. **Unauthenticated Material Access**: Any unauthenticated read to `/materials` or `/permissions`. (DENIED)
6. **Cross-Student Profile Sniffing**: Student A attempting to read `/users/{studentB_Uid}`. (DENIED)
7. **Client Overwriting Audit Logs**: A client trying to forge or delete `/auditLogs`. (DENIED)
8. **Malicious Material Upload by Student**: Student attempting to create a document in `/materials`. (DENIED)
9. **Tampering with Permission Target**: Attempting to alter `uid` or `materialId` on an existing permission document. (DENIED)
10. **Re-activating Disabled Account**: Student attempting to alter `accountStatus` from `"disabled"` to `"active"`. (DENIED)
11. **Injecting Ghost Fields into User Record**: Writing unauthorized extra privilege fields. (DENIED)
12. **Blanket Query Scraping**: Running a collection query on `/users` or `/permissions` without UID restriction. (DENIED)
