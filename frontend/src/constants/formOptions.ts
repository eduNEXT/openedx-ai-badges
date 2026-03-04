import { FormOptionsMap, BadgeFormData } from '../types/badges';
import messages from '../messages';

export const FORM_OPTIONS: FormOptionsMap = {
  style: [
    { value: 'modern', label: messages['openedx-ai-badges.badge-form.style.modern'] },
    { value: 'classic', label: messages['openedx-ai-badges.badge-form.style.classic'] },
    { value: 'minimalist', label: messages['openedx-ai-badges.badge-form.style.minimalist'] },
    { value: 'playful', label: messages['openedx-ai-badges.badge-form.style.playful'] },
  ],
  tone: [
    { value: 'professional', label: messages['openedx-ai-badges.badge-form.tone.professional'] },
    { value: 'friendly', label: messages['openedx-ai-badges.badge-form.tone.friendly'] },
    { value: 'academic', label: messages['openedx-ai-badges.badge-form.tone.academic'] },
    { value: 'creative', label: messages['openedx-ai-badges.badge-form.tone.creative'] },
  ],
  level: [
    { value: 'beginner', label: messages['openedx-ai-badges.badge-form.level.beginner'] },
    { value: 'intermediate', label: messages['openedx-ai-badges.badge-form.level.intermediate'] },
    { value: 'advanced', label: messages['openedx-ai-badges.badge-form.level.advanced'] },
    { value: 'expert', label: messages['openedx-ai-badges.badge-form.level.expert'] },
  ],
  criterion: [
    { value: 'completion', label: messages['openedx-ai-badges.badge-form.criterion.completion'] },
    { value: 'mastery', label: messages['openedx-ai-badges.badge-form.criterion.mastery'] },
    { value: 'participation', label: messages['openedx-ai-badges.badge-form.criterion.participation'] },
    { value: 'excellence', label: messages['openedx-ai-badges.badge-form.criterion.excellence'] },
  ],
};

export const DEFAULT_FORM_DATA: BadgeFormData = {
  style: 'modern',
  tone: 'professional',
  level: 'intermediate',
  criterion: 'completion',
  skillsEnabled: true,
};
