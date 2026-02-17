import RedLine from './plugin';
import AIRequestBadgesComponent from './components/AIRequestBadgesComponent';
import { registerComponents } from '@openedx/openedx-ai-extensions-ui';

registerComponents({
  AIRequestBadgesComponent,
});

export {
  RedLine,
  AIRequestBadgesComponent,
};
