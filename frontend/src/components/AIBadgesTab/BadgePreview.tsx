import React, { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import { GeneratedBadge, BadgeSectionKey } from '../../types/badges';
import SectionReviewCard from './SectionReviewCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyPreview from './EmptyPreview';
import messages from '../../messages';

const BADGE_SECTIONS: { key: BadgeSectionKey; title: { id: string; defaultMessage: string } }[] = [
  { key: 'badge', title: messages['openedx-ai-badges.badge-preview.badge.title'] },
  { key: 'courseContext', title: messages['openedx-ai-badges.badge-preview.course-context.title'] },
  { key: 'skills', title: messages['openedx-ai-badges.badge-preview.skills.title'] },
];

interface BadgePreviewProps {
  /** Whether a generation or save request is in progress. */
  isGenerating: boolean;
  /** The AI-generated badge data, or null. */
  generatedBadge: GeneratedBadge | null;
  /** Called when the user saves an individual section. */
  onSave: (key: BadgeSectionKey, value: unknown) => Promise<void>;
}

/**
 * Right panel of the AIBadgesTab — shows a loading spinner, empty state,
 * or formatted cards for each section of the generated badge.
 */
const BadgePreview = ({
  isGenerating,
  generatedBadge,
  onSave,
}: BadgePreviewProps) => {
  const intl = useIntl();
  const [editingSection, setEditingSection] = useState<BadgeSectionKey | null>(null);

  if (isGenerating && !generatedBadge) {
    return <LoadingSpinner />;
  }

  if (!generatedBadge) {
    return <EmptyPreview />;
  }

  const handleEdit = (key: BadgeSectionKey) => setEditingSection(key);
  const handleCancel = () => setEditingSection(null);

  const handleSave = async (key: BadgeSectionKey, value: unknown) => {
    // value here is the modified JSON from the child component
    await onSave(key, value);
    setEditingSection(null);
  };

  return (
    <Stack>
      {BADGE_SECTIONS.map(({ key, title }) => {
        const data = generatedBadge[key];
        if (!data) { return null; }

        // Focus Mode: Hide other cards if we are editing one
        if (editingSection && editingSection !== key) { return null; }

        return (
          <SectionReviewCard
            key={key}
            sectionKey={key}
            title={intl.formatMessage(title)}
            data={data}
            isEditing={editingSection === key}
            isSaving={isGenerating}
            onEdit={() => handleEdit(key)}
            onCancel={handleCancel}
            onSave={(updated) => handleSave(key, updated)}
          />
        );
      })}
    </Stack>
  );
};

export default BadgePreview;
