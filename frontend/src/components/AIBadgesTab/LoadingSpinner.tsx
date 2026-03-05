import { useIntl } from '@edx/frontend-platform/i18n';
import { Spinner } from '@openedx/paragon';
import messages from '../../messages';

interface LoadingSpinnerProps {
  /** The message to display below the spinner. */
  message?: string;
}

/**
 * Centered loading spinner with an optional descriptive message.
 */
const LoadingSpinner = ({
  message,
}: LoadingSpinnerProps) => {
  const intl = useIntl();
  const displayMessage = message || intl.formatMessage(messages['openedx-ai-badges.badge-form.generating.message']);

  return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" role="status" screenReaderText={displayMessage} />
      <p className="mt-3 text-muted">
        {displayMessage}
      </p>
    </div>
  );
};

export default LoadingSpinner;
