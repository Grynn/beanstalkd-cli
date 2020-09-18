import JackdClient = require("jackd");
import { assert } from "console";

interface IStatsTubeResponse {
  name: string;
  "current-jobs-urgent": number;
  "current-jobs-ready": number;
  "current-jobs-reserved": number;
  "current-jobs-delayed": number;
  "current-jobs-buried": number;
  "total-jobs": number;
  "current-using": number;
  "current-watching": number;
  "current-waiting": number;
  "cmd-delete": number;
  "cmd-pause-tube": number;
  pause: boolean;
  "pause-time-left": number;
}

export class BeanstalkdConsumer extends JackdClient {
  /*
   * Wait for messages on any of the specified input tubes ('default' if none specified)
   * Returns an async iterator for consumption with for await of
   * Example: for await (const [id, payload] of bean.consume()) { console.log(payload); bean.delete(id); }
   */
  async *consume(...tubes: string[]) {
    await Promise.all(tubes.map((tube) => super.watch(tube)));

    while (super.isConnected()) {
      yield super.reserve();
    }

    return null;
  }

  async listTubes() {
    const tubes = await super.executeMultiPartCommand("list-tubes\r\n");
    let lines = tubes.split("\n");
    assert(lines.length >= 2);
    lines.shift(); //Remove first (---)
    lines.pop(); //Remove last (blank)
    lines = lines.map((line) => line.slice(2));
    return lines;
  }

  async statsTube(tube: string): Promise<IStatsTubeResponse> {
    assert(tube);
    const reply = await super.executeMultiPartCommand(`stats-tube ${tube}\r\n`);
    let lines = reply.split("\n");
    lines = lines.slice(1); //remove leading "---"
    lines.pop();
    const o: IStatsTubeResponse = <any>{};
    for (const line of lines) {
      const [k, v] = line.split(":", 2);
      if (k !== "name" && v) {
        o[k] = Number.parseInt(v);
      } else {
        o[k] = v && v.trim();
      }
    }
    return o;
  }
}
