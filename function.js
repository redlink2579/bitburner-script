///this is a spagetthi code, please forgive me me new :<
/** @param {NS} ns */
export function issecurityprep(ns, target) {
  return ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)
}

export function ismoneyprep(ns, target) {
  return ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)
}

export function hostavaliableram(ns) {
  return ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
}

export function serveravalibleram(ns, server) {
  return ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
}

export async function weakensecurity(ns, target) {
  const threads = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1));
  const weakenram = ns.getScriptRam("weaken.js");
  const needram = Math.ceil(weakenram * threads);
  const weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer()) + 1000;
  ns.print("Need ram for weaken:" + ns.formatRam(needram))
  for (const server of ns.scan(ns.getHostname())) {
    if (hostavaliableram(ns) >= needram) {
      ns.run("weaken.js", threads, target)
      await ns.sleep(weakentime);
      break
    } else if (serveravalibleram(server) >= needram) {
      ns.scp("weaken.js", server, ns.getHostname())
      ns.exec("weaken.js", server, threads, target)
      await ns.sleep(weakentime);
      break
    } else {
      await ns.sleep(1000)
    }
  }
}

export async function growmoney(ns, target) {
  const threads = Math.ceil(ns.growthAnalyze(target, ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target), 1));
  const growram = ns.getScriptRam("grow.js");
  var needram = Math.ceil(growram * threads);
  var growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer()) + 1000;
  ns.print("Need ram for grow:" + ns.formatRam(needram))
  for (const server of ns.scan(ns.getHostname())) {
    if (hostavaliableram(ns) >= needram) {
      ns.run("grow.js", threads, target)
      await ns.sleep(growtime);
      break
    } else if (serveravalibleram(server) >= needram) {
      ns.scp("grow.js", server, ns.getHostname())
      ns.exec("grow.js", server, threads, target)
      await ns.sleep(growtime);
      break
    } else {
      await ns.sleep(1000)
    }
  }
}

export async function makeitrain(ns, target) {
  const threads = Math.ceil(ns.hackAnalyzeThreads(target, maxmoney * 0.75));
  const hackram = ns.getScriptRam("hack.js");
  const needram = Math.ceil(hackram * threads);
  const hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer()) + 1000;
  ns.print("Need ram for hack:" + ns.formatRam(needram))
  for (const server of ns.scan(ns.getHostname())) {
    if (hostavaliableram(ns) >= needram) {
      ns.run("hack.js", threads, target)
      await ns.sleep(hacktime);
      break
    } else {
      if (serveravalibleram(server) >= needram) {
        ns.scp("hack.js", server, ns.getHostname())
        ns.exec("hack.js", server, threads, target)
        await ns.sleep(hacktime);
        break
      } else {
        await ns.sleep(1000)
      }
    }
  }
}
