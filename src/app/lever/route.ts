import { JobBoardMonitor } from "../../modules/job-board-monitor";
import { ServiceFactory } from "../../modules/service-factory";

const { whitelist, rateLimiter, hashStore, notifiers } =
  await ServiceFactory.create();

const monitor = new JobBoardMonitor(
  whitelist,
  rateLimiter,
  hashStore,
  notifiers,
);

export async function GET(request: Request) {
  const jobBoardUrl = new URL(request.url).searchParams.get("url");
  if (!jobBoardUrl) return new Response(null, { status: 400 });

  return await monitor.check(jobBoardUrl);
}
