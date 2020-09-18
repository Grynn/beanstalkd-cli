#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const BeanstalkdConsumer_1 = require("./lib/BeanstalkdConsumer");
commander_1.program.version("0.0.1");
commander_1.program.description(`Simple Beanstalkd CLI`);
commander_1.program.option("-h,--host <host>", "Beanstalkd Host", "localhost");
commander_1.program.option("-p,--port <port>", "Beanstalkd Port", "11300");
commander_1.program.command("drain <tube> [tubes...]").description("Drain all messages from tube").action(drain);
commander_1.program.command("list-tubes").description("List all tubes").action(listTubes);
commander_1.program.command("pause").description("Pause tube").action(pause);
commander_1.program.command("put").description(`Add message to tube with contents of stdin. Example: echo hello world | bean put`).action(put);
commander_1.program.command("mput").description("Put contents of stdin into beanstalkd; use --delimeter (default: \\0)").action(pause);
commander_1.program.command("stats").description("Show stats").action(stats);
commander_1.program.on("--help", () => {
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
commander_1.program.parseAsync(process.argv);
async function drain(tube, tubes) {
    const bean = await getBean();
    tubes = [tube, ...tubes];
    console.log(`Draining messages from tube(s) ${tubes.join(",")}. Press ctrl+c to stop`);
    for await (const job of bean.consume(...tubes)) {
        console.log(`Deleting Job: ${job.id}`);
        await bean.delete(job.id);
    }
    bean.disconnect();
}
async function stats() {
    const bean = await getBean();
    console.log(await bean.executeMultiPartCommand("stats\r\n"));
    bean.disconnect();
}
//Returns an array of { tube, ready, buried, reserved, producers, consumers, raw: {} }
async function listTubes() {
    const bean = await getBean();
    const tubes = await bean.listTubes();
    const promises = tubes.map((tube) => bean.statsTube(tube));
    const tubeStats = await Promise.all(promises);
    let ret = [];
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
async function put() {
    const bean = await getBean();
    throw new Error("Not implemented");
    bean.disconnect();
}
async function pause() {
    const bean = await getBean();
    bean.executeCommand();
    bean.disconnect();
}
async function getBean() {
    const bean = new BeanstalkdConsumer_1.BeanstalkdConsumer();
    const { host, port } = commander_1.program;
    await bean.connect({ host, port });
    return bean;
}
process.on("uncaughtException", (e) => {
    console.error(e);
    process.exitCode = 1;
    process.exit();
});
//# sourceMappingURL=bean.js.map