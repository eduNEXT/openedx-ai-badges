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
import { useParams } from 'react-router-dom';

const mockUnits = [
  { id: 'unit-1', name: 'Unit 1: Introduction' },
  { id: 'unit-2', name: 'Unit 2: Fundamentals' },
  { id: 'unit-3', name: 'Unit 3: Advanced Topics' },
  { id: 'unit-4', name: 'Unit 4: Capstone Project' },
];

const formOptions = {
  scope: [
    { value: 'course', label: 'openedx-ai-badges.badge-form.scope.course' },
    { value: 'section', label: 'openedx-ai-badges.badge-form.scope.section' },
    { value: 'unit', label: 'openedx-ai-badges.badge-form.scope.unit' },
  ],
  style: [
    { value: 'modern', label: 'openedx-ai-badges.badge-form.style.modern' },
    { value: 'classic', label: 'openedx-ai-badges.badge-form.style.classic' },
    { value: 'minimalist', label: 'openedx-ai-badges.badge-form.style.minimalist' },
    { value: 'playful', label: 'openedx-ai-badges.badge-form.style.playful' },
  ],
  tone: [
    { value: 'professional', label: 'openedx-ai-badges.badge-form.tone.professional' },
    { value: 'friendly', label: 'openedx-ai-badges.badge-form.tone.friendly' },
    { value: 'academic', label: 'openedx-ai-badges.badge-form.tone.academic' },
    { value: 'creative', label: 'openedx-ai-badges.badge-form.tone.creative' },
  ],
  level: [
    { value: 'beginner', label: 'openedx-ai-badges.badge-form.level.beginner' },
    { value: 'intermediate', label: 'openedx-ai-badges.badge-form.level.intermediate' },
    { value: 'advanced', label: 'openedx-ai-badges.badge-form.level.advanced' },
    { value: 'expert', label: 'openedx-ai-badges.badge-form.level.expert' },
  ],
  criterion: [
    { value: 'completion', label: 'openedx-ai-badges.badge-form.criterion.completion' },
    { value: 'mastery', label: 'openedx-ai-badges.badge-form.criterion.mastery' },
    { value: 'participation', label: 'openedx-ai-badges.badge-form.criterion.participation' },
    { value: 'excellence', label: 'openedx-ai-badges.badge-form.criterion.excellence' },
  ],
};

