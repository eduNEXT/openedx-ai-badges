/**
 * AIBadgesTab Component
 *
 * Unified badge configuration tab combining badge generation and preview.
 * This is a slim orchestrator that composes:
 *   - BadgeOptionsForm (left panel — form inputs)
 *   - BadgePreview (right panel — generated badge preview)
 *   - useBadgeGeneration hook (all async logic)
 */

import { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container, Row, Col, Button,
} from '@openedx/paragon';
import { BadgeFormData } from '../../types/badges';
import { DEFAULT_FORM_DATA } from '../../constants/formOptions';
import { useBadgeGeneration } from '../../hooks/useBadgeGeneration';
import BadgeOptionsForm from './BadgeOptionsForm';
import BadgePreview from './BadgePreview';
import messages from '../../messages';

import './AIBadgesTab.scss';

interface AIBadgesTabProps {
  uiSlotSelectorId: string | null;
  courseId: string | null;
  locationId?: string | null;
}
const Bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
const Br = () => <br />;

const AIBadgesTab = ({ uiSlotSelectorId, courseId, locationId }: AIBadgesTabProps) => {
  const intl = useIntl();
  const [formData, setFormData] = useState<BadgeFormData>(DEFAULT_FORM_DATA);
  const [isFormVisible, setIsFormVisible] = useState(true);

  const {
    isGenerating,
    generationError,
    generatedBadge,
    handleGenerate,
    handleSave,
  } = useBadgeGeneration(uiSlotSelectorId, courseId, locationId);

  // Automatically hide the form once a badge is successfully generated
  useEffect(() => {
    if (generatedBadge && !isGenerating) {
      setIsFormVisible(false);
    }
  }, [generatedBadge, isGenerating]);

  const handleFieldChange = (field: keyof BadgeFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onGenerateClick = async () => {
    await handleGenerate(formData);
  };

  const showForm = () => setIsFormVisible(true);

  return (
    <Container fluid className="ai-badges-tab h-100">
      <Row className="h-100" gap={2}>
        {/* Left section: Badge Options Form or Edition Instructions */}
        <Col lg={4} className="d-flex flex-column p-4">
          {isFormVisible ? (
            <BadgeOptionsForm
              formData={formData}
              onChange={handleFieldChange}
              onGenerate={onGenerateClick}
              isGenerating={isGenerating}
              generationError={generationError}
            />
          ) : (
            <div className="edition-instructions">
              <h2 className="mb-4 text-primary">
                {intl.formatMessage(messages['openedx-ai-badges.badge-form.header'])}
              </h2>
              <p className="mb-4">
                {intl.formatMessage(messages['openedx-ai-badges.badge-preview.edition-instructions'], {
                  br: Br,
                  bold: Bold,
                })}
              </p>
              <Button
                variant="outline-primary"
                onClick={showForm}
                disabled={isGenerating}
              >
                {intl.formatMessage(messages['openedx-ai-badges.badge-form.button.show-form'])}
              </Button>
            </div>
          )}
        </Col>

        {/* Right section: Preview */}
        <Col
          lg={8}
          className="d-flex flex-column border-start align-items-center justify-content-center p-4 bg-light-200 overflow-auto"
        >
          <BadgePreview
            isGenerating={isGenerating}
            generatedBadge={generatedBadge}
            onSave={handleSave}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AIBadgesTab;
