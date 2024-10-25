//Welcome to my mostly undocumented proto-batcher
//By @Greytider(redlink2579)
import { getserver, isPrepped, GrantRoot, } from "lib/function.js"
/** @param {NS} ns */
export async function main(ns) {
  const yoink = ns.args[0] // Default: 0.80
  const overseerport = ns.getPortHandle(ns.args[1])
  const controldelay = ns.args[3]
  let target = ns.args[4]
  const debugmode = true // for debugging
  const debugopt = 2 // 1 = to log, 2 = to terminal
  let workerpid = []

  function debug(string) {
    if (debugmode == true) {
      if (debugopt == 1) {
        return ns.print(`[DEBUG]${string}`)
      } else {
        return ns.tprint(`[DEBUG]${string}`)
      }
    } else {
      return null
    }
  }

  function execfailhandler(port) {
    if (port != 0) {
      workerpid.push(port)
    } else {
      for (let i = 0; i <= workerpid.length; i++) {
        ns.kill(workerpid[i])
      }
      throw new Error(`Not enough ram to run a single batch, Require more money for server (check your buyone.js error)`)
    }
  }

  let maxmoney = ns.getServerMaxMoney(target)
  let curmoney = ns.getServerMoneyAvailable(target)
  let weakentime = ns.getWeakenTime(target)
  let growtime = Math.ceil(weakentime * 0.8)
  let hacktime = Math.ceil(weakentime / 4)
  let weakenpower = ns.weakenAnalyze(1)
  let hackamount = maxmoney * yoink
  function recalctime() {
    weakentime = ns.getWeakenTime(target)
    growtime = Math.ceil(weakentime * 0.8)
    hacktime = Math.ceil(weakentime / 4)
  } //Calculating time for each job, Function is for when we finish batch so delay is more precise
  let ramhosts = getserver(ns) //Same as above except this time is for finding suitable ram server
  const hack = { job: "hack", tool: "test/hack.js", ramcost: 1.7, report: false };
  const weak1 = { job: "weaken", tool: "test/weaken.js", ramcost: 1.75, report: false };
  const grow = { job: "grow", tool: "test/grow.js", ramcost: 1.75, report: false }
  const weak2 = { job: "weaken2", tool: "test/weaken.js", ramcost: 1.75, report: true };
  const spacer = 20 //Spacer for each job
  const dataport = ns.getPortHandle(ns.pid) //Netport for timing purpose
  dataport.clear //Makesure nothing is in port

  let monitorpid = ns.exec("script-moniter.js", "home", 1, target)
  const monitorport = ns.getPortHandle(monitorpid)
  let endtime = Date.now() + weakentime + controldelay; //Delay calculation
  let delay = 0 + controldelay //Accumilating delay for when job is desync

  if (ns.fileExists("Formulas.exe")) {
    weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer())
    hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer())
    growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer())
  } //If formulas exist then we going to use it for even more precise timing

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

  //Ramcheck(Nessecary)
  async function ramcheck(ram) {
    ramsort()
    if ((ns.getServerMaxRam(ramhost[0]) - ns.getServerUsedRam(ramhost[0])) <= ram) {
      debug(`Ramcheck failed buying server`)
      let serverport = ns.exec("buyone.js", "home", 1, ram)
      await ns.getPortHandle(serverport).nextWrite()
      return ns.asleep(5)
    } else {
      return debug("Ramcheck Pass")
    }
  }

  while (true) {
    if (!isPrepped(ns, target)) {
      if (ns.getServerMoneyAvailable(target) != ns.getServerMaxMoney(target)) {
        ns.scp(["test/weaken.js", "test/grow.js"], ramhost[0], "home")
        endtime = Date.now() + weakentime;
        delay = 0
        let GT = Math.ceil(ns.growthAnalyze(target, maxmoney / curmoney, 1));
        let GTRam = Math.ceil(GT * grow.ramcost)
        let WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) + 0.0001) / weakenpower);
        let WTRam = Math.ceil(WT * weak1.ramcost)
        let WGT = Math.ceil(GT * 0.004 / weakenpower);
        let WGTRam = Math.ceil(WGT * weak1.ramcost)
        let reqram = GTRam + WTRam + WGTRam
        debug(`Require Ram to run this batch:${ns.formatRam(reqram)}`)
        ns.print(WT) //Just for debugging
        if (!ns.fileExists(weak1.tool, ramhost[0])) {
          ns.scp("test/weaken.js", ramhost[0], "home")
        }
        await ramcheck(reqram)
        ramsort()
        const portidw1 = ns.exec(weak1.tool, ramhost[0], WT, JSON.stringify(weak1), target, weakentime, endtime + delay, ns.pid);
        execfailhandler(portidw1)
        workerpid.push(portidw1)
        const portw1 = ns.getPortHandle(portidw1)
        await portw1.nextWrite()
        delay += portw1.read()
        ramsort()
        if (!ns.fileExists(grow.tool, ramhost[0])) {
          ns.scp(grow.tool, ramhost[0], "home")
        }
        ramsort()
        const portidg = ns.exec(grow.tool, ramhost[0], GT, JSON.stringify(grow), target, growtime, endtime + spacer + delay, ns.pid)
        execfailhandler(portidg)
        workerpid.push(portidg)
        const portg = ns.getPortHandle(portidg)
        await portg.nextWrite()
        delay += portg.read()
        ramsort()
        if (!ns.fileExists(weak2.tool, ramhost[0])) {
          ns.scp(weak2.tool, ramhost[0], "home")
        }
        ramsort()
        const portidw2 = ns.exec(weak2.tool, ramhost[0], WGT, JSON.stringify(weak2), target, weakentime, endtime + spacer * 2 + delay, ns.pid)
        execfailhandler(portidw2)
        workerpid.push(portidw2)
        const portw2 = ns.getPortHandle(portidw2)
        await portw2.nextWrite()
        delay += portw2.read()
        ramsort()

        monitorport.clear()
        monitorport.write("Preparing server")
        overseerport.write("Prep")
        await dataport.nextWrite()
        workerpid = []
        overseerport.write("Done")
        if (ns.fileExists("Formulas.exe")) {
          weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer())
          hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer())
          growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer())
        } else {
          recalctime()
        }
      } else {
        if (!ns.fileExists(weak2.tool, ramhost[0])) {
          ns.scp(weak2.tool, ramhost[0], "home")
        }
        endtime = Date.now() + weakentime;
        delay = 0
        let WT = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target) + 0.0001) / weakenpower);
        let WTRam = Math.ceil(WT * weak1.ramcost)
        ns.print(WT)
        await ramcheck(WTRam)
        ramsort()
        const portidw2 = ns.exec(weak2.tool, ramhost[0], WT, JSON.stringify(weak2), target, weakentime, endtime + spacer * 2 + delay, ns.pid)
        execfailhandler(portidw2)
        workerpid.push(portidw2)
        const portw2 = ns.getPortHandle(portidw2)
        await portw2.nextWrite()
        delay += portw2.read()
        ramsort()

        monitorport.clear
        monitorport.write("Weakening server")
        overseerport.write("Prep")
        await dataport.nextWrite()
        workerpid = []
        overseerport.write("Done")
        if (ns.fileExists("Formulas.exe")) {
          weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer())
          hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer())
          growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer())
        } else {
          recalctime()
        }
      }
    } else {
      endtime = Date.now() + weakentime;
      let HT = Math.floor(ns.hackAnalyzeThreads(target, hackamount));
      let HTRam = Math.ceil(HT * hack.ramcost)
      let GT = Math.ceil(ns.growthAnalyze(target, maxmoney / (maxmoney - maxmoney * yoink)), 1);
      let GTRam = Math.ceil(GT * grow.ramcost)
      let WHT = Math.ceil(HT * 0.002 / weakenpower);
      let WHTRam = Math.ceil(WHT * weak1.ramcost)
      let WGT = Math.ceil(GT * 0.004 / weakenpower);
      let WGTRam = Math.ceil(WGT * weak1.ramcost)
      let reqram = HTRam + GTRam + WHTRam + WGTRam
      debug(`Hack threads: ${HT} threads. Ram: ${ns.formatRam(HTRam)}`)
      debug(`Grow threads: ${GT} threads. Ram: ${ns.formatRam(GTRam)}`)
      debug(`Weaken hack threads: ${WHT} threads. Ram: ${ns.formatRam(WHTRam)}`)
      debug(`Weaken Grow threads: ${WGT} threads. Ram: ${ns.formatRam(WGTRam)}`)
      delay = 0
      ns.scp(["test/weaken.js", "test/grow.js", "test/hack.js"], ramhost[0], "home")
      if (!ns.fileExists(hack.tool, ramhost[0])) {
        ns.scp(hack.tool, ramhost[0], "home")
      }
      await ramcheck(reqram)
      overseerport.write(reqram)
      ramsort()
      const portidh = ns.exec(hack.tool, ramhost[0], HT, JSON.stringify(hack), target, hacktime, endtime - spacer + delay, ns.pid)
      execfailhandler(portidh)
      workerpid.push(portidh)
      const porth = ns.getPortHandle(portidh)
      await porth.nextWrite()
      delay += porth.read()
      ramsort()
      if (!ns.fileExists(weak1.tool, ramhost[0])) {
        ns.scp(weak1.tool, ramhost[0], "home")
      }
      ramsort()
      const portidw1 = ns.exec(weak1.tool, ramhost[0], WHT, JSON.stringify(weak1), target, weakentime, endtime + delay, ns.pid);
      execfailhandler(portidw1)
      workerpid.push(portidw1)
      const portw1 = ns.getPortHandle(portidw1)
      await portw1.nextWrite()
      delay += portw1.read()
      ramsort()
      if (!ns.fileExists(grow.tool, ramhost[0])) {
        ns.scp(grow.tool, ramhost[0], "home")
      }
      ramsort()
      const portidg = ns.exec(grow.tool, ramhost[0], GT, JSON.stringify(grow), target, growtime, endtime + spacer + delay, ns.pid)
      execfailhandler(portidg)
      workerpid.push(portidg)
      const portg = ns.getPortHandle(portidg)
      await portg.nextWrite()
      delay += portg.read()
      ramsort()
      if (!ns.fileExists(weak2.tool, ramhost[0])) {
        ns.scp(weak2.tool, ramhost[0], "home")
      }
      ramsort()
      const portidw2 = ns.exec(weak2.tool, ramhost[0], WGT, JSON.stringify(weak2), target, weakentime, endtime + spacer * 2 + delay, ns.pid)
      execfailhandler(portidw2)
      workerpid.push(portidw2)
      const portw2 = ns.getPortHandle(portidw2)
      await portw2.nextWrite()
      delay += portw2.read()
      ramsort()

      monitorport.clear
      monitorport.write("Running batch")
      overseerport.write("Deployed")
      await dataport.nextWrite()
      workerpid = []
      overseerport.write("Done")
      ns.print(`Server money:${ns.getServerMoneyAvailable(target)}`)
      if (ns.fileExists("Formulas.exe")) {
        weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer())
        hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer())
        growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer())
      } else {
        recalctime()
      }
    }
  }
  await ns.asleep(controldelay)
}