const AIBadgesTab = () => {
  const intl = useIntl();
  const { courseId: paramCourseId } = useParams<{ courseId: string }>();

  // Fallback to extract courseId from URL if useParams fails
  const courseId = (() => {
    if (paramCourseId) { return paramCourseId; }
    const pathMatch = window.location.pathname.match(/course\/([^/]+)/);
    return pathMatch ? pathMatch[1] : null;
  })();

  const [formData, setFormData] = useState<BadgeFormData>({
    scope: 'course',
    unitId: '',
    style: 'modern',
    tone: 'professional',
    level: 'intermediate',
    criterion: 'completion',
    skillsEnabled: true,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [jsonInput1, setJsonInput1] = useState('');
  const [jsonInput2, setJsonInput2] = useState('');

  // Badge generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBadge, setGeneratedBadge] = useState<any>(null);

  const handleChange = (field: keyof BadgeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleGenerateBadge = async () => {
    if (formData.scope === 'unit' && !formData.unitId) {
      setErrors({ unitId: true });
      return;
    }

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
        {/* Left section: Form */}
        <Col lg={6} className="d-flex flex-column">
          <div className="flex-grow-1 overflow-auto">
            <Form className="badge-form p-3">
              {/* Scope Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="font-weight-bold mb-3">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.scope.label'])}
                </Form.Label>
                <Form.Text className="d-block mb-3 text-muted">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.scope.description'])}
                </Form.Text>
                <SelectableBox.Set
                  value={formData.scope}
                  onChange={(e) => handleChange('scope', e.target.value)}
                  name="scope"
                  ariaLabel="scope selection"
                  columns={4}
                >
                  {formOptions.scope.map(option => (
                    <SelectableBox
                      key={option.value}
                      value={option.value}
                      aria-label={intl.formatMessage(messages[option.label])}
                    >
                      {intl.formatMessage(messages[option.label])}
                    </SelectableBox>
                  ))}
                </SelectableBox.Set>
              </Form.Group>

              {/* Unit Selection - shown only when scope is 'unit' */}
              {formData.scope === 'unit' && (
                <Form.Group controlId="unit-select" className="mb-4" isInvalid={errors.unitId}>
                  <Form.Label>{intl.formatMessage(messages['openedx-ai-badges.badge-form.unit.label'])}</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.unitId}
                    onChange={(e) => handleChange('unitId', e.target.value)}
                  >
                    <option value="">
                      {intl.formatMessage(messages['openedx-ai-badges.badge-form.unit.placeholder'])}
                    </option>
                    {mockUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.unitId && (
                    <Form.Control.Feedback type="invalid">
                      {intl.formatMessage(messages['openedx-ai-badges.badge-form.error.required-field'])}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              )}

              {/* Style Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="font-weight-bold mb-3">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.style.label'])}
                </Form.Label>
                <SelectableBox.Set
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  name="style"
                  ariaLabel="style selection"
                  columns={4}
                >
                  {formOptions.style.map(option => (
                    <SelectableBox
                      key={option.value}
                      value={option.value}
                      aria-label={intl.formatMessage(messages[option.label])}
                    >
                      {intl.formatMessage(messages[option.label])}
                    </SelectableBox>
                  ))}
                </SelectableBox.Set>
              </Form.Group>

              {/* Tone Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="font-weight-bold mb-3">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.tone.label'])}
                </Form.Label>
                <SelectableBox.Set
                  value={formData.tone}
                  onChange={(e) => handleChange('tone', e.target.value)}
                  name="tone"
                  ariaLabel="tone selection"
                  columns={4}
                >
                  {formOptions.tone.map(option => (
                    <SelectableBox
                      key={option.value}
                      value={option.value}
                      aria-label={intl.formatMessage(messages[option.label])}
                    >
                      {intl.formatMessage(messages[option.label])}
                    </SelectableBox>
                  ))}
                </SelectableBox.Set>
              </Form.Group>

              {/* Level Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="font-weight-bold mb-3">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.level.label'])}
                </Form.Label>
                <SelectableBox.Set
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  name="level"
                  ariaLabel="level selection"
                  columns={4}
                >
                  {formOptions.level.map(option => (
                    <SelectableBox
                      key={option.value}
                      value={option.value}
                      aria-label={intl.formatMessage(messages[option.label])}
                    >
                      {intl.formatMessage(messages[option.label])}
                    </SelectableBox>
                  ))}
                </SelectableBox.Set>
              </Form.Group>

              {/* Criterion Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="font-weight-bold mb-3">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.criterion.label'])}
                </Form.Label>
                <SelectableBox.Set
                  value={formData.criterion}
                  onChange={(e) => handleChange('criterion', e.target.value)}
                  name="criterion"
                  ariaLabel="criterion selection"
                  columns={4}
                >
                  {formOptions.criterion.map(option => (
                    <SelectableBox
                      key={option.value}
                      value={option.value}
                      aria-label={intl.formatMessage(messages[option.label])}
                    >
                      {intl.formatMessage(messages[option.label])}
                    </SelectableBox>
                  ))}
                </SelectableBox.Set>
              </Form.Group>

              {/* Skills Toggle Switch */}
              <Form.Group className="mb-4">
                <Form.Switch
                  id="skills-toggle"
                  label={intl.formatMessage(messages['openedx-ai-badges.badge-form.skills.label'])}
                  checked={formData.skillsEnabled}
                  onChange={(e) => handleChange('skillsEnabled', e.target.checked)}
                />
                <Form.Text muted className="d-block mt-2">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.skills.description'], {
                    scope: formData.scope.toLowerCase(),
                  })}
                </Form.Text>
              </Form.Group>

              {/* Additional Description Textarea */}
              <Form.Group className="mb-4" controlId="description">
                <Form.Label className="font-weight-bold">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.description.label'])}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={intl.formatMessage(messages['openedx-ai-badges.badge-form.description.placeholder'])}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Form.Group>

              {generationError && (
                <div className="mt-3 text-danger small">
                  {intl.formatMessage(messages['openedx-ai-badges.badge-form.error.generation'])}: {generationError}
                </div>
              )}

              {/* Submit Button */}
              <div className="d-flex gap-2 justify-content-end mt-4">
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
            </Form>
          </div>
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

      <Row className="g-4 mt-2">
        <Col lg={6}>
          <Card>
            <Card.Header
              title={intl.formatMessage(messages['openedx-ai-badges.hitl.card1.title'])}
              size="sm"
            />
            <Card.Body>
              <Card.Section>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={jsonInput1}
                  onChange={(e) => setJsonInput1(e.target.value)}
                  placeholder={intl.formatMessage(messages['openedx-ai-badges.hitl.json-placeholder'])}
                  style={{ fontFamily: 'monospace' }}
                />
              </Card.Section>
            </Card.Body>
            <Card.Footer>
              <Button variant="primary">
                {intl.formatMessage(messages['openedx-ai-badges.hitl.card1.button'])}
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header
              title={intl.formatMessage(messages['openedx-ai-badges.hitl.card2.title'])}
              size="sm"
            />
            <Card.Body>
              <Card.Section>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={jsonInput2}
                  onChange={(e) => setJsonInput2(e.target.value)}
                  placeholder={intl.formatMessage(messages['openedx-ai-badges.hitl.json-placeholder'])}
                  style={{ fontFamily: 'monospace' }}
                />
              </Card.Section>
            </Card.Body>
            <Card.Footer>
              <Button variant="primary">
                {intl.formatMessage(messages['openedx-ai-badges.hitl.card2.button'])}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AIBadgesTab;
