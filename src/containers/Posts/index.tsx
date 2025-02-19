import React, { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPosts, deletePost } from '@/services/post';
import { Posts } from '@/types/types';
import PostSection from './PostSection';
import * as styles from './posts.css';
import CreatePostButton from '@/components/PostActionButton/Create';
import DeleteModal from "@/components/DeleteModal";
import GlobalLoadingBar from '@/components/LoadingBar';
import ToggleButton from '@/components/ToggleButton';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';


interface PostListProps {
    boardId: number;
    boardTitle: string;
}

const PostsPage: React.FC<PostListProps> = ({ boardId, boardTitle }) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        isLoading,
        status
    } = useInfiniteQuery({
        queryKey: ['posts', boardId],
        queryFn: ({ pageParam = null }) => fetchPosts({ boardId, pageParam }),
        getNextPageParam: (lastPage: Posts) =>
            lastPage.length > 0 ? lastPage[lastPage.length - 1].createdAt : null,
        throwOnError:(error: AxiosError) => {
            if(error.response?.status === 403 || error.response?.status === 401){
                router.push("/login");
                return false;
            } else {
                return true;
            }
        },
        initialPageParam: null,
        refetchOnWindowFocus: false,
        retry: false,
    });

    const [isActive, setIsActive] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

    const allPosts = data?.pages.flatMap((page) => page) || [];
    const todoPosts = allPosts.filter((post) => post.analysisStatus === "READY");
    const inProgressPosts = allPosts.filter((post) => post.analysisStatus !== "READY");


    const handleDeleteModal = (postId: number) => {
        setPostIdToDelete(postId);  // 삭제할 포스트 ID 설정
        setIsDeleteModalOpen(true);  // 모달 열기
    };

    const deleteMutation = useMutation({
        mutationFn: (postId: number) => deletePost({ boardId, postId }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts", boardId],
            });
            setIsDeleteModalOpen(false);
        },
        onError: (e) => { alert("게시글 삭제 실패"); setIsDeleteModalOpen(false); throw e;},
        throwOnError: true
    });

    const confirmDelete = () => {
        if (postIdToDelete !== null && boardId !== undefined) {
            deleteMutation.mutate(postIdToDelete);
        } else {
            alert("삭제할 포스트 ID가 없습니다.");
        }
    };

    useEffect(() => {
        if (status === "error") {
            queryClient.resetQueries({ queryKey: ["posts", boardId] });
            throw new Error();
        }
    }, [status, queryClient, boardId]);


    return (

        <div className={styles.postContainer}>
            {isLoading && <GlobalLoadingBar />}
            <div className={styles.postsHeader}>
                <ToggleButton isActive={isActive}
                    onToggle={() => setIsActive((prev: boolean) => !prev)}
                    labels={["Todo", "In Progress"]} />
                <h1 className={styles.postsTitle}>{boardTitle}</h1>
                <CreatePostButton boardId={boardId} />
            </div>
            <div className={styles.postSectionWrapper}>
                {isActive && (
                    <PostSection
                        title="To Do"
                        posts={todoPosts}
                        fetchNextPage={fetchNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        inProgress={false}
                        onDeleteModal={handleDeleteModal}

                    />
                )}
                {!isActive && (
                    <PostSection
                        title="In Progress"
                        posts={inProgressPosts}
                        fetchNextPage={fetchNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        inProgress={true}
                        onDeleteModal={handleDeleteModal}
                    />
                )}
            </div>
            {/* 삭제 모달 */}
            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
};

export default PostsPage;
