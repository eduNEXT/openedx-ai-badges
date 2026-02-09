import RedLine from './plugin';
import AIRequestBadgesComponent from './components/AIRequestBadgesComponent';

// Import registration utilities from ai-extensions
// This allows ai-badges to register its components with the COMPONENT_REGISTRY
import { registerComponents } from '@openedx/openedx-ai-extensions-ui';

// Register ai-badges components so they can be used with ConfigurableAIAssistance
// The backend configuration can now reference these components by name
registerComponents({
  AIRequestBadgesComponent,
  // Add more components here as needed
  // AIResponseBadgesComponent,
  // AIBadgesDisplayComponent,
});

/*
 * Export both the configurable wrapper and the direct component.
 *
 * Components registered above (like AIRequestBadgesComponent) can now be used
 * in the backend configuration for ConfigurableAIAssistance by referencing
 * their names in the "request" or "response" component configuration.
 *
 * Example backend config:
 * {
 *   "request": {
 *     "component": "AIRequestBadgesComponent",
 *     "config": { ... }
 *   }
 * }
 */
export {
  RedLine,
  AIRequestBadgesComponent,
};
