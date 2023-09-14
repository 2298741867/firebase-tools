import { Command } from "../command";
import { Options } from "../options";
import { needProjectId } from "../projectUtils";
import requireInteractive from "../requireInteractive";
import * as gcp from "../gcp/frameworks";

export const command = new Command("stacks:delete")
  .description("Delete a stack from your Firebase project")
  .option("-l, --location <location>", "Stack backend location", "us-central1")
  .option("-stack, --stackId <stackId>", "Stack backend location", "")
  .before(requireInteractive)
  .action(async (options: Options) => {
    const projectId = needProjectId(options);
    const location = options.location as string;
    const stackId = options.stackId as string;
    await gcp.deleteStack(projectId, location, stackId);
  });
