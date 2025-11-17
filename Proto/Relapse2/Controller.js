//Welcome to my mostly undocumented (NOT)Proto-batcher
//By redlink2579(@Greytider)
//Credits: Darktechnomancer's guide to batcher that I steal code from
import { isPrepped, prep, placescript, getnetwork, servercheck, debugprint } from "Proto/Relapse2/Utils.js";

//Bunch of constant for stuff I will be using
const jobs = ["hack", "weaken1", "grow", "weaken2"]
const tools = ["Proto/Relapse2/hack.js", "Proto/Relapse2/grow.js", "Proto/Relapse2/weaken.js"]
const use = { hack: "Proto/Relapse2/hack.js", weaken1: "Proto/Relapse2/weaken.js", grow: "Proto/Relapse2/grow.js", weaken2: "Proto/Relapse2/weaken.js" }
const wages = { hack: 1.70, weaken1: 1.75, grow: 1.75, weaken2: 1.75 }
//const order = { hack: 0, weaken1: 1, grow: 2, weaken2: 3 }
const maxbatch = 100000
let mode = 0

//Debug print stuff(see Utils.js file)
const debugmode = false
const debugtype = 1
export function debug(ns, string) {
  debugprint(ns, debugmode, string, debugtype)
}

//Main function
/** @param {NS} ns */
export async function main(ns) {
  ns.print(`Debug?: ${debugmode}`)
  const form = ns.formulas//Used to handle level up mid-batch
  let tuiport = null;

  while (true) {
    const reportport = ns.getPortHandle(ns.pid);
    let totalthreads = 0;
    let i = 0;
    reportport.clear();

    let target = "n00dles";//base target
    const network = getnetwork(ns, (server) => {
      target = servercheck(ns, server, target, ns.fileExists("Formulas.exe", "home")); //select target from time 
      debug(ns, target);
      placescript(ns, server, tools, true);
      return ns.hasRootAccess(server);
    });//get network
    const ramhost = new RamHost(ns, network);
    const data = new Data(ns, target);
    if (tuiport == null) {
      tuiport = ns.exec("/Proto/Relapse2/TUI.js", "home", { temporary: true })
    }
    let info = { mode: mode, target: target, yoink: data.yoink };
    ns.writePort(tuiport, info)
    while (!isPrepped(ns, target)) {
      ns.clearPort(tuiport)
      mode = 2
      info.mode = mode
      ns.writePort(tuiport, info)
      await prep(ns, data, ramhost)
      data.calculate(ns, ns.fileExists("Formulas.exe", "home"));
    }

    debugger
    await optimizeBatch(ns, data, ramhost);
    data.calculate(ns, ns.fileExists("Formulas.exe", "home"));

    data.end = Date.now() + data.wTime - data.spacer;

    const works = [];
    let batchcount = 0;

    while (batchcount++ < data.depth) {
      for (const job of jobs) {
        data.end += data.spacer;
        const work = new Work(job, data, batchcount);
        if (!ramhost.assign(work)) {
          ns.print(`ERROR: Unable to assign ${job}. Dumping debug info`);
          debug(ns, JSON.stringify(work));
          debug(ns, JSON.stringify(data));
          ramhost.printhost(ns);
          debugger;
          return;
        }
        works.push(work);
      }
    }

    works.reverse();

    for (const work of works) {
      work.end += data.delay;
      const workpid = ns.exec(use[work.job], work.host, { threads: work.threads, temporary: true }, JSON.stringify(work));
      if (!workpid) throw new Error(`Unable to deploy ${work.job}`);
      const tport = ns.getPortHandle(workpid);
      await tport.nextWrite();
      data.delay += tport.read();
      totalthreads += work.threads;
      if (i === 100) {
        await ns.sleep(5)
        i = 0
      }
    }
    mode = 1;
    info.mode = mode;
    ns.clearPort(tuiport)
    ns.writePort(tuiport, info)
    await reportport.nextWrite();
    reportport.clear();
  }
}

class Work {
  constructor(job, data, batch) {
    this.job = job;
    this.end = data.end;
    this.time = data.times[job];
    this.target = data.target;
    this.threads = data.threads[job];
    this.cost = this.threads * wages[job];
    this.host = "none";
    this.report = true;
    this.port = data.port;
    this.batch = batch;
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
    this.yoink = 0.1;
    this.depth = 0;
    this.truegain = (this.maxMoney * this.yoink) * ns.getPlayer().mults.hacking_money

    this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.end = 0
    //this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

    this.port = ns.pid
  }

