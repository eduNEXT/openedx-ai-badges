import { useState, useCallback } from 'react';
import { services } from '@openedx/openedx-ai-extensions-ui';
import { BadgeFormData, GeneratedBadge, BadgeSectionKey } from '../types/badges';

interface UseBadgeGenerationReturn {
  /** Whether a generation or save request is in flight. */
  isGenerating: boolean;
  /** The error message from the last failed request, or null. */
  generationError: string | null;
  /** The AI-generated badge data, or null if not yet generated. */
  generatedBadge: GeneratedBadge | null;
  /** Trigger badge generation with the given form data. */
  handleGenerate: (formData: BadgeFormData) => Promise<void>;
  /** Save an individual section of the generated badge. */
  handleSave: (key: BadgeSectionKey, value: unknown) => Promise<void>;
  /** Locally update a badge section (e.g. from textarea edits). */
  updateBadgeSection: (key: BadgeSectionKey, value: unknown) => void;
}

/**
 * Custom hook that encapsulates all badge generation and saving logic.
 *
 * Centralises the duplicated workflow calls, response parsing, and
 * error handling that were previously inlined 4× in AIBadgesTab.
 */
export const useBadgeGeneration = (
  courseId: string | null,
  uiSlotSelectorId: string | null = 'authoring-resources-ai-badge-creator-modal',
  locationId?: string | null,
): UseBadgeGenerationReturn => {
  const contextData = services.prepareContextData({ uiSlotSelectorId, courseId, locationId });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<any>(null);
  const [generatedBadge, setGeneratedBadge] = useState<GeneratedBadge | null>(null);

  /**
   * Internal helper — calls the workflow service and updates state.
   */
  const callWorkflow = useCallback(
    async (action: string, userInput: unknown) => {
      setIsGenerating(true);
      setGenerationError(null);

      try {
        const result = await services.callWorkflowService({
          payload: { action, userInput },
          context: contextData,
        });

        // Convert backend snake_case to frontend camelCase
        setGeneratedBadge(result.response as GeneratedBadge);
      } catch (error: unknown) {
        setGenerationError(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [contextData],
  );

  /** Generate a new badge using the form data. */
  const handleGenerate = useCallback(
    (formData: BadgeFormData) => callWorkflow('run', formData),
    [callWorkflow],
  );

  /** Save an individual section back to the backend. */
  const handleSave = useCallback(
    (key: BadgeSectionKey, value: unknown) => {
      // Backend expects snake_case keys
      const backendKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return callWorkflow('save', { key: backendKey, value });
    },
    [callWorkflow],
  );

  /** Update a badge section locally without hitting the backend. */
  const updateBadgeSection = useCallback(
    (key: BadgeSectionKey, value: unknown) => {
      setGeneratedBadge((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  return {
    isGenerating,
    generationError,
    generatedBadge,
    handleGenerate,
    handleSave,
    updateBadgeSection,
  };
};
