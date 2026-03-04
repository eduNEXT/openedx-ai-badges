import { useIntl } from '@edx/frontend-platform/i18n';
import { GeneratedBadge, BadgeSectionKey } from '../../types/badges';
import EditableJsonCard from './EditableJsonCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyPreview from './EmptyPreview';
import messages from '../../messages';

const BADGE_SECTIONS: { key: BadgeSectionKey; title: string }[] = [
  { key: 'courseContext', title: messages['openedx-ai-badges.badge-preview.course-context.title'] },
  { key: 'skills', title: messages['openedx-ai-badges.badge-preview.skills.title'] },
  { key: 'badge', title: messages['openedx-ai-badges.badge-preview.badge.title'] },
];

interface BadgePreviewProps {
  /** Whether a generation or save request is in progress. */
  isGenerating: boolean;
  /** The AI-generated badge data, or null. */
  generatedBadge: GeneratedBadge | null;
  /** Called when the user saves an individual section. */
  onSave: (key: BadgeSectionKey, value: unknown) => Promise<void>;
  /** Called when the user edits a section locally in the textarea. */
  onUpdateSection: (key: BadgeSectionKey, value: unknown) => void;
}

/**
 * Right panel of the AIBadgesTab — shows a loading spinner, empty state,
 * or editable JSON cards for each section of the generated badge.
 */
const BadgePreview = ({
  isGenerating,
  generatedBadge,
  onSave,
  onUpdateSection,
}: BadgePreviewProps) => {
  const intl = useIntl();

  if (isGenerating) {
    return <LoadingSpinner />;
  }

  if (!generatedBadge) {
    return <EmptyPreview />;
  }

  return (
    <div className="w-100 p-4 d-flex flex-column gap-4 align-items-center">
      {BADGE_SECTIONS.map(({ key, title }) => (generatedBadge[key] ? (
        <EditableJsonCard
          key={key}
          title={intl.formatMessage(title)}
          data={generatedBadge[key]}
          onDataChange={(updated) => onUpdateSection(key, updated)}
          onSave={() => onSave(key, generatedBadge[key])}
          isSaving={isGenerating}
        />
      ) : null))}
    </div>
  );
};

export default BadgePreview;
