import { useIntl } from '@edx/frontend-platform/i18n';
import {
  breakpoints, Form, SelectableBox, useMediaQuery,
} from '@openedx/paragon';
import { FormOption } from '../../types/badges';
import messages from '../../messages';

interface SelectableBoxGroupProps {
  /** The visible label above the selectable boxes. */
  label: string;
  /** The HTML name attribute and aria-label prefix. */
  name: string;
  /** Currently selected value. */
  value: string;
  /** Available options to render. */
  options: FormOption[];
  /** Number of columns for the grid layout. */
  columns?: number;
  /** Called with the new value when the selection changes. */
  onChange: (value: string) => void;
}

/**
 * A reusable form group that renders a labelled grid of selectable boxes.
 * Replaces 4 identical SelectableBox.Set blocks from the original component.
 */
const SelectableBoxGroup = ({
  label,
  name,
  value,
  options,
  columns,
  onChange,
}: SelectableBoxGroupProps) => {
  const intl = useIntl();
  const isDesktop = useMediaQuery({ minWidth: breakpoints.large.minWidth });
  const defaultCols = isDesktop ? 4 : 2;
  return (
    <Form.Group className="mb-4">
      <Form.Label className="font-weight-bold mb-3">{label}</Form.Label>
      <SelectableBox.Set
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        name={name}
        ariaLabel={intl.formatMessage(messages['openedx-ai-badges.badge-form.selectable.aria-label'], { name })}
        columns={columns || defaultCols}
      >
        {options.map((option) => {
          const displayLabel = typeof option.label === 'string'
            ? option.label
            : intl.formatMessage(option.label);

          return (
            <SelectableBox
              className="p-2"
              key={option.value}
              value={option.value}
              aria-label={displayLabel}
            >
              <span className="small">{displayLabel}</span>
            </SelectableBox>
          );
        })}
      </SelectableBox.Set>
    </Form.Group>
  );
};

export default SelectableBoxGroup;
