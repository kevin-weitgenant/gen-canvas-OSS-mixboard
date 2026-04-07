# Parallel Image Generation with Skeleton Loading

## Context

The user wants to implement parallel image generation from the modal where multiple prompts are created. Currently:

- The `BaseVariationsModal` generates multiple prompt variations but the "Generate images" button has no handler
- Single image generation works via `useImageGeneration` hook with SSE connections
- Images are positioned using `calculateViewportCenter` which centers them in the viewport
- Skeleton/placeholder states are already implemented for loading images

The goal is to execute all prompt generations in parallel and show skeleton placeholders centered on the canvas.

## Implementation Plan

### 1. Create Grid Layout Utility for Multiple Skeletons

**File:** `src/utils/viewport.ts`

Add a new function `calculateGridLayout` that positions multiple images in a grid pattern centered in the viewport. This prevents overlapping when generating multiple images simultaneously.

```typescript
export function calculateGridLayout(
  viewport: Viewport,
  imageSize: number,
  count: number
): { x: number; y: number }[] {
  // Calculate grid dimensions (e.g., 2x2 for 4 images, 3x3 for 9 images)
  // Return array of positions centered in viewport
}
```

### 2. Add Parallel Generation Hook

**File:** `src/hooks/useImageGeneration.ts`

Add a new function `generateImagesParallel` that:

- Takes an array of prompts with optional aspect ratios
- Creates skeleton placeholders for all images using grid layout positions
- Initiates SSE connections for all images in parallel
- Returns array of image IDs

### 3. Implement Generate Handler in BaseVariationsModal

**File:** `src/components/BaseVariationsModal.tsx`

Add `onGenerateImages` callback prop and wire up the "Generate images" button:

- Collect all prompts and their models
- Flatten into individual generation requests (prompt + model)
- Call parallel generation hook
- Close modal after initiating generation

### 4. Update Canvas Store for Batch Operations

**File:** `src/store/canvasStore.ts`

Add `addImages` batch action to efficiently add multiple images at once (optional optimization).

### 5. Wire Up PromptCreatorModal

**File:** `src/components/PromptCreatorModal.tsx`

Pass through the `onGenerateImages` handler to `BaseVariationsModal`.

### 6. Connect to Canvas Store

Update the parent component that renders `PromptCreatorModal` to provide the generation handler using `useImageGeneration` hook.

## Critical Files to Modify

1. `src/utils/viewport.ts` - Add `calculateGridLayout` function
2. `src/hooks/useImageGeneration.ts` - Add `generateImagesParallel` function
3. `src/components/BaseVariationsModal.tsx` - Add `onGenerateImages` prop and handler
4. `src/components/PromptCreatorModal.tsx` - Pass through handler
5. `src/store/canvasStore.ts` - Add `addImages` batch action (optional)

## Key Design Decisions (Based on User Selection)

- **Grid Layout**: Arrange images in a centered grid pattern (e.g., 2x2 for 4 images, 2x3 for 6 images, 3xN for more)
- **Parallel Execution**: All SSE connections fire simultaneously using existing SSE manager
- **Positioning**: Calculate positions once at skeleton creation; images stay in place as they load
- **User Experience**: Modal closes immediately after generation starts; users see skeletons on canvas right away
- **Error Handling**: Individual image failures don't affect other generations

## Verification

1. Open PromptCreatorModal and generate multiple prompt variations
2. Click "Generate X images" button
3. Verify:
   - All skeleton placeholders appear immediately on canvas in a grid layout
   - Grid is centered in viewport
   - Images load in parallel at different speeds
   - Loading states update independently per image
   - Modal closes after generation starts
