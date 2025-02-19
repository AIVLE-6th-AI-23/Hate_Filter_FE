import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Post } from '@/types/types';
import InfiniteScrollList from '@/components/InfiniteScrollList';
import PostThumbnail from '@/components/PostThumbnail';
import * as styles from './postSection.css';
import DeletePostButton from '@/components/PostActionButton/Delete';
import { incrementViewCount } from '@/services/post';

interface PostSectionProps {
    title: string;
    posts: Post[];
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    inProgress: boolean;
    onDeleteModal: (postId: number) => void; 
}

const PostSection: React.FC<PostSectionProps> = ({ title, posts, fetchNextPage, isFetchingNextPage, inProgress, onDeleteModal }) => {
    const pathName = usePathname();
    const router = useRouter();

    const handlePostClick = async (boardId: number, postId: number) => {
        try {
            await incrementViewCount({ boardId, postId }); // ✅ 조회수 증가 API 호출
            router.push(`${pathName}/${postId}`);
        } catch (error) {
            console.error("조회수 증가 실패:", error);
            router.push(`${pathName}/${postId}`); // 에러 발생 시에도 페이지 이동
        }
    };

    return (
        <section className={styles.postSection}>
            <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            </div>
            <div className={styles.postConent}>
            <InfiniteScrollList
                data={posts}
                renderItem={(post) => (
                    <div
                        key={post.postId} 
                        className={styles.postItem}
                        onClick={() => handlePostClick(post.boardId, post.postId)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.postsWrapper}>
                            <div className={styles.deleteHidden}>
                                <div className={styles.postActions}>
                                    <DeletePostButton 
                                    postId={post.postId} 
                                    onOpenModal={onDeleteModal}
                                    />
                                </div>
                            </div>
                                <div>
                                    <PostThumbnail post={post} update={false} />
                                </div>
                                <div className={styles.postBody}>
                                <h3 className={styles.postTitle}>{post.postTitle}</h3>
                                <p className={styles.postDescription}>{post.description}</p>
                                {inProgress && <p className={styles.postStatus}>상태: {post.analysisStatus} ({post.analysisProgress}%)</p>}
                                <p className={styles.postViewCount}>조회수: {post.viewCount}</p>
                            </div>
                        </div>
                    </div>
                    
                )}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
           </div>
        </section>
    );
};

export default PostSection;
