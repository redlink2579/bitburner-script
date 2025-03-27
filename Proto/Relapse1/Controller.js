//Welcome to my mostly undocumented Proto-batcher
//By redlink2579(@Greytider)
//Credits: Darktechnomancer's guide to batcher that I steal code from
import { isPrepped, prep, placescript, getnetwork, servercheck, debugprint } from "Proto/Relapse1/Utils.js";

//Bunch of constant for stuff I will be using
const jobs = ["hack", "weaken1", "grow", "weaken2"]
const tools = ["Proto/Relapse1/hack.js", "Proto/Relapse1/grow.js", "Proto/Relapse1/weaken.js"]
const use = { hack: "Proto/Relapse1/hack.js", weaken1: "Proto/Relapse1/weaken.js", grow: "Proto/Relapse1/grow.js", weaken2: "Proto/Relapse1/weaken.js" }
const wages = { hack: 1.70, weaken1: 1.75, grow: 1.75, weaken2: 1.75 }
const order = { hack: 0, weaken1: 1, grow: 2, weaken2: 3 }

//Debug print stuff(see Utils.js file)
const debugmode = false
const debugtype = 1
export function debug(ns, string) {
  debugprint(ns, debugmode, string, debugtype)
}

//Main function
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog(`ALL`);
  ns.print(`Debug?: ${debugmode}`)
  ns.ui.openTail();
  ns.ui.resizeTail(500, 250)

  let batchcount = 0;
  while (true) {
    const reportport = ns.getPortHandle(ns.pid);
    reportport.clear();

    let target = "n00dles";
    const network = getnetwork(ns, (server) => {
      target = servercheck(ns, server, target, ns.fileExists("Formulas.exe", "home"));
      debug(ns, target)
      placescript(ns, server, tools, true);
      return ns.hasRootAccess(server);
    });
    const ramhost = new RamHost(ns, network);
    const data = new Data(ns, target);
    if (!isPrepped(ns, target)) await   prep(ns, data, ramhost)
    optimizeBatch(ns, data, ramhost);
    data.calculate(ns);

    const batch = [];
    batchcount++;
    for (const job of jobs) {
      data.ends[job] = Date.now() + data.wTime + data.spacer * order[job];
      const work = new Work(job, data);
      work.batch = batchcount;
      if (!ramhost.assign(work)) {
        ns.print(`ERROR: Unable to assign ${job}. Dumping debug info`)
        debug(ns, work);
        debug(ns, data);
        ramhost.printhost(ns)
      }
      batch.push(work);
    }
    for (const work of batch) {
      work.end += data.delay;
      const workpid = ns.exec(use[work.job], work.host, { threads: work.threads, temporary: true }, JSON.stringify(work));
      if (!workpid) throw new Error(`Unable to deploy ${work.job}`)
      const tport = ns.getPortHandle(workpid);
      await tport.nextWrite()
      data.delay += tport.read()
    }
    const timer = setInterval(() => {
      ns.clearLog();
      if(debugmode) ns.print(`Debug enabled!`)
      ns.print(`===================================================`);
      ns.print(`Hacking \$${ns.formatNumber(data.maxMoney * data.yoink)} from ${data.target}`);
      ns.print(`Running batch: ETA ${ns.tFormat(data.ends.weaken2 - Date.now())}`);
      ns.print(`---------------------------------------------------`);
      ns.print(`Target info:`)
      ns.print(`Target: ${data.target}`)
      ns.print(`┣━ Money: ${ns.formatNumber(data.money, 2, 1e3, true)}\$ / ${ns.formatNumber(data.maxMoney, 2, 1e3, true)}\$`)
      ns.print(`┣━ Security: + ${(data.sec - data.minSec).toFixed(2)}`)
      ns.print(`┗━ Batch count: ${batchcount}`)
      ns.print(`===================================================`);
    });
    ns.atExit(() => {
      clearInterval(timer);
    })
    await reportport.nextWrite();
    reportport.clear();
    clearInterval(timer);
  }
}

class Work {
  constructor(job, data, host = "none") {
    this.job = job;
    this.end = data.ends[job];
    this.time = data.times[job];
    this.target = data.target;
    this.threads = data.threads[job];
    this.cost = this.threads * wages[job];
    this.host = host;
    this.report = this.job === "weaken2";
    this.port = data.port;
    this.batch = 0;
  }
}

class Data {
  /** @param {NS} ns */
  constructor(ns, target) {
    debug(ns, target)
    this.target = target;
    this.maxMoney = ns.getServerMaxMoney(target);
    this.money = Math.max(ns.getServerMoneyAvailable(target), 1);
    this.minSec = ns.getServerMinSecurityLevel(target);
    this.sec = ns.getServerSecurityLevel(target);
    this.prepped = isPrepped(ns, target);
    this.chance = 0;
    this.wTime = 0;
    this.delay = 0;
    this.spacer = 5;
    this.yoink = 0.2;

    this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

    this.port = ns.pid
  }

