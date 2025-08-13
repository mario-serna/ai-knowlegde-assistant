import { env } from "../../config/env";

export interface StrapiDocument {
    id: number;
    documentId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    slug: string;
}

interface StrapiMeta {
    pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
}

export interface StrapiDocumentRequest {
    content: string;
    slug: string;
}

export interface StrapiDocumentsResponse {
    data: StrapiDocument[];
    meta: StrapiMeta;
}

export interface StrapiDocumentResponse {
    data: StrapiDocument;
    meta: StrapiMeta;
}

export class StrapiService {
    private baseUrl: string;
    private apiKey: string;
    constructor() {
        this.baseUrl = env.STRAPI_BASE_URL;
        this.apiKey = env.STRAPI_API_KEY;
    }

    async getDocuments() {
        try {
            const response = await fetch(`${this.baseUrl}/document-categories`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            const data = await response.json() as StrapiDocumentsResponse;
            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error("Failed to get documents:", error);
            return {
                success: false,
                error: "Failed to get documents",
            };
        }
    }

    async addDocument(document: StrapiDocumentRequest) {
        try {
            const { content, slug } = document;
            const response = await fetch(`${this.baseUrl}/document-categories`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: { content, slug } }),
            });
            const data = await response.json() as StrapiDocumentResponse;
            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error("Failed to add document:", error);
            return {
                success: false,
                error: "Failed to add document",
            };
        }
    }
}

export const strapiService = new StrapiService();
