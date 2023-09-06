import * as lib from "function.js"
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  let serverport = ns.getPortHandle(ns.pid + 5)
  let port = ns.getPortHandle(ns.pid)
  serverport.write(JSON.stringify(target))

  while (true) {
    if (lib.issecurityprep(ns, target)) {
      const threads = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1));
      const weakenram = ns.getScriptRam("batch/weaken.js");
      const needram = Math.ceil(weakenram * threads);
      port.clear()
      port.write(JSON.stringify("Currently weaken security on" + target))
      ns.print("Need ram for weaken:" + ns.formatRam(needram))
      for (const server of ns.scan(ns.getHostname())) {
        if (lib.hostavaliableram(ns) >= needram) {
          let batchpid = ns.run("batch/weaken.js", threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else if (lib.serveravalibleram(server) >= needram) {
          ns.scp("batch/weaken.js", server, ns.getHostname())
          let batchpid = ns.exec("batch/weaken.js", server, threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else {
          await ns.sleep(1000)
        }
      }
    } else if (lib.ismoneyprep(ns, target)) {
      const threads = Math.ceil(ns.growthAnalyze(target, ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target), 1));
      const growram = ns.getScriptRam("batch/grow.js");
      const needram = Math.ceil(growram * threads);
      port.clear()
      port.write(JSON.stringify("Currently grow money on " + target))
      ns.print("Need ram for grow:" + ns.formatRam(needram))
      for (const server of ns.scan(ns.getHostname())) {
        if (lib.hostavaliableram(ns) >= needram) {
          let batchpid = ns.run("batch/grow.js", threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else if (lib.serveravalibleram(server) >= needram) {
          ns.scp("batch/grow.js", server, ns.getHostname())
          let batchpid = ns.exec("batch/grow.js", server, threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else {
          await ns.sleep(1000)
        }
      }
    } else {
      const threads = Math.ceil(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.75));
      const hackram = ns.getScriptRam("batch/hack.js");
      const needram = Math.ceil(hackram * threads);
      ns.print("Need ram for hack:" + ns.formatRam(needram))
      port.clear()
      port.write(JSON.stringify("Currently hacking on " + target))
      for (const server of ns.scan(ns.getHostname())) {
        if (lib.hostavaliableram(ns) >= needram) {
          ns.run("batch/hack.js", threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else if (lib.serveravalibleram(server) >= needram) {
          ns.scp("batch/hack.js", server, ns.getHostname())
          let batchpid = ns.exec("batch/hack.js", server, threads, target)
          let port = ns.getPortHandle(batchpid)
          await port.nextWrite()
          port.read()
          break
        } else {
          await ns.sleep(1000)
        }
      }
    }
  }
}
