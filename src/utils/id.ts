export function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
