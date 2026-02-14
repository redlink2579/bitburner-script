import {WorkData} from "Batcher/Shotgun/Data.js"
import {RamHost} from "Batcher/Shotgun/Ramhost.js"
/** @param {NS} ns 
 * @param {WorkData} workData
 * @param {RamHost} ramHost
*/
export async function optimizeBatch(ns, workData, ramHost) {

  const maxThreads = Math.floor(ramHost.maxramsize / 1.75);
  const maxMoney = workData.maxMoney;
  const hPercent = ns.hackAnalyze(workData.target);
  const wTime = workData.times.weaken

  const minyoink = 0.001;
  const minstep = 0.001;
  let yoink = 0.99;
  let good = 0;
  while (yoink > minyoink) {
    const amount = maxMoney * yoink
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(workData.target, amount)), 1);
    const tYoink = hThreads * hPercent
    const growthreads = Math.ceil(ns.growthAnalyze(workData.target, maxMoney / (maxMoney - maxMoney * tYoink)));
    const secincur = ns.hackAnalyzeSecurity(hThreads, workData.target) + ns.growthAnalyzeSecurity(growthreads, workData.target)

    if (Math.max(hThreads, growthreads) <= maxThreads) {
      const wThreads = Math.max(Math.ceil(secincur / 0.05), 1);

      const threadCost = [hThreads * 1.7, growthreads * 1.75, wThreads * 1.75];
      const batchcount = ramHost.testCost(threadCost);
      const gain = tYoink * maxMoney * batchcount / (workData.spacer * 4 * batchcount + wTime);
      if (gain > good) {
        good = gain
        workData.take = tYoink;
        workData.depth = batchcount;
      }
    }
    await ns.sleep(0);
    yoink -= minstep;
  }
  if(good === 0) throw new Error(`Not enough ram to run a single batch, something gone really FUBAR`)
}