  /** @param {NS} ns */
  calculate(ns, yoink = this.yoink) {
    const server = this.target;
    const maxMoney = this.maxMoney;
    this.money = ns.getServerMoneyAvailable(server);
    this.sec = ns.getServerSecurityLevel(server);
    this.wTime = ns.getWeakenTime(server);
    this.times.weaken1 = this.wTime;
    this.times.weaken2 = this.wTime;
    this.times.hack = this.wTime / 4;
    this.times.grow = this.wTime * 0.8;
    this.depth = this.wTime / this.spacer * 4;

    const hPercent = ns.hackAnalyze(server);
    const amount = maxMoney * yoink;
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(server, amount)), 1);
    const tyoink = hPercent * hThreads;
    const gThreads = Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * tyoink)));
    this.threads.weaken1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
    this.threads.weaken2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
    this.threads.hack = hThreads;
    this.threads.grow = gThreads;
    this.chance = ns.hackAnalyzeChance(server)
  }
}

class RamHost {
  #ramhosts = []
  #minramsize = Infinity;
  #maxramsize = 0;
  #totalram = 0;
  #maxram = 0;
  #prepThreats = 0;
  #index = new Map()

  /** @param {NS} ns */
  constructor(ns, servers) {
    for (const server of servers) {
      if (ns.hasRootAccess(server)) {
        const maxRam = ns.getServerMaxRam(server);
        const ram = maxRam - ns.getServerUsedRam(server);
        if (ram >= 1.70) {
          const ramhosts = { server: server, ram: ram }
          this.#ramhosts.push(ramhosts);
          if (ram < this.#minramsize) this.#minramsize = ram;
          if (ram > this.#maxramsize) this.#maxramsize = ram;
          this.#totalram += ram;
          this.#maxram += maxRam;
          this.#prepThreats += Math.floor(ram / 1.75);
        }
      }
    }
    this.#sort();

    this.#ramhosts.forEach((ramhost, index) => this.#index.set(ramhost.server, index))
  }

  #sort() {
    this.#ramhosts.sort((x, y) => {
      if (x.server === "home") return 1;
      if (y.server === "home") return -1;

      return x.ram - y.ram
    })
  }

  gethost(server) {
    if (this.#index.has(server)) {
      return this.#ramhosts[this.#index.get(server)];
    } else {
      throw new Error(`Server ${server} not found in ramhost`)
    }
  }

  get totalram() {
    return this.#totalram
  }

  get maxram() {
    return this.#maxram
  }

  get maxramsize() {
    return this.#maxramsize
  }

  get prepThreads() {
    return this.#prepThreats
  }

  assign(Work) {
    const ramhost = this.#ramhosts.find(ramhost => ramhost.ram >= Work.cost);
    if (ramhost) {
      Work.host = ramhost.server;
      ramhost.ram -= Work.cost;
      this.#totalram -= Work.cost;
      return true;
    } else return false
  }

  finish(Work) {
    const ramhost = this.gethost(Work.server)
    ramhost.ram += Work.cost
    this.#totalram += Work.cost
  }

  simhost() {
    return this.#ramhosts.map(ramhost => ({ ...ramhost }));
  }

  printhost(ns) {
    for (const ramhost of this.#ramhosts) ns.tprint(ramhost)
  }
}

/**
 * @param {NS} ns
 * @param {Data} data
 * @param {RamHost} ramhost
 */
export function optimizeBatch(ns, data, ramhost) {

  const maxThreads = Math.floor(ramhost.maxramsize / 1.75);
  const maxMoney = data.maxMoney;
  const hPercent = ns.hackAnalyze(data.target);

  const minyoink = 0.001;
  const minstep = 0.001;
  let yoink = 0.99;
  while (yoink > minyoink) {
    const amount = maxMoney * yoink
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(data.target, amount)), 1);
    const tYoink = hPercent * hThreads
    const growthreads = Math.ceil(ns.growthAnalyze(data.target, maxMoney / (maxMoney - maxMoney * tYoink)));

    if (Math.max(hThreads, growthreads) <= maxThreads) {
      const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
      const wThreads2 = Math.max(Math.ceil(growthreads * 0.004 / 0.05), 1);

      const threadCost = [hThreads * 1.7, wThreads1 * 1.75, growthreads * 1.75, wThreads2 * 1.75];
      debug(ns, threadCost)
      const pRam = ramhost.simhost();
      let found;
      for (const cost of threadCost) {
        found = false
        for (const host of pRam) {
          if (host.ram < cost) continue;
          found = true
          host.ram -= cost;
          break;
        }
        if (found) continue
        break;
      }
      if (found) {
        data.yoink = yoink;
        data.threads = { hack: tYoink, weaken1: wThreads1, grow: growthreads, weaken2: wThreads2 }
        return true
      }
    }
    yoink -= minstep;
  }
  throw new Error(`Not enough ram to run a single batch, something gone really FUBAR`)
}
