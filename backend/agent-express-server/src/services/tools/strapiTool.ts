import { tool } from "@langchain/core/tools";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { StrapiService } from "../external/strapi.service";

export class StrapiTool {

    private strapiService: StrapiService;

    constructor() {
        this.strapiService = new StrapiService();
    }

    getDocuments = tool(
        async () => {
            const result = await this.strapiService.getDocuments();
            console.log("Documents from strapi tool", result);
            return result;
        },
        {
            name: "strapi_get_documents",
            description: "Only call this tool to get documents from strapi.  Never use for general questions.",
            schema: z.object({}).describe("No arguments needed"),
        }
    );

    saveDocument = tool(
        async (input) => {
            console.log("Saving document to strapi", input);
            const { content } = input as { content: string };
            console.log("Saving document to strapi", content);
            const slug = uuidv4();
            const result = await this.strapiService.addDocument({ content, slug });
            console.log("Document saved to strapi", result);
            return result;
        },
        {
            name: "strapi_save_document",
            description: "Only call this tool to save a document to strapi. Never use for general questions.",
            schema: z.object({
                content: z.string().describe("The document content to save.")
            }),
        }
    );
}

export const strapiTool = new StrapiTool();
