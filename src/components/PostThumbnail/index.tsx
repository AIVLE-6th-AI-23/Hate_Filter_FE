import React, { useState, useEffect } from "react";
import { updatePostThumbnail } from "@/services/post";
import { Post } from "@/types/types";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import * as styles from "./postThumbnail.css";
import { useQueryClient } from "@tanstack/react-query";

interface PostThumbnailProps {
    post: Post;
    update: boolean;
}

// 텍스트 파일 확장자 목록
const textFileExtensions = [".txt", ".md", ".csv", ".json", ".xml", ".log"];

const PostThumbnail: React.FC<PostThumbnailProps> = ({ post, update }) => {
    const queryClient = useQueryClient();
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);

    // 저장된 콘텐츠가 존재하면 처리
    useEffect(() => {
        const contentUrl = post.contentUrl;
        if (contentUrl) {
            const isTextFile = textFileExtensions.some(ext => contentUrl.toLowerCase().endsWith(ext));

            if (isTextFile) {
                // 텍스트 파일이면 fetch로 내용을 불러옴
                fetch(contentUrl)
                    .then(response => response.text())
                    .then(data => {
                        setTextContent(data);
                        setFilePreview(null);
                    })
                    .catch(() => {
                        setTextContent("파일을 불러오는 중 오류가 발생했습니다.");
                    });
            } else {
                // 이미지 또는 영상이면 미리보기 설정
                setFilePreview(contentUrl);
                setTextContent(null);
            }
        } else {
            setFilePreview(null);
            setTextContent(null);
        }
    }, [post.contentUrl]);

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // 파일 확장자로 텍스트 파일 여부 확인
        const isTextFile = textFileExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (isTextFile) {
            setFilePreview(null); // 이미지 미리보기 제거
            const reader = new FileReader();
            reader.onload = (e) => {
                setTextContent(e.target?.result as string);
            };
            reader.readAsText(file);
        } else {
            setTextContent(null); // 텍스트 내용 초기화
            setFilePreview(URL.createObjectURL(file));
        }

        const contentUrl = await updatePostThumbnail({ boardId: post.boardId, postId: post.postId, file });
        if (!contentUrl) {
            alert("파일 업로드에 실패했습니다.");
            return;
        }

        queryClient.setQueryData<Post>(["post", post.boardId, post.postId], (current) => ({
            ...(current ?? post),
            contentUrl,
            analysisStatus: "READY",
            analysisProgress: 0,
            analysisStatusDetail: null,
        }));
        queryClient.setQueryData(["contentAnalysis", post.postId], null);
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileUpload(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
            "video/*": [],
            "text/plain": [], // 텍스트 파일 허용
        },
        multiple: false,
        disabled: !update,
    });

    return (
        <div>
            <div
                {...getRootProps()}
                className={styles.dragArea}
                style={{
                    width: "100%",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    marginTop: "10px",
                    border: "2px dashed gray",
                }}
            >
                {filePreview ? (
                    filePreview.endsWith(".mp4") || filePreview.endsWith(".webm") || filePreview.endsWith(".ogg") ? (
                        <video width="200px" height="200px" controls>
                            <source src={filePreview} type="video/mp4" />
                            동영상을 재생할 수 없습니다.
                        </video>
                    ) : (
                        <Image src={filePreview} alt="업로드된 이미지" width={200} height={200} />
                    )
                ) : textContent ? (
                    <div
                        style={{
                            whiteSpace: "pre-wrap",
                            maxWidth: "200px",
                            maxHeight: "200px",
                            overflow: "auto",
                            padding: "10px",
                            background: "#f9f9f9",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                        }}
                    >
                        {textContent}
                    </div>
                ) : (
                    <Image src="/images/No-Image-Placeholder.png" alt="No Image" width={200} height={200} />
                )}
                <input {...getInputProps()} />
            </div>
        </div>
    );
};

export default PostThumbnail;
