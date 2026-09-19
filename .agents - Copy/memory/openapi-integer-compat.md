---
name: OpenAPI integer type compatibility with zod v3
description: Using type: integer in openapi.yaml generates zod.int() which does not exist in zod v3.
---

## The rule
In `lib/api-spec/openapi.yaml`, always use `type: number` (not `type: integer`) for numeric fields.
For nullable numbers, use `type: ["number", "null"]` (not `type: ["integer", "null"]`).

**Why:** Orval maps OpenAPI `type: integer` to `zod.int()`. The workspace uses zod v3 (^3.25.76) where `zod.int()` does not exist — it was added in zod v4. This causes `Property 'int' does not exist on type 'typeof import(".../zod/index")'` errors during typecheck:libs after codegen.

**How to apply:** Use `type: number` everywhere. Frontend/backend validation of integer constraints can still be done with `zod.number().int()` in route handlers if needed.
