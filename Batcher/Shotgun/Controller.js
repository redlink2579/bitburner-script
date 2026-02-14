import { isPrepped, prep, placescript, getnetwork, servercheck, debugPrint } from "Batcher/libs/Utils.js";
import { TargetData, WorkData } from "Batcher/Shotgun/Data.js"
import { RamHost } from "Batcher/Shotgun/Ramhost.js"
import { optimizeBatch } from "Batcher/Shotgun/OptimizeBatch.js"

const jobs = ["hack", "grow", "weaken"]
const tools = ["Batcher/worker/hack.js", "Batcher/worker/grow.js", "Batcher/worker/weaken.js"]
const use = { hack: "Batcher/worker/hack.js", grow: "Batcher/worker/grow.js", weaken: "Batcher/worker/weaken.js" }
const wages = { hack: 1.70, grow: 1.75, weaken: 1.75 }
const order = { hack: 0, grow: 1, weaken: 2 }
let mode = 0

/** @param {NS} ns */
export async function main(ns) {
  let tuiport = null;
  while (true) {
    const reportport = ns.getPortHandle(ns.pid);
    reportport.clear();

    let target = "n00dles";
    const network = getnetwork(ns, (server) => {
      target = servercheck(ns, server, target, ns.fileExists("Formulas.exe", "home"));
      placescript(ns, server, tools, true);
      return ns.hasRootAccess(server);
    });
    const ramhost = new RamHost(ns, network);
    let targetdata = new TargetData(ns, target);
    let workdata = new WorkData(ns, targetdata)
    //if (tuiport == null || !ns.scriptRunning("Batcher/TUI.js", "home")) {
    //  tuiport = ns.exec("Batcher/TUI.js", "home", { temporary: true }, "proto", true)
    //}
    let info = { mode: mode, target: target, yoink: workdata.take };
    //ns.writePort(tuiport, info)
    while (!isPrepped(ns, target)) {
      //ns.clearPort(tuiport)
      mode = 2
      info.mode = mode
      //ns.writePort(tuiport, info)
      await prep(ns, workdata, ramhost, info)
      targetdata = new TargetData(ns, target);
      workdata = new WorkData(ns, targetdata);
    }
    workdata.calc(ns, ns.fileExists("Formulas.exe", "home"));
    await optimizeBatch(ns, workdata, ramhost);
    workdata.calc(ns, ns.fileExists("Formulas.exe", "home"));

    const batch = [];
    let batchcount = 0

    workdata.ends = Date.now() + workdata.times.weaken - workdata.spacer;

    while (batchcount++ < workdata.depth) {
      for (const job of jobs) {
        workdata.ends += workdata.spacer
        const work = new Work(job, workdata, batchcount);
        ns.print(job)
        if (!ramhost.assign(work)) {
          ns.print(`ERROR: Unable to assign ${job}. Dumping debug info`)
          debug(ns, JSON.stringify(work));
          debug(ns, JSON.stringify(data));
          ramhost.printhost(ns)
        }
        batch.push(work);
      }
    }
    debugger
    for (const work of batch) {
      work.end += workdata.delay;
      ns.print(work)
      const workpid = ns.exec(use[work.job], work.host, { threads: work.threads, temporary: true }, JSON.stringify(work));
      if (!workpid) throw new Error(`Unable to deploy ${work.job}`)
      const tport = ns.getPortHandle(workpid);
      await tport.nextWrite()
      data.delay += tport.read()
    }
    batch.reverse();
    mode = 1;
    info.mode = mode;
    info.yoink = workdata.take;
    //ns.clearPort(tuiport)
    //ns.writePort(tuiport, info)
    let tEnd = data.wTime + data.spacer
    ns.tprint(`Running batch ${batchcount} for ${ns.tFormat(tEnd)}`)
    await reportport.nextWrite();
    reportport.clear();
  }
}

class Work {
  constructor(job, workdata, batch) {
    this.job = job;
    this.end = workdata.ends[job];
    this.time = workdata.times[job];
    this.target = workdata.target;
    this.threads = workdata.threads[job];
    this.cost = this.threads * wages[job];
    this.host = "none";
    this.report = true;
    this.port = workdata.port;
    this.batch = batch;
  }
}
