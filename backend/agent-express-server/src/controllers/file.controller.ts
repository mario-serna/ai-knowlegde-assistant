import { Request, Response } from "express";
import { fileService } from "../services/file.service";

export class FileController {

    // Upload file to a session
    async uploadFile(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No file provided",
                });
            }

            // Process the file
            const fileId = await fileService.processFile(req.file, sessionId);

            return res.status(201).json({
                success: true,
                message: "File uploaded and processed successfully",
                data: {
                    fileId,
                    filename: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    sessionId,
                },
            });
        } catch (error) {
            console.error("❌ File upload failed:", error);

            if (
                error instanceof Error &&
                error.message.includes("Only text and PDF files are allowed")
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid file type",
                    message: "Only text and PDF files are allowed",
                });
            }

            return res.status(500).json({
                success: false,
                error: "File upload failed",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Get files for a session
    async getFiles(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            // Get files from database
            const result = await fileService.getFiles(sessionId);

            return res.json({
                success: true,
                data: {
                    files: result,
                    total: result.length,
                },
            });
        } catch (error) {
            console.error("❌ Failed to get files:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to get files",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Get file chunks for a session
    async getFileChunks(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            // Get chunks from database
            const chunks = await fileService.getFileChunks(sessionId, limit);

            return res.json({
                success: true,
                data: {
                    chunks,
                    total: chunks.length,
                    limit,
                },
            });
        } catch (error) {
            console.error("❌ Failed to get file chunks:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to get file chunks",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Search for similar chunks
    async searchSimilarChunks(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const { query, limit = 5 } = req.body;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: "Query parameter is required",
                });
            }

            // Search for similar chunks
            const chunks = await fileService.searchSimilarChunks(
                sessionId,
                query,
                limit
            );

            return res.json({
                success: true,
                data: {
                    query,
                    chunks,
                    total: chunks.length,
                },
            });
        } catch (error) {
            console.error("❌ Search failed:", error);
            return res.status(500).json({
                success: false,
                error: "Search failed",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    // Delete a file
    async deleteFile(req: Request, res: Response) {
        try {
            const { fileId } = req.params;

            // Delete the file
            await fileService.deleteFile(fileId);

            return res.json({
                success: true,
                message: "File deleted successfully",
            });
        } catch (error) {
            console.error("❌ Failed to delete file:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to delete file",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export default new FileController();
