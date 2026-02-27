/**
 * AIBadgesTab Component
 * Unified badge configuration tab combining Legacy and HITL badge creation workflows.
 */

import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  StatefulButton,
  Spinner,
} from '@openedx/paragon';
import { services } from '@openedx/openedx-ai-extensions-ui';

const AIBadgesTab = () => {
  const contextData = services.prepareContextData({});

  // Badge generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBadge, setGeneratedBadge] = useState<any>(null);

  const handleGenerateBadge = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await services.callWorkflowService({
        payload: {
          action: 'run',
        },
        context: contextData,
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
          <h2 className="mb-4 text-primary">Your Badge</h2>
          <p>
            This tab allows you to generate <strong>Open Badges 3.0</strong> following the official standard.
            The system automatically extracts real information from your course, including the
            title, description, and overview by default.
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
                default: 'Generate Badge',
                pending: 'Please wait while AI creates your badge',
                complete: 'Generate Badge',
              }}
            />
          </div>

          {generationError && (
            <div className="mt-3 text-danger small">
              Error generating badge: {generationError}
            </div>
          )}
        </Col>

        {/* Right section: Preview */}
        <Col lg={6} className="d-flex flex-column border-start align-items-center justify-content-center">
          {isGenerating ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">
                Please wait while AI creates your badge
              </p>
            </div>
          ) : generatedBadge ? (
            <div className="w-100 p-4">
              <h5 className="mb-3">Your Badge</h5>
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
                Your badge preview will appear here
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AIBadgesTab;
