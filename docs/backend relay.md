# Architecture Redesign: API Key Security for Parallel Image Generation

## Context

The current architecture has a security concern: **the user's API key is sent from the frontend to the backend**, which means your backend server receives and temporarily handles the user's private API credentials. This creates unnecessary security liability.

**Current Flow:**

1. Frontend retrieves API key from localStorage
2. Frontend sends API key to backend in request body (`/api/generate`)
3. Backend uses the API key to call Kie.ai API
4. Backend returns task ID and SSE URL
5. Kie.ai sends webhooks directly to your backend
6. Backend forwards webhooks to frontend via SSE

**Goal:** Keep webhook functionality and parallel generation capability while ensuring your backend **never receives or handles** the user's API key.

---

## Recommended Solution: Client-Side Task Creation with Backend Relay

### High-Level Architecture

The solution reverses the responsibility: **the frontend calls Kie.ai directly** using the user's API key, while your backend acts only as a **webhook relay** to SSE connections.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEW FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Frontend: Create SSE session on backend                                  │
│     POST /api/sse-session → returns { sessionId, webhookUrl }                │
│                                                                              │
│  2. Frontend: Call Kie.ai API directly with user's API key                  │
│     POST https://api.kie.ai/api/v1/jobs/createTask                           │
│     Body: { callBackUrl: backend webhook URL, ... }                          │
│     Headers: { Authorization: "Bearer <user_api_key>" }                      │
│                                                                              │
│  3. Kie.ai: Send webhook to backend                                          │
│     POST {webhookUrl}/{sessionId}                                            │
│                                                                              │
│  4. Backend: Relay webhook to frontend via SSE                               │
│     SSE sends event to connected client                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Two-Step Flow**: Frontend first creates an SSE session, then uses that session's webhook URL when calling Kie.ai directly

2. **Backend as Relay**: Backend only manages SSE connections and forwards webhook payloads - never sees API keys

3. **Parallel Generation**: Frontend creates multiple SSE sessions and makes parallel requests to Kie.ai

4. **No Backend API Key Storage**: User's API key never leaves the browser except in direct calls to Kie.ai

---

## Implementation Plan

**IMPORTANT: Execute phases in order. Each phase builds on the previous one.**

### Phase 1: Backend Changes

#### 1.1 Create New SSE Session Endpoint

**File**: `server/routers/sse_session.py` (new)

Create a new endpoint that generates an SSE session with a dedicated webhook URL:

```python
@router.post("/sse-session")
async def create_sse_session():
    """
    Create an SSE session for receiving webhook callbacks.

    The frontend will use the returned webhookUrl when calling Kie.ai directly.
    The backend never sees the user's API key.
    """
    session_id = str(uuid.uuid4())
    await sse_manager.create_connection(session_id)

    webhook_url = f"{settings.server_url}/webhook/{session_id}"

    return {
        "sessionId": session_id,
        "webhookUrl": webhook_url,
        "sseUrl": f"/sse/{session_id}"
    }
```

#### 1.2 Remove Old Generate Endpoint

**File**: `server/routers/generate.py`

**DELETE THIS FILE ENTIRELY** - The old endpoint that receives API keys is no longer needed.

Also remove the router registration from **`server/main.py`**:

```python
# REMOVE this line:
from routers.generate import router as generate_router
app.include_router(generate_router, prefix="/api", tags=["generate"])
```

#### 1.3 Webhook Remains Unchanged

**File**: `server/routers/webhook.py`

No changes needed - the existing webhook handler already forwards payloads to SSE connections without needing API keys.

#### 1.4 Update OpenAPI Schema

**File**: `server/main.py`

Ensure the new endpoint is included in the OpenAPI schema for Orval generation.

---

### Phase 2: Regenerate Frontend API Client

**IMPORTANT: Complete Phase 1 first. The new endpoint must exist in the backend before regenerating.**

**Run**:

```bash
pnpm run generate:api
```

This will regenerate `src/api/generated.ts` and `src/api/models/`:

- `generateImageApiGeneratePost` function will be removed automatically
- `GenerateRequest` interface will be removed automatically
- `createSseSessionApiSseSessionPost` function will be added automatically
- `SseSessionResponse` interface will be added automatically

**Verify**:

```bash
pnpm type-check
```

---

### Phase 3: Frontend Changes

#### 3.1 Rewrite Image Generation Hook

