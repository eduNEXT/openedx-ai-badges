import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Tab labels
  'openedx-ai-badges.tab.legacy-badges': {
    id: 'openedx-ai-badges.tab.legacy-badges',
    defaultMessage: 'Legacy Badges',
    description: 'Inner tab label for legacy badge creation',
  },
  'openedx-ai-badges.tab.hitl-badges': {
    id: 'openedx-ai-badges.tab.hitl-badges',
    defaultMessage: 'HITL Badges',
    description: 'Inner tab label for human-in-the-loop badge creation',
  },

  // HITL Badges tab
  'openedx-ai-badges.hitl.card1.title': {
    id: 'openedx-ai-badges.hitl.card1.title',
    defaultMessage: 'Badge Class Configuration',
    description: 'Title of the first HITL badge card',
  },
  'openedx-ai-badges.hitl.card1.button': {
    id: 'openedx-ai-badges.hitl.card1.button',
    defaultMessage: 'Create Badge Class',
    description: 'Button label for creating badge class',
  },
  'openedx-ai-badges.hitl.card2.title': {
    id: 'openedx-ai-badges.hitl.card2.title',
    defaultMessage: 'Badge Assertion Configuration',
    description: 'Title of the second HITL badge card',
  },
  'openedx-ai-badges.hitl.card2.button': {
    id: 'openedx-ai-badges.hitl.card2.button',
    defaultMessage: 'Create Badge Assertion',
    description: 'Button label for creating badge assertion',
  },
  'openedx-ai-badges.hitl.json-placeholder': {
    id: 'openedx-ai-badges.hitl.json-placeholder',
    defaultMessage: 'Paste JSON configuration here...',
    description: 'Placeholder for JSON textarea',
  },

  // Legacy badge form messages
  'openedx-ai-badges.badge-form.title': {
    id: 'openedx-ai-badges.badge-form.title',
    defaultMessage: 'Create Your Badge',
    description: 'Title for the badge form step',
  },
  'openedx-ai-badges.badge-form.scope.label': {
    id: 'openedx-ai-badges.badge-form.scope.label',
    defaultMessage: 'Badge Scope',
    description: 'Label for badge scope selection',
  },
  'openedx-ai-badges.badge-form.scope.description': {
    id: 'openedx-ai-badges.badge-form.scope.description',
    defaultMessage: 'Choose which part of the course this badge applies to',
    description: 'Description for scope selection',
  },
  'openedx-ai-badges.badge-form.scope.course': {
    id: 'openedx-ai-badges.badge-form.scope.course',
    defaultMessage: 'Course',
    description: 'Scope option for entire course',
  },
  'openedx-ai-badges.badge-form.scope.section': {
    id: 'openedx-ai-badges.badge-form.scope.section',
    defaultMessage: 'Section',
    description: 'Scope option for section',
  },
  'openedx-ai-badges.badge-form.scope.unit': {
    id: 'openedx-ai-badges.badge-form.scope.unit',
    defaultMessage: 'Unit',
    description: 'Scope option for specific unit',
  },
  'openedx-ai-badges.badge-form.unit.label': {
    id: 'openedx-ai-badges.badge-form.unit.label',
    defaultMessage: 'Select Unit',
    description: 'Label for unit selection dropdown',
  },
  'openedx-ai-badges.badge-form.unit.placeholder': {
    id: 'openedx-ai-badges.badge-form.unit.placeholder',
    defaultMessage: 'Choose a unit',
    description: 'Placeholder for unit selection',
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
  'openedx-ai-badges.badge-form.skills.description': {
    id: 'openedx-ai-badges.badge-form.skills.description',
    defaultMessage: 'Automatically extract and align skills from the selected {scope}',
    description: 'Description for skill extraction feature',
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

  // Badge preview placeholder
  'openedx-ai-badges.badge-preview.placeholder': {
    id: 'openedx-ai-badges.badge-preview.placeholder',
    defaultMessage: 'Your badge preview will appear here',
    description: 'Placeholder text shown in the preview panel before a badge is generated',
  },
});

export default messages;
