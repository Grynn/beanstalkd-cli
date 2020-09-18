"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JackdClient = require("jackd");
const console_1 = require("console");
class BeanstalkdConsumer extends JackdClient {
    /*
     * Wait for messages on any of the specified input tubes ('default' if none specified)
     * Returns an async iterator for consumption with for await of
     * Example: for await (const [id, payload] of bean.consume()) { console.log(payload); bean.delete(id); }
     */
    async *consume(...tubes) {
        await Promise.all(tubes.map((tube) => super.watch(tube)));
        while (super.isConnected()) {
            yield super.reserve();
        }
        return null;
    }
    async listTubes() {
        const tubes = await super.executeMultiPartCommand("list-tubes\r\n");
        let lines = tubes.split("\n");
        console_1.assert(lines.length >= 2);
        lines.shift(); //Remove first (---)
        lines.pop(); //Remove last (blank)
        lines = lines.map((line) => line.slice(2));
        return lines;
    }
    async statsTube(tube) {
        console_1.assert(tube);
        const reply = await super.executeMultiPartCommand(`stats-tube ${tube}\r\n`);
        let lines = reply.split("\n");
        lines = lines.slice(1); //remove leading "---"
        lines.pop();
        const o = {};
        for (const line of lines) {
            const [k, v] = line.split(":", 2);
            if (k !== "name" && v) {
                o[k] = Number.parseInt(v);
            }
            else {
                o[k] = v && v.trim();
            }
        }
        return o;
    }
}
exports.BeanstalkdConsumer = BeanstalkdConsumer;
//# sourceMappingURL=BeanstalkdConsumer.js.map