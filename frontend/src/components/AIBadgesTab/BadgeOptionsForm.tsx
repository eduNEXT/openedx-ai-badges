import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@openedx/paragon';
import { BadgeFormData, SelectableFieldKey } from '../../types/badges';
import { FORM_OPTIONS } from '../../constants/formOptions';
import SelectableBoxGroup from './SelectableBoxGroup';
import messages from '../../messages';

/** Renders bold text for internationalized messages. */
const Bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const Br = () => <br />;

interface BadgeOptionsFormProps {
  /** Current form data. */
  formData: BadgeFormData;
  /** Called with the field name and new value when any field changes. */
  onChange: (field: keyof BadgeFormData, value: string | boolean) => void;
  /** Called when the user clicks "Generate Badge". */
  onGenerate: () => void;
  /** Whether a generation request is in progress. */
  isGenerating: boolean;
  /** Error message from the last generation attempt, if any. */
  generationError: string | null;
}

/** Ordered list of selectable fields to render. */
const SELECTABLE_FIELDS: SelectableFieldKey[] = ['style', 'tone', 'level', 'criterion'];

/**
 * Left panel of the AIBadgesTab — contains the badge configuration form
 * (style, tone, level, criterion selectors), a skills toggle, and the
 * generate button.
 */
const BadgeOptionsForm = ({
  formData,
  onChange,
  onGenerate,
  isGenerating,
  generationError,
}: BadgeOptionsFormProps) => {
  const intl = useIntl();

  /** Dynamic labels for each selectable field, translated via intl. */
  const fieldLabels: Record<SelectableFieldKey, string> = {
    style: intl.formatMessage(messages['openedx-ai-badges.badge-form.style.label']),
    tone: intl.formatMessage(messages['openedx-ai-badges.badge-form.tone.label']),
    level: intl.formatMessage(messages['openedx-ai-badges.badge-form.level.label']),
    criterion: intl.formatMessage(messages['openedx-ai-badges.badge-form.criterion.label']),
  };

  return (
    <div className="d-flex flex-column">
      <h2 className="mb-4 text-primary">
        {intl.formatMessage(messages['openedx-ai-badges.badge-form.header'])}
      </h2>
      <p>
        {intl.formatMessage(messages['openedx-ai-badges.badge-form.description'], {
          bold: Bold,
          br: Br,
        })}
      </p>

      <Form className="badge-form">
        {SELECTABLE_FIELDS.map((field) => (
          <SelectableBoxGroup
            key={field}
            label={fieldLabels[field]}
            name={field}
            value={formData[field]}
            options={FORM_OPTIONS[field]}
            onChange={(value) => onChange(field, value)}
          />
        ))}

        {/* Skills Toggle Switch */}
        <Form.Group className="mb-4">

          <Form.Switch
            id="skills-toggle"
            checked={formData.skillsEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('skillsEnabled', e.target.checked)}
          >
            {intl.formatMessage(messages['openedx-ai-badges.badge-form.skills.label'])}
          </Form.Switch>
          <Form.Text className="d-block mt-2 text-muted">
            {intl.formatMessage(messages['openedx-ai-badges.badge-form.skills.description.short'])}
          </Form.Text>
        </Form.Group>

        <div className="mt-auto d-flex justify-content-start">
          <StatefulButton
            state={isGenerating ? 'pending' : 'default'}
            onClick={onGenerate}
            disabled={isGenerating}
            labels={{
              default: intl.formatMessage(messages['openedx-ai-badges.badge-form.button.generate']),
              pending: intl.formatMessage(messages['openedx-ai-badges.badge-form.generating.message']),
              complete: intl.formatMessage(messages['openedx-ai-badges.badge-form.button.generate']),
            }}
          />
        </div>

        {generationError && (
          <div className="mt-3 text-danger small" role="alert">
            {intl.formatMessage(messages['openedx-ai-badges.error.generic'])}
          </div>
        )}
      </Form>
    </div>
  );
};

export default BadgeOptionsForm;
