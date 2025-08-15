import { GetFilesResponse, UploadFileResponse } from "@/types";

export const uploadFile = async (file: File, sessionId: string): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions/" + sessionId + "/files", {
        method: "POST",
        body: formData,
    });
    return response.json();
};

export const getFiles = async (sessionId: string): Promise<GetFilesResponse> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/sessions/" + sessionId + "/files");
    return response.json();
};