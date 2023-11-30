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
  const hack = { job: "hack", tool: "test/hack.js", ramcost: 1.7, report: false };
  const weak1 = { job: "weaken", tool: "test/weaken.js", ramcost: 1.75, report: false };
  const grow = { job: "grow", tool: "test/grow.js", ramcost: 1.75, report: false }
  const weak2 = { job: "weaken2", tool: "test/weaken.js", ramcost: 1.75, report: true };
  const spacer = 5
  const dataport = ns.getPortHandle(ns.pid)
  dataport.clear
  let endtime = Date.now() + weakentime;
  let delay = 0
  let portid = 1

  let ramhost = ramhosts.filter(server => ns.hasRootAccess(server) == true) //Finding servers that we have access
  function ramsort() {
    ramhost.sort((x, y) => (ns.getServerMaxRam(y) - ns.getServerUsedRam(y)) - (ns.getServerMaxRam(x) - ns.getServerUsedRam(x)))
  }
  ramsort()
  JSON.stringify(ramhost)
  ns.print("Current target is: ", target)
  ns.tprint("Avalible server for ramhost are:", ramhost)
  if (!ns.hasRootAccess(target)) {
    GrantRoot(ns, target)
  };

  while (true) {
    if (!isPrepped(ns, target)) {
      let WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) + 0.0001) / ns.weakenAnalyze(1));
      ns.print(WT)
      let GT = Math.ceil(ns.growthAnalyze(target, ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target), 1));
      for (let i = 0; ; i++) {
        ns.scp(["test/weaken.js", "test/grow.js"], ramhost[i], "home")
        portid = ns.exec(weak1.tool, ramhost[i], WT, JSON.stringify(weak1), target, weakentime, endtime + delay, ns.pid);
        const portw1 = ns.getPortHandle(portid)
        await portw1.nextWrite()
        delay += portw1.read()
        ramsort()
        portid = ns.exec(grow.tool, ramhost[i], GT, JSON.stringify(grow), target, growtime, endtime + spacer + delay, ns.pid)
        const portg = ns.getPortHandle(portid)
        await portg.nextWrite()
        delay += portg.read()
        ramsort()
        portid = ns.exec(weak2.tool, ramhost[i], WT, JSON.stringify(weak2), target, weakentime, endtime + spacer * 2 + delay, ns.pid)
        const portw2 = ns.getPortHandle(portid)
        await portw2.nextWrite()
        delay += portw2.read()
        ramsort()
        const timer = setInterval(() => {
          ns.clearLog()
          ns.print("Preparing the server")
          ns.print("|---------------------------------------")
          ns.print("| Running Prep-batch: ", ns.tFormat(endtime - Date.now()))
          ns.print("|=======================================")
        }, 1000)

        await dataport.nextWrite()
        clearInterval(timer)
        break
      }
    } else {
      let HT = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * yoink))
      let WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) + 0.0001) / ns.weakenAnalyze(1));
      let GT = Math.ceil(ns.growthAnalyze(target, ns.getServerMaxMoney(target) / Math.round(ns.getServerMoneyAvailable(target) * yoink), 1));
      for (let i = 0; ; i++) {
        ns.scp(["test/weaken.js", "test/grow.js", "test/hack.js"], ramhost[i], "home")
        portid = ns.exec(hack.tool, ramhost[i], HT, JSON.stringify(hack), target, hacktime, endtime - spacer + delay, ns.pid)
        const porth = ns.getPortHandle(portid)
        await porth.nextWrite()
        delay += porth.read()
        ramsort()
        portid = ns.exec(weak1.tool, ramhost[i], WT, JSON.stringify(weak1), target, weakentime, endtime + delay, ns.pid);
        const portw1 = ns.getPortHandle(portid)
        await portw1.nextWrite()
        delay += portw1.read()
        ramsort()
        portid = ns.exec(grow.tool, ramhost[i], GT, JSON.stringify(grow), target, growtime, endtime + spacer + delay, ns.pid)
        const portg = ns.getPortHandle(portid)
        await portg.nextWrite()
        delay += portg.read()
        ramsort()
        portid = ns.exec(weak2.tool, ramhost[i], WT, JSON.stringify(weak2), target, weakentime, endtime + spacer * 2 + delay, ns.pid)
        const portw2 = ns.getPortHandle(portid)
        await portw2.nextWrite()
        delay += portw2.read()
        ramsort()
        const timer = setInterval(() => {
          ns.clearLog()
          ns.print("Preparing the server")
          ns.print("|---------------------------------------")
          ns.print("| Running batch: ", ns.tFormat(endtime - Date.now()))
          ns.print("|=======================================")
        }, 1000)

        await dataport.nextWrite()
        clearInterval(timer)
        break
      }
    }
  }
}
