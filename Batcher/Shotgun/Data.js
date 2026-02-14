import { isPrepped } from "Batcher/libs/Utils.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(`This is a data script, you are not supposed to run this`)
}

export class TargetData {
  /** @param {NS} ns */
  constructor(ns, target = "n00dles") {
    const server = ns.getServer(target);
    this.target = target;
    this.money = server.moneyAvailable;
    this.maxMoney = server.moneyMax;
    this.sec = server.hackDifficulty;
    this.minsec = server.minDifficulty;
    this.isPrep = isPrepped(ns, target);
  };
};

export class WorkData {
  /** 
   * @param {NS} ns 
   * @param {TargetData} targetData
  */
  constructor(ns, targetData, take = 0.20) {
    this.target = targetData.target;
    this.delay = 0;
    this.spacer = 5;
    this.take = take;
    this.maxMoney = targetData.maxMoney
    this.gain = (this.maxMoney * this.take) * ns.getPlayer().mults.hacking_money
    this.depth = 0

    this.times = { hack: 0, grow: 0, weaken: 0 };
    this.ends = { hack: 0, grow: 0, weaken: 0 };
    this.threads = { hack: 0, grow: 0, weaken: 0 };

    this.port = ns.pid;
  }
  /** @param {NS} ns */
  calc(ns, formula = false) {
    const target = this.target;
    const targetobj = ns.getServer(target);
    const player = ns.getPlayer();
    const maxMoney = this.maxMoney;
    const amount = maxMoney * this.take
    this.money = targetobj.moneyAvailable;
    this.sec = targetobj.hackDifficulty;
    let hPercent;let hThreads;

    //Times calculation
    if (formula) {
      this.times.hack = ns.formulas.hacking.hackTime(targetobj, player);
      this.times.grow = ns.formulas.hacking.growTime(targetobj, player);
      this.times.weaken = ns.formulas.hacking.weakenTime(targetobj, player);
    } else {
      this.times.weaken = ns.getWeakenTime(server);
      this.times.hack = this.times.weaken / 4;
      this.times.grow = this.times.weaken * 0.8;
    }
    //Threads Calculation
    if (formula) {
      hPercent = ns.formulas.hacking.hackPercent(targetobj, player);
      hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(target, amount)), 1);
      targetobj.moneyAvailable = maxMoney - amount;
      this.threads.grow = Math.ceil(ns.formulas.hacking.growThreads(targetobj, player, maxMoney) * 1.01)
    } else {
      let takeThreads = 0;
      hPercent = ns.hackAnalyze(target);
      this.threads.hack = Math.max(Math.floor(ns.hackAnalyzeThreads(target, amount)), 1);
      takeThreads = hPercent * hThreads;
      this.threads.grow = Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * takeThreads)) * 1.01);
    }
    const secincur = ns.hackAnalyzeSecurity(this.threads.hack, target) + ns.growthAnalyzeSecurity(this.threads.grow, target)
    this.threads.weaken =   Math.max(Math.ceil(secincur / 0.05), 1);
  }
}
