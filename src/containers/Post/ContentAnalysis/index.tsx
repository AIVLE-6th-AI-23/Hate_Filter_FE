import { useQuery } from "@tanstack/react-query";
import { fetchContentAnalysis } from "@/services/contentAnalysis";
import * as styles from './contentAnalysis.css';
import AnalysisCategoryResults from "../AnalysisCategoryResults";

interface ContentAnalysisProps {
    postId: number;
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ postId }) => {
    const { data, status, isLoading, error } = useQuery({
        queryKey: ["contentAnalysis", postId],
        queryFn: () => fetchContentAnalysis(postId),
        retry: false
    });

    if (isLoading) return <p className={styles.analysisTextStyle}>분석 결과를 불러오는 중...</p>;
    if (status === "error") throw error;
    if (!data) return <p className={styles.analysisTextStyle}>아직 분석 결과가 없습니다.</p>;

    return (
        <div className={styles.contentAnalysisContainer}>
            <h2 className={styles.analysisTitleStyle}>분석 결과</h2>
            <p className={styles.analysisTextStyle}>분석 ID: {data.analysisId}</p>
            <p className={styles.analysisTextStyle}>컨텐츠 유형: {data.contentType}</p>
            <p className={styles.analysisTextStyle}>분석 세부 정보: {data.analysisDetail}</p>
            <p className={styles.analysisTextStyle}>분석 일시: {data.analysisAt ? new Date(data.analysisAt).toLocaleString() : "작성일 없음"}</p>
            
            <AnalysisCategoryResults data={data.analysisCategoryResultResponseDto}/>
        </div>
    );
};

export default ContentAnalysis;
