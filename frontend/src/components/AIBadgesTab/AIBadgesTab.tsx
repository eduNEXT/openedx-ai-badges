/**
 * AIBadgesTab Component
 *
 * Unified badge configuration tab combining badge generation and preview.
 * This is a slim orchestrator that composes:
 *   - BadgeOptionsForm (left panel — form inputs)
 *   - BadgePreview (right panel — generated badge preview)
 *   - useBadgeGeneration hook (all async logic)
 */

import { useState } from 'react';
import { Container, Row, Col } from '@openedx/paragon';
import { BadgeFormData } from '../../types/badges';
import { DEFAULT_FORM_DATA } from '../../constants/formOptions';
import { useBadgeGeneration } from '../../hooks/useBadgeGeneration';
import BadgeOptionsForm from './BadgeOptionsForm';
import BadgePreview from './BadgePreview';

interface AIBadgesTabProps {
  uiSlotSelectorId: string | null;
  courseId: string | null;
  locationId?: string | null;
}

const AIBadgesTab = ({ uiSlotSelectorId, courseId, locationId }: AIBadgesTabProps) => {
  const [formData, setFormData] = useState<BadgeFormData>(DEFAULT_FORM_DATA);

  const {
    isGenerating,
    generationError,
    generatedBadge,
    handleGenerate,
    handleSave,
    updateBadgeSection,
  } = useBadgeGeneration(uiSlotSelectorId, courseId, locationId);

  const handleFieldChange = (field: keyof BadgeFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container fluid className="ai-badges-tab">
      <Row className="h-1000" gap={2}>
        {/* Left section: Badge Options Form */}
        <Col lg={5} md={12} className="d-flex flex-column">
          <BadgeOptionsForm
            formData={formData}
            onChange={handleFieldChange}
            onGenerate={() => handleGenerate(formData)}
            isGenerating={isGenerating}
            generationError={generationError}
          />
        </Col>

        {/* Right section: Preview */}
        <Col
          lg={7}
          md={12}
          className="d-flex flex-column border-start align-items-center justify-content-center"
        >
          <BadgePreview
            isGenerating={isGenerating}
            generatedBadge={generatedBadge}
            onSave={handleSave}
            onUpdateSection={updateBadgeSection}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AIBadgesTab;
