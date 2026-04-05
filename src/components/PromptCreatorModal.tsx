import { BaseVariationsModal } from './BaseVariationsModal';

interface PromptCreatorModalProps {
  onClose: () => void;
}

export function PromptCreatorModal({ onClose }: PromptCreatorModalProps) {
  return (
    <BaseVariationsModal
      onClose={onClose}
      title="Generate multiple images"
      description="Generate multiple prompt variations"
      instructionPlaceholder="Describe the images you want to generate..."
      stepLabel="Describe what you want to create"
      variationLabel="Prompt"
      emptyInstructionPlaceholder="I want to generate a logo for my app that is about finding job oportunities in posts"
      instructionLabel="Prompt instruction"
    />
  );
}
