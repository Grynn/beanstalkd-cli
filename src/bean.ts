#!/usr/bin/env node

import { program } from "commander";
import { BeanstalkdConsumer } from "./lib/BeanstalkdConsumer";

program.version("0.0.1");
program.description(`Simple Beanstalkd CLI`);
program.option("-h,--host <host>", "Beanstalkd Host", "localhost");
program.option("-p,--port <port>", "Beanstalkd Port", "11300");

program.command("drain <tube> [tubes...]").description("Drain all messages from tube").action(drain);
program.command("list-tubes").description("List all tubes").action(listTubes);

program.command("pause").description("Pause tube").action(pause);
program.command("put").description(`Add message to tube with contents of stdin. Example: echo hello world | bean put`).action(put);
program.command("mput").description("Put contents of stdin into beanstalkd; use --delimeter (default: \\0)").action(pause);
program.command("stats").description("Show stats").action(stats);

program.on("--help", () => {
  console.log("");
  console.log("Example: mput");
  console.log("  $ find . -type f | bean mput");
  console.log("  Add one message for each filename into default tube");
});

//opts
//host, port, tube

//commands:
//pause <tube>
//drain <tube> [tube...]
//put <tube>: Put from stdin to tube
//mput <tube>: Put from stdin to tube (splitting on --delimiter="\n"). See example below.
//peek
//peek --buried
//kick <id>
//monitor

//consume: Pipe message to stdout --format (csv, json, raw)

program.parseAsync(process.argv);

async function drain(tube, tubes: string[]): Promise<void> {
  const bean = await getBean();
  tubes = [tube, ...tubes];
  console.log(`Draining messages from tube(s) ${tubes.join(",")}. Press ctrl+c to stop`);
  for await (const job of bean.consume(...tubes)) {
    console.log(`Deleting Job: ${job.id}`);
    await bean.delete(job.id);
  }
  bean.disconnect();
}

async function stats(): Promise<void> {
  const bean = await getBean();
  console.log(await bean.executeMultiPartCommand("stats\r\n"));
  bean.disconnect();
}

//Returns an array of { tube, ready, buried, reserved, producers, consumers, raw: {} }
async function listTubes(): Promise<void> {
  const bean = await getBean();

  const tubes = await bean.listTubes();
  const promises = tubes.map((tube) => bean.statsTube(tube));
  const tubeStats = await Promise.all(promises);

  const ret = [];
  for (const stats of tubeStats) {
    ret.push({
      tube: stats.name,
      ready: stats["current-jobs-ready"],
      buried: stats["current-jobs-buried"],
      total: stats["total-jobs"],
      reserved: stats["current-jobs-reserved"],
      producers: stats["current-using"],
      consumers: stats["current-watching"],
    });
  }

  console.table(ret);
  bean.disconnect();
}

async function put(): Promise<void> {
  const bean = await getBean();
  throw new Error("Not implemented");
  bean.disconnect();
}

async function pause(): Promise<void> {
  const bean = await getBean();
  throw new Error("Not implemented");
  bean.disconnect();
}

async function getBean(): Promise<BeanstalkdConsumer> {
  const bean = new BeanstalkdConsumer();
  const { host, port } = program;
  await bean.connect({ host, port });
  return bean;
}

process.on("uncaughtException", (e) => {
  console.error(e);
  process.exitCode = 1;
  process.exit();
});
