import React, { useState, useEffect } from 'react';
import { snakeCaseObject } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, Button, Form, Stack,
  IconButton,
  Icon,
  Badge,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import {
  BadgeSectionKey, CourseContext, SkillsData, BadgeData,
} from '../../types/badges';
import messages from '../../messages';

interface SectionReviewCardProps {
  sectionKey: BadgeSectionKey;
  title: string;
  data: CourseContext | SkillsData | BadgeData;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updated: unknown) => void;
}

/** Component to render Course Context in a human-readable format. */
const CourseContextView = ({ data }: { data: CourseContext }) => (
  <div>
    <p className="x-small mb-0">{data.description || data.shortDescription}</p>
  </div>
);

/** Component to render Skills alignment list. */
const SkillsView = ({ data }: { data: SkillsData }) => (
  <Stack gap={2}>
    {data.alignment?.map((skill, index) => (
      <div key={`${skill.targetName}-${skill.targetType}`} className={index < data.alignment.length - 1 ? 'border-bottom pb-2' : ''}>
        <div className="d-flex justify-content-between align-items-center">
          <h5>{skill.targetName}</h5>
          <Badge>{skill.targetType}</Badge>
        </div>
        <p className="x-small mb-0">{skill.targetDescription}</p>
      </div>
    ))}
  </Stack>
);

/** Component to render Badge metadata. */
const BadgeView = ({ data }: { data: BadgeData }) => {
  const intl = useIntl();
  return (
    <div className="section-view">
      <p className="x-small mb-2">{data.description}</p>
      {data.criteria?.narrative && (
        <div className="mt-2 pt-2">
          <span className="x-small font-weight-bold">
            {intl.formatMessage(messages['openedx-ai-badges.badge-preview.badge.criteria'])}
          </span>
          <p className="x-small">{data.criteria.narrative}</p>
        </div>
      )}
    </div>
  );
};

const SectionReviewCard = ({
  sectionKey,
  title,
  data,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: SectionReviewCardProps) => {
  const intl = useIntl();

  // Manage JSON as a local string to allow typing invalid JSON without polluting the main state
  const [localJson, setLocalJson] = useState(JSON.stringify(data, null, 2));
  const [isInvalid, setIsInvalid] = useState(false);

  // Update local string if the data changes from the backend/generation
  useEffect(() => {
    if (!isEditing) {
      const dataToDisplay = sectionKey === 'courseContext' ? snakeCaseObject(data) : data;
      setLocalJson(JSON.stringify(dataToDisplay, null, 2));
    }
  }, [data, isEditing, sectionKey]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(localJson);
      onSave(JSON.stringify(parsed));
    } catch (e) {
      setIsInvalid(true);
    }
  };

  const handleCancel = () => {
    setIsInvalid(false);
    onCancel();
  };

  const renderFormattedView = () => {
    // data is guaranteed to be a valid object here (from backend/generation)
    switch (sectionKey) {
      case 'courseContext':
        return <CourseContextView data={data as CourseContext} />;
      case 'skills':
        return <SkillsView data={data as SkillsData} />;
      case 'badge':
        return <BadgeView data={data as BadgeData} />;
      default:
        return <pre className="small bg-light p-2">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  const getCardTitle = () => {
    if (sectionKey === 'badge' && (data as BadgeData).name) {
      return <h3 className="text-primary">{`${title}: ${(data as BadgeData).name}`}</h3>;
    }
    return <h4>{title}</h4>;
  };

  return (
    <Card className="flex-grow-1 rounded-0 border-bottom">
      <Card.Header
        title={getCardTitle()}
        actions={[
          (<IconButton
            iconAs={Icon}
            key={intl.formatMessage(messages['openedx-ai-badges.badge-preview.edit.button.aria'], { section: title })}
            variant="primary"
            src={Edit}
            onClick={onEdit}
            alt={intl.formatMessage(messages['openedx-ai-badges.badge-preview.edit.button.aria'], { section: title })}
          />),
        ]}
      />
      <Card.Body className="p-3 h-100">
        {isEditing ? (
          <div className="d-flex flex-column h-100">
            <Form.Control
              as="textarea"
              size="sm"
              rows={12}
              className="text-monospace flex-grow-1 mb-3"
              controlClassName="h-100"
              aria-label={intl.formatMessage(messages['openedx-ai-badges.badge-preview.edit.aria-label'], { section: title })}
              value={localJson}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setIsInvalid(false);
                setLocalJson(e.target.value);
              }}
            />
            {isInvalid && (
              <Form.Control.Feedback type="invalid">
                {intl.formatMessage(messages['openedx-ai-badges.badge-preview.edit.error'])}
              </Form.Control.Feedback>
            )}
            <Stack direction="horizontal" gap={2} className="justify-content-end">
              <Button variant="outline-secondary" size="sm" onClick={handleCancel}>
                {intl.formatMessage(messages['openedx-ai-badges.badge-preview.cancel.button'])}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {intl.formatMessage(messages['openedx-ai-badges.badge-preview.save.button'])}
              </Button>
            </Stack>
          </div>
        ) : (
          <div className="view-mode">
            {renderFormattedView()}

          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SectionReviewCard;
