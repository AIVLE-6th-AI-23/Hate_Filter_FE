import { ContentAnalysisResponse } from '@/types/types';
import { api, ApiResponse } from './api';

export const fetchContentAnalysis = async (postId: number): Promise<ContentAnalysisResponse> => {
    const response = await api.get<ApiResponse<ContentAnalysisResponse>>(`/api/${postId}/content-analysis`);
    
    return response.data.data;
}

export const startContentAnalysis = async (postId: number): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(`/api/${postId}/content-analysis/start`);
    return response.data.data;
};