**File**: `src/hooks/useImageGeneration.ts` (REWRITE existing file)

**OLD CODE TO REMOVE** (lines 42-52):

```typescript
const apiKey = getApiKey();
if (!apiKey) {
  throw new Error('API key is required. Please add your Kie.ai API key.');
}

const response = await generateImageApiGeneratePost({
  prompt,
  aspect_ratio: aspectRatio,
  api_key: apiKey,  // <-- This sends key to backend
} satisfies GenerateRequest);

if (response.status !== 200) {
  throw new Error('Failed to generate image');
}

const { taskId, sseUrl } = response.data;
```

**NEW CODE TO ADD**:

```typescript
// 1. Create SSE session via Orval-generated client
const sessionResponse = await createSseSessionApiSseSessionPost();
if (sessionResponse.status !== 200) {
  throw new Error('Failed to create SSE session');
}
const { sessionId, webhookUrl, sseUrl } = sessionResponse.data;

// 2. Get API key and call Kie.ai directly (NOT via backend)
const apiKey = getApiKey();
if (!apiKey) {
  throw new Error('API key is required. Please add your Kie.ai API key.');
}

await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'z-image',
    callBackUrl: webhookUrl,  // Backend's webhook URL
    input: {
      prompt,
      aspect_ratio: aspectRatio,
      nsfw_checker: false
    }
  })
});

// 3. Connect to SSE (rest of the code unchanged)
```

**Import changes**:

- REMOVE: `import { generateImageApiGeneratePost } from '../api/generated';`
- REMOVE: `import type { GenerateRequest } from '../api/models';`
- ADD: `import { createSseSessionApiSseSessionPost } from '../api/generated';`

#### 3.2 Update Batch Generation Hook

**File**: `src/hooks/useBatchImageGeneration.ts`

**OLD CODE TO REMOVE** (lines 114-129):

```typescript
const response = await generateImageApiGeneratePost({
  prompt: config.prompt,
  aspect_ratio: config.aspectRatio || '1:1',
  api_key: apiKey,  // <-- Sending key to backend
} satisfies GenerateRequest);

if (response.status !== 200) {
  throw new Error('Failed to generate image');
}

const { sseUrl } = response.data;
```

**NEW CODE TO ADD**:

```typescript
// Create SSE session for each image
const sessionResponse = await createSseSessionApiSseSessionPost();
if (sessionResponse.status !== 200) {
  throw new Error('Failed to create SSE session');
}
const { webhookUrl, sseUrl } = sessionResponse.data;

// Call Kie.ai directly
await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'z-image',
    callBackUrl: webhookUrl,
    input: {
      prompt: config.prompt,
      aspect_ratio: config.aspectRatio || '1:1',
      nsfw_checker: false
    }
  })
});
```

**Import changes** (line 9):

- REMOVE: `import { generateImageApiGeneratePost } from '../api/generated';`
- REMOVE: `import type { GenerateRequest } from '../api/models';`
- ADD: `import { createSseSessionApiSseSessionPost } from '../api/generated';`

---

### Phase 4: Cleanup

#### 4.1 Remove Old Backend Files and Code

**DELETE** `server/routers/generate.py` - Entire file removed

**MODIFY** `server/schemas/requests.py`:

- DELETE the `GenerateRequest` class (no longer needed)

**MODIFY** `server/schemas/responses.py`:

- DELETE the `GenerateResponse` class (no longer needed)

#### 4.2 Verify No TypeScript Errors

```bash
pnpm type-check
```

All old imports should have been removed in Phase 3. If any errors remain:

- Check for remaining `generateImageApiGeneratePost` references
- Check for remaining `GenerateRequest` type references

#### 4.3 Verify No References to Old Code

**Search and remove any remaining references**:

```bash
# In frontend
grep -r "generateImageApiGeneratePost" src/
grep -r "GenerateRequest" src/

# Should return no results after cleanup
```

---

## Critical Files to Modify

### Backend

| File                            | Action | Details                               |
| ------------------------------- | ------ | ------------------------------------- |
| `server/routers/sse_session.py` | CREATE | New endpoint for SSE session creation |
| `server/routers/generate.py`    | DELETE | Remove old endpoint                   |
| `server/main.py`                | MODIFY | Register new router, remove old one   |
| `server/schemas/responses.py`   | MODIFY | Add `SseSessionResponse`, remove old  |
| `server/schemas/requests.py`    | MODIFY | Remove `GenerateRequest`              |

