/** A single selectable option in the badge form. */
export interface FormOption {
  value: string;
  label: string | { id: string; defaultMessage: string };
}

/** Map of form field names to their selectable options. */
export interface FormOptionsMap {
  style: FormOption[];
  tone: FormOption[];
  level: FormOption[];
  criterion: FormOption[];
}

/** Selectable field keys (used to iterate over form option groups). */
export type SelectableFieldKey = keyof FormOptionsMap;

/** Shape of the badge generation form data. */
export interface BadgeFormData {
  style: string;
  tone: string;
  level: string;
  criterion: string;
  skillsEnabled: boolean;
}

/** Keys that can appear in the generated badge response. */
export type BadgeSectionKey = 'courseContext' | 'skills' | 'badge';

/** Detailed information for each generated section. */

export interface CourseContext {
  title?: string;
  description?: string;
  shortDescription?: string;
  [key: string]: unknown;
}

export interface SkillAlignment {
  type: string;
  targetType: string;
  targetName: string;
  targetDescription: string;
  targetUrl: string;
}

export interface SkillsData {
  alignment: SkillAlignment[];
}

export interface BadgeCriteria {
  narrative: string;
}

export interface BadgeData {
  name: string;
  description: string;
  criteria: BadgeCriteria;
  [key: string]: unknown;
}

/** Shape of the AI-generated badge response. */
export interface GeneratedBadge {
  courseContext?: CourseContext;
  skills?: SkillsData;
  badge?: BadgeData;
  [key: string]: unknown;
}

/** Payload sent to the workflow service for badge generation. */
export interface GeneratePayload {
  action: 'run';
  userInput: BadgeFormData;
}

/** Payload sent to the workflow service for saving a badge section. */
export interface SavePayload {
  action: 'save';
  userInput: {
    key: string;
    value: unknown;
  };
}

/** Union of all workflow payloads. */
export type WorkflowPayload = GeneratePayload | SavePayload;
