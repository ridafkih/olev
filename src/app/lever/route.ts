import { DocumentHasher } from "../../modules/document-hash";
import { DataAttributeExtractor } from "../../modules/extractors/data-attribute";
import { TextContentExtractor } from "../../modules/extractors/text-content";
import { LeverJobBoardMonitor } from "../../modules/job-board-monitor";
import { RemoteDocument } from "../../modules/remote-document";
import { ServiceFactory } from "../../modules/service-factory";
import { XXHashGenerator } from "../../modules/xxhash";

const { whitelist, rateLimiter, hashStore, notifiers } = await ServiceFactory.create();

const monitor = new LeverJobBoardMonitor(whitelist, rateLimiter, hashStore, notifiers);

export async function GET(request: Request) {
  const jobBoardUrl = new URL(request.url).searchParams.get("url");
  if (!jobBoardUrl) return new Response(null, { status: 400 });

  const document = await RemoteDocument.fromUrl(jobBoardUrl);
  const hash = new XXHashGenerator();

  new DocumentHasher(document, hash)
    .updateHash("[data-qa-posting-id]", new DataAttributeExtractor("data-qa-posting-id"))
    .updateHash(".posting h5.posting-name", new TextContentExtractor());

  return await monitor.check(jobBoardUrl, hash);
}