### Frontend

| File                                   | Action         | Details                          |
| -------------------------------------- | -------------- | -------------------------------- |
| `src/hooks/useImageGeneration.ts`      | REWRITE        | Use new flow, remove old imports |
| `src/hooks/useBatchImageGeneration.ts` | MODIFY         | Use new flow, remove old imports |
| `src/api/generated.ts`                 | REGENERATE     | Run `pnpm run generate:api`      |
| `src/api/models/`                      | AUTO-GENERATED | Orval creates new models         |

### Configuration

| File              | Action    | Details                 |
| ----------------- | --------- | ----------------------- |
| `orval.config.ts` | NO CHANGE | Auto-reads from OpenAPI |

---

## Verification Plan

### 1. Backend Verification

```bash
# Start backend server
cd server && uv run uvicorn main:app --reload

# Check OpenAPI schema includes new endpoint
curl http://localhost:8000/openapi.json | grep "sse-session"

# Test SSE session creation
curl -X POST http://localhost:8000/api/sse-session
```

### 2. Frontend Verification

```bash
# Regenerate API client
pnpm run generate:api

# Check TypeScript compilation
pnpm type-check
```

### 3. End-to-End Testing

1. Open application in browser
2. Enter valid Kie.ai API key
3. Generate a single image - verify:
   - API key is NOT in backend logs
   - Image generates successfully
   - SSE events are received
4. Generate multiple images in parallel - verify:
   - All images generate concurrently
   - SSE connections are independent
   - No API key leakage to backend

### 4. Security Verification

Check browser Network tab:

- Request to `/api/sse-session` should NOT contain API key
- Request to `api.kie.ai` should contain `Authorization: Bearer <key>`
- No API key in any request to your backend

---

## Security Benefits

1. **Zero-Knowledge Backend**: Your backend never sees user API keys
2. **Reduced Liability**: No need to secure or handle third-party credentials
3. **Compliance**: Easier to comply with security audits
4. **User Trust**: Users' keys stay in their browser context

## Trade-offs

1. **CORS Consideration**: Kie.ai must allow direct browser calls (verify this)
2. **Error Handling**: Client needs to handle Kie.ai errors directly
3. **Rate Limiting**: Backend can no longer centrally manage rate limits (if needed)

---

## Work Estimation

**IMPORTANT: Phases must be completed in order. Each phase depends on the previous one.**

### Phase 1: Backend Changes (~30-45 minutes)

| Task                                                             | Estimated Time |
| ---------------------------------------------------------------- | -------------- |
| Create `server/routers/sse_session.py` with new endpoint         | 10 min         |
| Add `SseSessionResponse` schema to `server/schemas/responses.py` | 5 min          |
| Delete `server/routers/generate.py`                              | 2 min          |
| Remove `GenerateRequest` and `GenerateResponse` schemas          | 5 min          |
| Update `server/main.py` to register new router, remove old       | 5 min          |
| Test backend endpoint locally                                    | 10 min         |
| Verify OpenAPI schema                                            | 5 min          |

### Phase 2: Regenerate API Client (~5 minutes)

| Task                                              | Estimated Time |
| ------------------------------------------------- | -------------- |
| Run `pnpm run generate:api` after backend changes | 2 min          |
| Verify new types are generated                    | 3 min          |

### Phase 3: Frontend Changes (~35-50 minutes)

| Task                                          | Estimated Time |
| --------------------------------------------- | -------------- |
| Rewrite `src/hooks/useImageGeneration.ts`     | 20 min         |
| Modify `src/hooks/useBatchImageGeneration.ts` | 15 min         |
| Fix TypeScript errors                         | 5-10 min       |

### Phase 4: Cleanup & Verification (~20 minutes)

| Task                               | Estimated Time |
| ---------------------------------- | -------------- |
| End-to-end testing of single image | 10 min         |
| End-to-end testing of batch images | 10 min         |

### Total Estimated Time: **1.5-2 hours**

**Breakdown:**

- Phase 1 (Backend): ~30-45 min
- Phase 2 (Orval): ~5 min
- Phase 3 (Frontend): ~35-50 min
- Phase 4 (Cleanup/Testing): ~20 min

**Risk Level:** Low

- Changes are isolated to image generation flow
- SSE and webhook handling remain unchanged
- Can test incrementally (backend first, then frontend)
