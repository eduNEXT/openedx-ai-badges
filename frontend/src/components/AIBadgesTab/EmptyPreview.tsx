import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../messages';

/**
 * Placeholder shown in the preview panel before a badge has been generated.
 */
const EmptyPreview = () => {
  const intl = useIntl();
  return (
    <div className="text-center py-5 text-muted m-auto">
      <span className="display-1">🎖️</span>
      <p className="small text-center">
        {intl.formatMessage(messages['openedx-ai-badges.badge-preview.placeholder'])}
      </p>
    </div>
  );
};

export default EmptyPreview;
