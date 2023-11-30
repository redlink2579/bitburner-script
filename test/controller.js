const yoink = 0.99

import { getserver, isPrepped, GrantRoot, } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tail()

  let servers = getserver(ns)
  servers.sort((x, y) => ns.getServerMaxMoney(y) - ns.getServerMaxMoney(x)) //Sorting targets by money
  const targets = servers.filter(server => Math.floor(ns.getHackingLevel() * 0.5) > ns.getServerRequiredHackingLevel(server)) //filtering targets to only those that we can hack
  const target = targets[0]
  let weakentime = ns.getWeakenTime(target)
  let growtime = Math.ceil(weakentime / 4)
  let hacktime = Math.ceil(weakentime * 0.8)
  let ramhosts = getserver(ns)
  let hack = { job: "hack", tool: "test/hack.js", ramcost: 1.7, delay: 0, hacktime };
  let weak1 = { job: "weaken", tool: "test/weaken.js", ramcost: 1.75, delay: 1, weakentime };
  let grow = { job: "grow", tool: "test/grow.js", ramcost: 1.75, delay: 2, growtime };
  let weak2 = { job: "weaken2", tool: "test/weaken.js", ramcost: 1.75, delay: 3, weakentime };

  let ramhost = ramhosts.filter(server => ns.hasRootAccess(server) == true) //Finding servers that we have access
  function ramsort() {
    ramhost.sort((x, y) => (ns.getServerMaxRam(y) - ns.getServerUsedRam(y)) - (ns.getServerMaxRam(x) - ns.getServerUsedRam(x)))
  }
  ramsort()
  JSON.stringify(ramhost)
  ns.tprint("Avalible server for ramhost are:", ramhost)
  if (!ns.hasRootAccess(target)) {
    GrantRoot(ns, target)
  };
  if (!isPrepped(ns, target)) {
    let WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) + 0.0001) / ns.weakenAnalyze(1));
    let GT = Math.ceil(ns.growthAnalyze(target, ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target), 1));
    ns.print("If this is print then this work")
    for (i = 0; ; i++) {
      ns.exec(weak1.tool, ramhost[i], WT, weak1, target);
      ramsort
      ns.exec(grow.tool, ramhost[i], GT, grow, target)
      ramsort
      const pid1 = ns.exec(weak2.tool, ramhost[i], WT, weak2, target)
      let port = ns.getPortHandle(pid1)
      const timer = setInterval(() => {
        ns.clearLog()
        ns.print("Preparing the server")
        ns.print("|---------------------------------------")
        ns.print("| Running Prep-batch: ", ns.tFormat(weakentime + weak2.delay))
        ns.print("|=======================================")
      }, 1000)

      await port.nextWrite()
      clearInterval(timer)
      break
    }
  }
}
