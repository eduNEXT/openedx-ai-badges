/**
 * AIBadgesTab Component
 * Unified badge configuration tab combining Legacy and HITL badge creation workflows.
 */

import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  StatefulButton,
  SelectableBox,
  Button,
  Spinner,
} from '@openedx/paragon';
import { BadgeFormData } from '../types';
import messages from '../messages';
import { generateBadge } from '../services/badgeWorkflowService';

const AIBadgesTab = () => {
  const intl = useIntl();
  // Extract courseId from URL
  const courseId = (() => {
    const pathMatch = window.location.pathname.match(/course\/([^/]+)/);
    return pathMatch ? pathMatch[1] : null;
  })();

  const [formData] = useState<BadgeFormData>({
    scope: 'course',
    unitId: '',
    style: 'modern',
    tone: 'professional',
    level: 'intermediate',
    criterion: 'completion',
    skillsEnabled: true,
    description: '',
  });

  // Badge generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBadge, setGeneratedBadge] = useState<any>(null);

  const handleGenerateBadge = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await generateBadge({
        formData,
        courseId: courseId || '',
      });

      let badge = result.response;
      if (typeof badge === 'string') {
        try {
          // Replace single quotes just in case the backend returns a python dict string format
          badge = JSON.parse(badge.replace(/'/g, '"'));
        } catch (e) {
          // If parsing fails, store as string
        }
      }

      setGeneratedBadge(badge);
    } catch (error: any) {
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container fluid className="h-100">
      <Row className="h-100 g-4">
        {/* Left section: Info and Action */}
        <Col lg={6} className="d-flex flex-column p-4">
          <h2 className="mb-4 text-primary">{intl.formatMessage(messages['openedx-ai-badges.badge-form.title'])}</h2>
          <p>
            This tab allows you to generate <strong>Open Badges 3.0</strong> following the official standard.
            The system automatically extracts real information from your course, including the
            <strong> title, description, and overview</strong> by default.
          </p>
          <p>
            The extraction process and the final output are highly configurable via the
            <strong> AI Workflow Profile</strong>.
          </p>

          <div className="mt-auto d-flex justify-content-start">
            <StatefulButton
              state={isGenerating ? 'pending' : 'default'}
              onClick={handleGenerateBadge}
              disabled={isGenerating}
              labels={{
                default: intl.formatMessage(messages['openedx-ai-badges.badge-form.button.generate']),
                pending: intl.formatMessage(messages['openedx-ai-badges.badge-form.generating.message']),
                complete: intl.formatMessage(messages['openedx-ai-badges.badge-form.button.generate']),
              }}
            />
          </div>

          {generationError && (
            <div className="mt-3 text-danger small">
              {intl.formatMessage(messages['openedx-ai-badges.badge-form.error.generation'])}: {generationError}
            </div>
          )}
        </Col>

        {/* Right section: Preview */}
        <Col lg={6} className="d-flex flex-column border-start align-items-center justify-content-center">
          {isGenerating ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">
                {intl.formatMessage(messages['openedx-ai-badges.badge-form.generating.message'])}
              </p>
            </div>
          ) : generatedBadge ? (
            <div className="w-100 p-4">
              <h5 className="mb-3">{intl.formatMessage(messages['openedx-ai-badges.badge-form.title'])}</h5>
              <div className="bg-light p-3 rounded border overflow-auto" style={{ maxHeight: '600px' }}>
                <pre className="x-small text-dark mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(generatedBadge, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted m-auto">
              <span className="display-1">🎖️</span>
              <p className="small text-center">
                {intl.formatMessage(messages['openedx-ai-badges.badge-preview.placeholder'])}
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AIBadgesTab;
