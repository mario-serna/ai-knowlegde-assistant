export interface UploadFileResponse {
    success: boolean;
    error?: string;
    message: string;
    data: UploadedFile;
}

export interface GetFilesResponse {
    success: boolean;
    error?: string;
    message: string;
    data: { files: UploadedFile[] };
}

export interface UploadedFile {
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    sessionId: string;
    createdAt: string;
}