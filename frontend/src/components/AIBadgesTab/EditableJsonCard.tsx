import { useIntl } from '@edx/frontend-platform/i18n';
import { Card, Button, Form } from '@openedx/paragon';
import messages from '../../messages';

interface EditableJsonCardProps {
  /** Card header title. */
  title: string;
  /** The data to display as JSON in the textarea. */
  data: unknown;
  /** Called with the updated value whenever the textarea content changes. */
  onDataChange: (updated: unknown) => void;
  /** Called when the user clicks the Save button. */
  onSave: () => void;
  /** Whether a save operation is in progress (disables the button). */
  isSaving?: boolean;
}

/**
 * A reusable card component that displays editable JSON data in a textarea
 * and provides a Save button to persist changes.
 *
 * Replaces 3 identical ~55-line blocks from the original AIBadgesTab.
 */
const EditableJsonCard = ({
  title,
  data,
  onDataChange,
  onSave,
  isSaving = false,
}: EditableJsonCardProps) => {
  const intl = useIntl();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    try {
      onDataChange(JSON.parse(value));
    } catch {
      // If the user is mid-edit and the JSON is invalid, store as raw string
      onDataChange(value);
    }
  };

  return (
    <Card className="flex-grow-1">
      <Card.Header title={title} />
      <Card.Section className="d-flex flex-column h-100">
        <Form.Control
          as="textarea"
          size="sm"
          controlClassName="h-100 text-monospace"
          className="flex-grow-1"
          aria-label={intl.formatMessage(messages['openedx-ai-badges.badge-preview.edit.aria-label'], { section: title })}
          value={JSON.stringify(data, null, 2)}
          onChange={handleTextChange}
        />
        <Button
          variant="primary"
          size="sm"
          className="mt-2"
          onClick={onSave}
          disabled={isSaving}
        >
          {intl.formatMessage(messages['openedx-ai-badges.badge-preview.save.button'])}
        </Button>
      </Card.Section>
    </Card>
  );
};

export default EditableJsonCard;