  /** @param {NS} ns */
  calculate(ns, formula = false, yoink = this.yoink) {
    const server = this.target;
    const servobj = ns.getServer(server);
    const player = ns.getPlayer();
    const maxMoney = this.maxMoney;
    this.money = ns.getServerMoneyAvailable(server);
    this.sec = ns.getServerSecurityLevel(server);
    this.wTime; this.times.hack; this.times.grow;

    if (formula) {
      this.wTime = ns.formulas.hacking.weakenTime(servobj, player);
      this.times.hack = ns.formulas.hacking.hackTime(servobj, player);
      this.times.grow = ns.formulas.hacking.growTime(servobj, player);
    } else {
      this.wTime = ns.getWeakenTime(server);
      this.times.hack = this.wTime / 4;
      this.times.grow = this.wTime * 0.8;
    }

    this.times.weaken1 = this.wTime;
    this.times.weaken2 = this.wTime;
    // this.depth = this.wTime / this.spacer * 4;

    const hPercent = ns.hackAnalyze(server);
    const amount = maxMoney * yoink;
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(server, amount)), 1);
    const tyoink = hPercent * hThreads;
    let gThreads;
    if (formula) {
      servobj.moneyAvailable = maxMoney - amount;
      gThreads = ns.formulas.hacking.growThreads(servobj, player, maxMoney)
    } else {
      gThreads = Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * tyoink)));
    }
    this.threads.weaken1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
    this.threads.weaken2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
    this.threads.hack = hThreads;
    this.threads.grow = gThreads;

    this.chance = ns.hackAnalyzeChance(server)
  }

  /** @param {NS} ns */
  controldesync(ns, hackskill) {
    const player = ns.getPlayer();
    const servobj = ns.getServer(this.target);
    player.skills.hacking = hackskill;
    servobj.moneyAvailable = servobj.moneyMax * (ns.formulas.hacking.hackPercent(servobj, player) * this.threads.hack);
    const gThreads = ns.formulas.hacking.growThreads(servobj, player, servobj.moneyMax);
    this.threads.grow = gThreads
    this.threads.weaken2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
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
      if (x.server === "home" || x.server.startsWith("share-serv")) return 1;
      if (y.server === "home" || y.server.startsWith("share-serv")) return -1;

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

  batchsim(threadCost) {
    const ramhosts = this.simhost();
    let batches = 0;
    let found = true;
    while (found) {
      for (const cost of threadCost) {
        found = false;
        const host = ramhosts.find(ramhost => ramhost.ram >= cost);
        if (host) {
          host.ram -= cost;
          found = true;
        } else break;
      }
      if (found) batches++;
      //if (batches >= maxbatch) break
    }
    return batches
  }
}

/**
 * @param {NS} ns
 * @param {Data} data
 * @param {RamHost} ramhost
 */
export async function optimizeBatch(ns, data, ramhost) {

  const maxThreads = Math.floor(ramhost.maxramsize / 1.75);
  const maxMoney = data.maxMoney;
  const hPercent = ns.hackAnalyze(data.target);
  const wTime = ns.getWeakenTime(data.target);

  const minyoink = 0.001;
  const minstep = 0.01;
  let yoink = 0.99;
  let best = 0

  while (yoink > minyoink) {
    const amount = maxMoney * yoink
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(data.target, amount)), 1);
    const tYoink = hPercent * hThreads
    const growthreads = Math.ceil(ns.growthAnalyze(data.target, maxMoney / (maxMoney - maxMoney * tYoink)));

    if (Math.max(hThreads, growthreads) <= maxThreads) {
      const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
      const wThreads2 = Math.max(Math.ceil(growthreads * 0.004 / 0.05), 1);

      const threadCost = [hThreads * 1.7, wThreads1 * 1.75, growthreads * 1.75, wThreads2 * 1.75];
      debug(ns, threadCost);
      const batchCount = ramhost.batchsim(threadCost);
      const income = tYoink * maxMoney * batchCount / (data.spacer * 4 * batchCount + wTime);
      if (income > best) {
        best = income;
        data.yoink = tYoink;
        data.depth = batchCount;
      }
    }
    debugger;
    await ns.sleep(0)
    yoink -= minstep;
  }
  if (best === 0) {
    ramhost.printhost(ns)
    throw new Error(`Not enough ram to run a single batch, something gone really FUBAR`)
  };
}