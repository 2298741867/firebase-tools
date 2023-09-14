import { Command } from "../command";
import { Options } from "../options";
import { needProjectId } from "../projectUtils";
import requireInteractive from "../requireInteractive";
import * as gcp from "../gcp/frameworks";
import { ListStacksResponse } from "../gcp/frameworks";

export const command = new Command("stacks:list")
  .description("List stacks of a Firebase project.")
  .option("-l, --location <location>", "Stack backend location", "us-central1")
  .before(requireInteractive)
  .action(async (options: Options) => {
    const projectId = needProjectId(options);
    const location = options.location as string;
    const stacks: ListStacksResponse = await gcp.listStack(projectId, location);

    return stacks;
  });
