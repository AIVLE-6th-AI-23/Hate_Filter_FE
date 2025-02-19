import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPost, updatePost } from '@/services/post';
import { AnalysisStatus, Post, PostRequest } from '@/types/types';
import PostThumbnail from '@/components/PostThumbnail';
import * as styles from './postDetails.css';
import EditPostButton from '@/components/PostActionButton/Edit';
import CreatePostModal from '@/components/PostActionButton/CreateModal';
import { startContentAnalysis } from '@/services/contentAnalysis';

interface PostProps {
    boardId: number;
    postId: number;
}

export const PostDetails: React.FC<PostProps> = ({ boardId, postId }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { data: post, status, isLoading, error } = useQuery({
        queryKey: ["post", boardId, postId],
        queryFn: () => fetchPost({ boardId, postId }),
        refetchInterval: (query) => {
            const currentStatus = query.state.data?.analysisStatus;
            return currentStatus === "QUEUED" || currentStatus === "PROCESSING" ? 3000 : false;
        },
    });

    useEffect(() => {
        if (status === "error") {
            queryClient.resetQueries({ queryKey: ["posts", boardId] });
            throw error;
        }
    }, [status, error, queryClient, boardId]);

    const postData = post;

    useEffect(() => {
        if (postData?.analysisStatus === "COMPLETED") {
            queryClient.invalidateQueries({ queryKey: ["contentAnalysis", postId] });
        }
    }, [postData?.analysisStatus, postId, queryClient]);

    const updateMutation = useMutation({
        mutationFn: (updatedData: PostRequest) => updatePost({ boardId, postId, postData: updatedData }),
        onSuccess: (updatedPost) => {
            queryClient.setQueryData(["post", boardId, postId], updatedPost);
            setIsEditing(false);
        },
        onError: (error:Error) => {alert("Post 수정 실패"); throw error;},
        throwOnError: true
    });

    const startMutation = useMutation({
        mutationFn: () => startContentAnalysis(postId),
        onSuccess: () => {
            queryClient.setQueryData<Post>(["post", boardId, postId], (current) => current ? {
                ...current,
                analysisStatus: "QUEUED",
                analysisProgress: 0,
                analysisStatusDetail: "Queued",
            } : current);
        },
        onError: () => { alert("분석 시작 실패"); },
    });

    if (isLoading) return <p className={styles.infoTextStyle}>게시글을 불러오는 중...</p>;
    if (!postData) return <p className={styles.infoTextStyle}>게시글이 존재하지 않습니다.</p>;

    const handleEditClick = (post: Post) => {
        setSelectedPost(post);
        setIsEditing(true);
      };

    const handleSave = (postTitle: string, description: string) => {
        if (!selectedPost) return;

        updateMutation.mutate({boardId, postTitle, description});
    };

    const statusLabels: Record<AnalysisStatus, string> = {
        READY: "분석 대기",
        QUEUED: "요청 대기",
        PROCESSING: "분석 중",
        COMPLETED: "분석 완료",
        FAILED: "분석 실패",
    };

    const isAnalyzing = postData.analysisStatus === "QUEUED" || postData.analysisStatus === "PROCESSING";
    const cannotStart = !postData.contentUrl || isAnalyzing || startMutation.isPending;

    return (
        <>
            {isEditing && selectedPost && (
                <CreatePostModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
                initialData={{
                    postTitle: selectedPost.postTitle,
                    description: selectedPost.description,
                }}
                />      
            )}
            <div className={styles.analyzeWrapper}>
            <div className={styles.editbuttonTop}>
                <EditPostButton onEdit={() => handleEditClick(postData)}/>
            </div>
            <div className={styles.postThumbnailStyle}>
                <PostThumbnail post={postData} update={true} />
            </div>
            <div className={styles.postHeader}>
                <h1 className={styles.postTitleStyle}>{postData.postTitle}</h1>
                <p className={styles.postDescriptionStyle}>{postData.description}</p>
            </div>
            
            <div className={styles.infoTextStyle}>
                <p>조회수: {postData.viewCount}</p>
                <p>상태: {statusLabels[postData.analysisStatus]} ({postData.analysisProgress}%)</p>
                {postData.analysisStatusDetail && <p>진행 단계: {postData.analysisStatusDetail}</p>}
                <p>작성일: {postData.createdAt ? new Date(postData.createdAt).toLocaleDateString() : "작성일 없음"}</p>
            </div>

            <button className={styles.buttonStyle} disabled={cannotStart} onClick={() => {startMutation.mutate()}}>
                {!postData.contentUrl
                    ? "파일을 먼저 업로드해 주세요"
                    : startMutation.isPending
                        ? "분석 요청 중"
                        : isAnalyzing
                            ? "분석 진행 중"
                            : "분석 시작"}
            </button>
            </div>
        </>
    );
};

export default PostDetails;
