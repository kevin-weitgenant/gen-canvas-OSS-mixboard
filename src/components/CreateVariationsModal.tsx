import { useState, useEffect } from 'react';
import { BaseVariationsModal } from './BaseVariationsModal';
import { useCanvasStore } from '../store/canvasStore';

interface CreateVariationsModalProps {
  imageId: string;
  onClose: () => void;
}

export function CreateVariationsModal({ imageId, onClose }: CreateVariationsModalProps) {
  const images = useCanvasStore((state) => state.images);
  const image = images.find((img) => img.id === imageId);

  const isGenerated = image?.source?.type === 'generated';
  const originalPrompt = image?.source?.prompt || '';
  const imageSrc = image?.src || '';

  // Local state for base prompt (editable)
  const [basePrompt, setBasePrompt] = useState(originalPrompt || '');

  return (
    <BaseVariationsModal
      onClose={onClose}
      basePrompt={basePrompt}
      baseImageSrc={imageSrc}
      isGenerated={isGenerated}
      title="Create Variations"
      description="Generate multiple variations of the image"
    />
  );
}
