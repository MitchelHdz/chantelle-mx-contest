import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTFiles } from "uploadthing/server";
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
    .middleware(async ({ input, files }) => {
      try {
        const intent = verifyUploadIntentToken(input.uploadIntent);
        const uniqueName = `receipt-${intent.intentId}`;
        const filesWithUniqueNames = files.map((file) => {
          const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
          return { ...file, name: `${uniqueName}${extension}`, customId: uniqueName };
        });
        return { intentId: intent.intentId, [UTFiles]: filesWithUniqueNames };
      } catch {
        throw new UploadThingError("No pudimos validar esta carga.");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await attachReceiptToIntent(metadata.intentId, {
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        hash: file.fileHash,
      });
      return { intentId: metadata.intentId };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
