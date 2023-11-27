const batch = [
  { job: "hack", tool: "test/hack.js", ramcost: 1.7, delay: 0 },
  { job: "weaken", tool: "test/weaken.js", ramcost: 1.75, delay: 1 },
  { job: "grow", tool: "test/grow.js", ramcost: 1.75, delay: 2 },
  { job: "weaken2", tool: "test/weaken.js", ramcost: 1.75, delay: 3 }
]
const yoink = 0.99

import { getserver, isPrepped, GrantRoot, issecurityprep } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  let servers = getserver(ns)
  servers.sort((x, y) => ns.getServerMaxMoney(y) - ns.getServerMaxMoney(x)) //Sorting targets by money
  const targets = servers.filter(server => Math.floor(ns.getHackingLevel() * 0.5) > ns.getServerRequiredHackingLevel(server)) //filtering targets to only those that we can hack
  const target = targets[0]
  let weakentime = ns.getWeakenTime(target)
  let growtime = ns.getGrowTime(target)
  let hacktime = ns.getHackTime(target)
  let ramhosts = getserver(ns)
  let ramhost = ramhosts.filter(server => ns.hasRootAccess(server) == true) //Finding servers that we have access
  ramhost.sort((x, y) => ns.getServerMaxRam(y) - ns.getServerMaxRam(x))//wait should I sort it's like this?
  JSON.stringify(ramhost)
  ns.tprint(ramhost)
  if (!ns.hasRootAccess(target)) {
    GrantRoot(ns, target)
  };
  if (!isPrepped(ns, target)) {
    if (issecurityprep(ns, target) == true) {
      const WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1))
      let weaken = batch[1]
      for (let i = 0; i++;) {
        let pid = ns.exec(weaken.tool, ramhost[i], WT, weaken, weakentime)
        let port = ns.getPortHandle(pid)
        await port.nextWrite()
        break
      }
    }
  }
}
