import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { attachReceiptToIntent } from "@/lib/data/participations";
import { verifyUploadIntentToken } from "@/lib/security/crypto";

const upload = createUploadthing();

export const uploadRouter = {
  receipt: upload({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
      acl: "private",
      contentDisposition: "attachment",
    },
  }, { presignedURLTTL: "15m", awaitServerData: true })
    .input(z.object({ uploadIntent: z.string().min(40).max(2048) }))
    .middleware(async ({ input }) => {
      try {
        const intent = verifyUploadIntentToken(input.uploadIntent);
        return { intentId: intent.intentId };
      } catch {
        throw new UploadThingError("No pudimos validar esta carga.");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await attachReceiptToIntent(metadata.intentId, file.key);
      return { intentId: metadata.intentId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
