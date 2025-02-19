import { FETCH_SIZE } from '@/constants/constants';
import { api,  ApiResponse } from './api';
import { Post, PostRequest, Posts } from '@/types/types';

export const fetchPosts = async ({
    boardId,
    pageParam = null,
}: { 
    boardId : number; 
    pageParam?: string | null;
 }): Promise<Posts> => {
    const response = await api.get<ApiResponse<Posts>>(`/api/${boardId}/posts`, {
        params: { cursor: pageParam, size: FETCH_SIZE }
    });
    return response.data.data;
};

export const fetchPost = async ({
    boardId,
    postId,
}: {
    boardId: number;
    postId: number;
}): Promise<Post> => {
    const response = await api.get<ApiResponse<Post>>(`/api/${boardId}/posts/${postId}`);

    return response.data.data;
};

export const updatePostThumbnail = async ({
    boardId,
    postId,
    file,
}: {
    boardId: number;
    postId: number;
    file: File;
}): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await api.post<ApiResponse<string>>(`/api/${boardId}/posts/${postId}/upload`, formData);

        return response.data.data;
    } catch (error) {
        console.error("파일 업로드 중 오류 발생", error);
        return null;
    }
};

export const createPost = async ({
    boardId,
    postData,
}: {
    boardId: number;
    postData: PostRequest;
}): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>(`/api/${boardId}/posts/create`, postData);
    return response.data.data;
};

export const updatePost = async ({
    boardId,
    postId,
    postData,
}: {
    boardId: number;
    postId: number;
    postData: PostRequest;
}): Promise<Post> => {
    const response = await api.put<ApiResponse<Post>>(`/api/${boardId}/posts/${postId}`, postData);
    return response.data.data;
};

export const incrementViewCount = async ({ boardId, postId }: { boardId : number; postId: number; }): Promise<void> => {
    await api.patch<ApiResponse<void>>(`/api/${boardId}/posts/${postId}/view`);
};

export const deletePost = async ({ boardId, postId }: { boardId : number; postId: number; }): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/api/${boardId}/posts/${postId}`);
};
