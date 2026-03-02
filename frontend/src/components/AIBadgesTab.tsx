/**
 * AIBadgesTab Component
 * Unified badge configuration tab combining Legacy and HITL badge creation workflows.
 */

import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  StatefulButton,
  SelectableBox,
  Spinner,
  Card,
} from '@openedx/paragon';
import { services } from '@openedx/openedx-ai-extensions-ui';

interface AIBadgesTabProps {
  uiSlotSelectorId?: string | null;
  courseId?: string | null;
  locationId?: string | null;
}

const AIBadgesTab = ({
  uiSlotSelectorId = 'authoring-resources-ai-badge-creator-modal',
  courseId = null,
  locationId = null,
}: AIBadgesTabProps) => {
  const contextData = services.prepareContextData({ uiSlotSelectorId, courseId, locationId });

  const formOptions = {
  style: [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'playful', label: 'Playful' },
  ],
  tone: [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'academic', label: 'Academic' },
    { value: 'creative', label: 'Creative' },
  ],
  level: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ],
  criterion: [
    { value: 'completion', label: 'Completion' },
    { value: 'mastery', label: 'Mastery' },
    { value: 'participation', label: 'Participation' },
    { value: 'excellence', label: 'Excellence' },
  ],
};

  // Badge generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBadge, setGeneratedBadge] = useState<any>(null);

  // Form state for badge options
  const [formData, setFormData] = useState({
    style: 'modern',
    tone: 'professional',
    level: 'intermediate',
    criterion: 'completion',
    skillsEnabled: true,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateBadge = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await services.callWorkflowService({
        payload: {
          action: 'run',
          userInput: formData,
        },
        context: contextData,
      });

      let complete_info = result.response;
      if (typeof complete_info === 'string') {
        try {
          complete_info = JSON.parse(complete_info.replace(/'/g, '"'));
        } catch (e) {}
      }

      setGeneratedBadge(complete_info);
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container fluid className="h-100">
      <Row className="h-100 g-4">
        {/* Left section: Badge Options Form */}
        <Col lg={6} className="d-flex flex-column p-4">
          <h2 className="mb-4 text-primary">Badge Generator</h2>
          <p>
            This tab allows you to generate <strong>Open Badges 3.0</strong> following the official standard.
            The system automatically extracts real information from your course, including the
            title, description, and overview by default.
          </p>
          <p>
            The extraction process and the final output are highly configurable via the
            <strong> AI Workflow Profile</strong>.
          </p>
          <Form className="badge-form">
            {/* Style Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold mb-3">Badge Style</Form.Label>
              <SelectableBox.Set
                value={formData.style}
                onChange={e => handleChange('style', e.target.value)}
                name="style"
                ariaLabel="style selection"
                columns={4}
              >
                {formOptions.style.map(option => (
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

            {/* Tone Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold mb-3">Badge Tone</Form.Label>
              <SelectableBox.Set
                value={formData.tone}
                onChange={e => handleChange('tone', e.target.value)}
                name="tone"
                ariaLabel="tone selection"
                columns={4}
              >
                {formOptions.tone.map(option => (
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

            {/* Level Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold mb-3">Badge Level</Form.Label>
              <SelectableBox.Set
                value={formData.level}
                onChange={e => handleChange('level', e.target.value)}
                name="level"
                ariaLabel="level selection"
                columns={4}
              >
                {formOptions.level.map(option => (
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

            {/* Criterion Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold mb-3">Badge Criterion</Form.Label>
              <SelectableBox.Set
                value={formData.criterion}
                onChange={e => handleChange('criterion', e.target.value)}
                name="criterion"
                ariaLabel="criterion selection"
                columns={4}
              >
                {formOptions.criterion.map(option => (
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

            {/* Skills Toggle Switch */}
            <Form.Group className="mb-4">
              <Form.Switch
                id="skills-toggle"
                label="Extract Skills"
                checked={formData.skillsEnabled}
                onChange={e => handleChange('skillsEnabled', e.target.checked)}
              />
              <Form.Text muted className="d-block mt-2">
                Automatically extract and align skills from the badge
              </Form.Text>
            </Form.Group>

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
          </Form>
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
            <div className="w-100 p-4 d-flex flex-column gap-4 align-items-center">
              {generatedBadge.courseContext && (
                <Card style={{ width: '30vw' }}>
                  <Card.Header title="Course Context" />
                  <Card.Section>
                    <textarea
                      className="x-small text-dark mb-0 w-100"
                      style={{ minHeight: '120px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      value={JSON.stringify(generatedBadge.courseContext, null, 2)}
                      onChange={e => {
                        let value = e.target.value;
                        let updated;
                        try {
                          updated = JSON.parse(value);
                        } catch {
                          updated = value;
                        }
                        setGeneratedBadge(prev => ({ ...prev, courseContext: updated }));
                      }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={async () => {
                        setIsGenerating(true);
                        setGenerationError(null);
                        try {
                          const result = await services.callWorkflowService({
                            payload: {
                              action: 'save',
                              userInput: {
                                key: 'course_context',
                                value: generatedBadge.courseContext,
                              },
                            },
                            context: contextData,
                          });
                          let complete_info = result.response;
                          if (typeof complete_info === 'string') {
                            try {
                              complete_info = JSON.parse(complete_info.replace(/'/g, '"'));
                            } catch (e) {}
                          }
                          setGeneratedBadge(complete_info);
                        } catch (error) {
                          setGenerationError(error.message);
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      type="button"
                    >
                      Save
                    </button>
                  </Card.Section>
                </Card>
              )}
              {generatedBadge.skills && (
                <Card style={{ width: '30vw' }}>
                  <Card.Header title="Skills" />
                  <Card.Section>
                    <textarea
                      className="x-small text-dark mb-0 w-100"
                      style={{ minHeight: '120px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      value={JSON.stringify(generatedBadge.skills, null, 2)}
                      onChange={e => {
                        let value = e.target.value;
                        let updated;
                        try {
                          updated = JSON.parse(value);
                        } catch {
                          updated = value;
                        }
                        setGeneratedBadge(prev => ({ ...prev, skills: updated }));
                      }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={async () => {
                        setIsGenerating(true);
                        setGenerationError(null);
                        try {
                          const result = await services.callWorkflowService({
                            payload: {
                              action: 'save',
                              userInput: {
                                key: 'skills',
                                value: generatedBadge.skills,
                              },
                            },
                            context: contextData,
                          });
                          let complete_info = result.response;
                          if (typeof complete_info === 'string') {
                            try {
                              complete_info = JSON.parse(complete_info.replace(/'/g, '"'));
                            } catch (e) {}
                          }
                          setGeneratedBadge(complete_info);
                        } catch (error) {
                          setGenerationError(error.message);
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      type="button"
                    >
                      Save
                    </button>
                  </Card.Section>
                </Card>
              )}
              {generatedBadge.badge && (
                <Card style={{ width: '30vw' }}>
                  <Card.Header title="Badge" />
                  <Card.Section>
                    <textarea
                      className="x-small text-dark mb-0 w-100"
                      style={{ minHeight: '120px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      value={JSON.stringify(generatedBadge.badge, null, 2)}
                      onChange={e => {
                        let value = e.target.value;
                        let updated;
                        try {
                          updated = JSON.parse(value);
                        } catch {
                          updated = value;
                        }
                        setGeneratedBadge(prev => ({ ...prev, badge: updated }));
                      }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={async () => {
                        setIsGenerating(true);
                        setGenerationError(null);
                        try {
                          const result = await services.callWorkflowService({
                            payload: {
                              action: 'save',
                              userInput: {
                                key: 'badge',
                                value: generatedBadge.badge,
                              },
                            },
                            context: contextData,
                          });
                          let complete_info = result.response;
                          if (typeof complete_info === 'string') {
                            try {
                              complete_info = JSON.parse(complete_info.replace(/'/g, '"'));
                            } catch (e) {}
                          }
                          setGeneratedBadge(complete_info);
                        } catch (error) {
                          setGenerationError(error.message);
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      type="button"
                    >
                      Save
                    </button>
                  </Card.Section>
                </Card>
              )}
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
