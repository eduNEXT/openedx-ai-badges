import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { WorkspacePremium } from '@openedx/paragon/icons';
import messages from '../../messages';

/**
 * Placeholder shown in the preview panel before a badge has been generated.
 */
const EmptyPreview = () => {
  const intl = useIntl();
  return (
    <div className="text-center py-5 text-muted m-auto">
      <Icon
        className="d-inline-block display-4"
        aria-hidden="true"
        src={WorkspacePremium}
        size="inline"
      />
      <p className="small text-center">
        {intl.formatMessage(messages['openedx-ai-badges.badge-preview.placeholder'])}
      </p>
    </div>
  );
};

export default EmptyPreview;
