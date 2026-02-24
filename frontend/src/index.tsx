// Import registration utilities from ai-extensions
import { registerComponents, registerAISettingsTab } from '@openedx/openedx-ai-extensions-ui';

import AIRequestBadgesComponent from './components/AIRequestBadgesComponent';
import AIBadgesTab from './components/AIBadgesTab';

registerComponents({
  AIRequestBadgesComponent,
});

// Register the badge configuration tab into the AI Extensions Settings Modal.
// The backend controls whether this tab is shown per course via the
// author-settings API (enabled_features list). The feature ID below must
// match what the backend returns when badges are enabled for a course.
registerAISettingsTab({
  id: 'ai-badges',
  label: 'AI Badges',
  component: AIBadgesTab,
});

export {
  AIRequestBadgesComponent,
  AIBadgesTab,
};
