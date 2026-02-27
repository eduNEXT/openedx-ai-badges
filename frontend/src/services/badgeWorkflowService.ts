/**
 * Badge Workflow Service
 * Connects AIBadgesTab to the BadgeOrchestrator via the workflows API
 */

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { BadgeFormData } from '../types';

const getWorkflowApiUrl = () => `${getConfig().STUDIO_BASE_URL}/openedx-ai-extensions/v1/workflows/`;

export interface BadgeGenerationParams {
    formData: BadgeFormData;
    courseId: string;
    action?: string;
}

export interface BadgeWorkflowResponse {
    response: string | object;
    status: string;
    requestId?: string;
    nextActions?: string[];
    [key: string]: any;
}

/**
 * Generate badge using the BadgeOrchestrator
 */
export const generateBadge = async ({
    formData,
    courseId,
    action = 'run',
}: BadgeGenerationParams): Promise<BadgeWorkflowResponse> => {
    const apiUrl = getWorkflowApiUrl();

    // Prepare context for the workflow
    const context = {
        course_id: courseId,
    };

    // Prepare payload matching the API expectations
    const payload = {
        action,
        user_input: formData,
        timestamp: new Date().toISOString(),
        request_id: `badge-${Date.now()}`,
    };

    try {
        const response = await getAuthenticatedHttpClient().post(
            `${apiUrl}?context=${encodeURIComponent(JSON.stringify(context))}`,
            payload,
        );

        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.error || error.message || 'Failed to generate badge',
        );
    }
};
