import { Form, SelectableBox } from '@openedx/paragon';
import { FormOption } from '../../types/badges';

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
  columns = 4,
  onChange,
}: SelectableBoxGroupProps) => (
  <Form.Group className="mb-4">
    <Form.Label className="font-weight-bold mb-3">{label}</Form.Label>
    <SelectableBox.Set
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      name={name}
      ariaLabel={`${name} selection`}
      columns={columns}
    >
      {options.map((option) => (
        <SelectableBox
          key={option.value}
          value={option.value}
          aria-label={option.label}
        >
          {option.label}
        </SelectableBox>
      ))}
    </SelectableBox.Set>
  </Form.Group>
);

export default SelectableBoxGroup;
