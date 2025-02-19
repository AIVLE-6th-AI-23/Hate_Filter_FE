export interface UserInfoRequest {
    employeeId: string,
    userName: string,
    email: string,
    password: string,
    deptId: string,
}

export interface UserResponse {
    userName: string,
    deptId: string,
}

export interface Board {
    deptIds: string[];
    boardId: number;
    boardTitle: string;
    description : string;
    createdAt: string;
    endDate : string | null;
}

export interface DepartmentOption {
    value: string;
    label: string;
}

export type Boards = Board[];

export interface BoardRequest {
    boardTitle: string;
    description: string;
    endDate: string | null;
    deptIds: string[];
}

export interface PostRequest {
    boardId : number;
    postTitle : string;
    description : string;
}

export interface Post {
    postId : number;
    boardId : number;
    userId : number;
    postTitle : string;
    description : string;
    contentUrl : string | null;
    createdAt : string;
    modifiedAt : string | null;
    viewCount : number;
    analysisStatus : AnalysisStatus;
    analysisProgress : number;
    analysisStatusDetail : string | null;
}

export type AnalysisStatus = "READY" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type Posts = Post[];

export interface AnalysisCategoryResult {
    resultId: number;
    categoryScore: number;
    detectionMetadata: string;
    categoryName: string;
    description: string;
    severityLevel: number;
}

export type analysisCategoryResultResponseDto = AnalysisCategoryResult[];

export interface ContentAnalysis {
    analysisId: number;
    contentType: string;
    analysisDetail: string;
    analysisAt: string;
    analysisCategoryResultResponseDto: analysisCategoryResultResponseDto;
}

export type ContentAnalysisResponse = ContentAnalysis | null;
