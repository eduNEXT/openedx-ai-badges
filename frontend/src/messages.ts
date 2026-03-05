import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Badge Form options labels
  'openedx-ai-badges.badge-form.selectable.aria-label': {
    id: 'openedx-ai-badges.badge-form.selectable.aria-label',
    defaultMessage: '{name} selection',
    description: 'Aria label for a group of selectable options',
  },

  'openedx-ai-badges.badge-form.style.label': {
    id: 'openedx-ai-badges.badge-form.style.label',
    defaultMessage: 'Badge Style',
    description: 'Label for badge style selection',
  },
  'openedx-ai-badges.badge-form.style.modern': {
    id: 'openedx-ai-badges.badge-form.style.modern',
    defaultMessage: 'Modern',
    description: 'Modern badge style option',
  },
  'openedx-ai-badges.badge-form.style.classic': {
    id: 'openedx-ai-badges.badge-form.style.classic',
    defaultMessage: 'Classic',
    description: 'Classic badge style option',
  },
  'openedx-ai-badges.badge-form.style.minimalist': {
    id: 'openedx-ai-badges.badge-form.style.minimalist',
    defaultMessage: 'Minimalist',
    description: 'Minimalist badge style option',
  },
  'openedx-ai-badges.badge-form.style.playful': {
    id: 'openedx-ai-badges.badge-form.style.playful',
    defaultMessage: 'Playful',
    description: 'Playful badge style option',
  },
  'openedx-ai-badges.badge-form.tone.label': {
    id: 'openedx-ai-badges.badge-form.tone.label',
    defaultMessage: 'Badge Tone',
    description: 'Label for badge tone selection',
  },
  'openedx-ai-badges.badge-form.tone.professional': {
    id: 'openedx-ai-badges.badge-form.tone.professional',
    defaultMessage: 'Professional',
    description: 'Professional badge tone option',
  },
  'openedx-ai-badges.badge-form.tone.friendly': {
    id: 'openedx-ai-badges.badge-form.tone.friendly',
    defaultMessage: 'Friendly',
    description: 'Friendly badge tone option',
  },
  'openedx-ai-badges.badge-form.tone.academic': {
    id: 'openedx-ai-badges.badge-form.tone.academic',
    defaultMessage: 'Academic',
    description: 'Academic badge tone option',
  },
  'openedx-ai-badges.badge-form.tone.creative': {
    id: 'openedx-ai-badges.badge-form.tone.creative',
    defaultMessage: 'Creative',
    description: 'Creative badge tone option',
  },
  'openedx-ai-badges.badge-form.level.label': {
    id: 'openedx-ai-badges.badge-form.level.label',
    defaultMessage: 'Badge Level',
    description: 'Label for badge level selection',
  },
  'openedx-ai-badges.badge-form.level.beginner': {
    id: 'openedx-ai-badges.badge-form.level.beginner',
    defaultMessage: 'Beginner',
    description: 'Beginner badge level option',
  },
  'openedx-ai-badges.badge-form.level.intermediate': {
    id: 'openedx-ai-badges.badge-form.level.intermediate',
    defaultMessage: 'Intermediate',
    description: 'Intermediate badge level option',
  },
  'openedx-ai-badges.badge-form.level.advanced': {
    id: 'openedx-ai-badges.badge-form.level.advanced',
    defaultMessage: 'Advanced',
    description: 'Advanced badge level option',
  },
  'openedx-ai-badges.badge-form.level.expert': {
    id: 'openedx-ai-badges.badge-form.level.expert',
    defaultMessage: 'Expert',
    description: 'Expert badge level option',
  },
  'openedx-ai-badges.badge-form.criterion.label': {
    id: 'openedx-ai-badges.badge-form.criterion.label',
    defaultMessage: 'Badge Criterion',
    description: 'Label for badge criterion selection',
  },
  'openedx-ai-badges.badge-form.criterion.completion': {
    id: 'openedx-ai-badges.badge-form.criterion.completion',
    defaultMessage: 'Completion',
    description: 'Completion criterion option',
  },
  'openedx-ai-badges.badge-form.criterion.mastery': {
    id: 'openedx-ai-badges.badge-form.criterion.mastery',
    defaultMessage: 'Mastery',
    description: 'Mastery criterion option',
  },
  'openedx-ai-badges.badge-form.criterion.participation': {
    id: 'openedx-ai-badges.badge-form.criterion.participation',
    defaultMessage: 'Participation',
    description: 'Participation criterion option',
  },
  'openedx-ai-badges.badge-form.criterion.excellence': {
    id: 'openedx-ai-badges.badge-form.criterion.excellence',
    defaultMessage: 'Excellence',
    description: 'Excellence criterion option',
  },
  'openedx-ai-badges.badge-form.skills.label': {
    id: 'openedx-ai-badges.badge-form.skills.label',
    defaultMessage: 'Extract Skills',
    description: 'Label for skill extraction toggle',
  },
  'openedx-ai-badges.badge-form.description.label': {
    id: 'openedx-ai-badges.badge-form.description.label',
    defaultMessage: 'Additional Description',
    description: 'Label for additional badge description field',
  },
  'openedx-ai-badges.badge-form.description.placeholder': {
    id: 'openedx-ai-badges.badge-form.description.placeholder',
    defaultMessage: 'Provide any additional context or details about this badge',
    description: 'Placeholder text for description textarea',
  },
  'openedx-ai-badges.badge-form.button.generate': {
    id: 'openedx-ai-badges.badge-form.button.generate',
    defaultMessage: 'Generate Badge',
    description: 'Button to generate badge',
  },
  'openedx-ai-badges.badge-form.generating.message': {
    id: 'openedx-ai-badges.badge-form.generating.message',
    defaultMessage: 'Please wait while AI creates your badge',
    description: 'Message shown during generation',
  },
  'openedx-ai-badges.badge-form.error.required-field': {
    id: 'openedx-ai-badges.badge-form.error.required-field',
    defaultMessage: 'This field is required',
    description: 'Error for required field',
  },

  // Badge Preview Placeholder
  'openedx-ai-badges.badge-preview.placeholder': {
    id: 'openedx-ai-badges.badge-preview.placeholder',
    defaultMessage: 'Your badge preview will appear here',
    description: 'Placeholder text shown in the preview panel before a badge is generated',
  },

  // Missing messages for AIBadgesTab
  'openedx-ai-badges.badge-form.header': {
    id: 'openedx-ai-badges.badge-form.header',
    defaultMessage: 'Badge Generator',
    description: 'Header for the badge generator form',
  },
  'openedx-ai-badges.badge-form.description': {
    id: 'openedx-ai-badges.badge-form.description',
    defaultMessage: 'This tab allows you to generate <bold>Open Badges 3.0</bold> following the official standard. The system automatically extracts real information from your course, including the title, description, and overview by default. <br></br> The extraction process and the final output are highly configurable via the <bold>AI Workflow Profile</bold>.',
    description: 'First paragraph of the badge generator description',
  },
  'openedx-ai-badges.badge-form.skills.description.short': {
    id: 'openedx-ai-badges.badge-form.skills.description.short',
    defaultMessage: 'Automatically extract and align skills from the badge',
    description: 'Short description for skill extraction toggle',
  },
  'openedx-ai-badges.badge-preview.course-context.title': {
    id: 'openedx-ai-badges.badge-preview.course-context.title',
    defaultMessage: 'Course Context',
    description: 'Title for the course context section in the preview',
  },
  'openedx-ai-badges.badge-preview.skills.title': {
    id: 'openedx-ai-badges.badge-preview.skills.title',
    defaultMessage: 'Skills',
    description: 'Title for the skills section in the preview',
  },
  'openedx-ai-badges.badge-preview.badge.title': {
    id: 'openedx-ai-badges.badge-preview.badge.title',
    defaultMessage: 'Badge',
    description: 'Title for the badge section in the preview',
  },
  'openedx-ai-badges.badge-preview.save.button': {
    id: 'openedx-ai-badges.badge-preview.save.button',
    defaultMessage: 'Save',
    description: 'Button label for saving a badge section',
  },
  'openedx-ai-badges.badge-preview.edit.aria-label': {
    id: 'openedx-ai-badges.badge-preview.edit.aria-label',
    defaultMessage: 'Edit {section} JSON',
    description: 'Aria label for the JSON editor textarea',
  },
  'openedx-ai-badges.badge-preview.edit.button': {
    id: 'openedx-ai-badges.badge-preview.edit.button',
    defaultMessage: 'Edit',
    description: 'Label for the edit button',
  },
  'openedx-ai-badges.badge-preview.edit.button.aria': {
    id: 'openedx-ai-badges.badge-preview.edit.button.aria',
    defaultMessage: 'Edit {section} section',
    description: 'Aria label for the edit button',
  },
  'openedx-ai-badges.badge-preview.cancel.button': {
    id: 'openedx-ai-badges.badge-preview.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Label for the cancel button',
  },
  'openedx-ai-badges.badge-preview.skills.target-name': {
    id: 'openedx-ai-badges.badge-preview.skills.target-name',
    defaultMessage: 'Skill Name',
    description: 'Label for skill name',
  },
  'openedx-ai-badges.badge-preview.skills.target-description': {
    id: 'openedx-ai-badges.badge-preview.skills.target-description',
    defaultMessage: 'Description',
    description: 'Label for skill description',
  },
  'openedx-ai-badges.badge-preview.skills.target-type': {
    id: 'openedx-ai-badges.badge-preview.skills.target-type',
    defaultMessage: 'Type',
    description: 'Label for skill type',
  },
  'openedx-ai-badges.badge-preview.badge.criteria': {
    id: 'openedx-ai-badges.badge-preview.badge.criteria',
    defaultMessage: 'Criteria',
    description: 'Label for badge criteria narrative',
  },
  'openedx-ai-badges.badge-preview.edit.error': {
    id: 'openedx-ai-badges.badge-preview.edit.error',
    defaultMessage: 'Invalid JSON',
    description: 'Error message for invalid JSON',
  },
  'openedx-ai-badges.error.generic': {
    id: 'openedx-ai-badges.error.generic',
    defaultMessage: 'Something went wrong. Please try again later.',
    description: 'Generic error message',
  },
  'openedx-ai-badges.badge-form.button.show-form': {
    id: 'openedx-ai-badges.badge-form.button.show-form',
    defaultMessage: 'Create a new badge',
    description: 'Button to show the generation form again',
  },
  'openedx-ai-badges.badge-preview.edition-instructions': {
    id: 'openedx-ai-badges.badge-preview.edition-instructions',
    defaultMessage: '<bold>Your badge has been generated successfully!</bold> <br></br> You can now review and edit each section independently using the edit icons. Once you are satisfied, the badge will be saved to the course.',
    description: 'Instructions shown after badge generation',
  },
});

export default messages;
