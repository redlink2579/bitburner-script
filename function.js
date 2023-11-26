///this is a spagetthi code, please forgive me me new :<
/** @param {NS} ns */
export function getserver(ns) {
    let serversSeen = ["home"]
    for (let i = 0; i < serversSeen.length; i++) {
      let thisScan = ns.scan(serversSeen[i]);
      for (let j = 0; j < thisScan.length; j++) {
        if (serversSeen.indexOf(thisScan[j]) === -1) {
          serversSeen.push(thisScan[j]);
        }
      }
    }
  return serversSeen;
}
/** @param {NS} ns */
export function isPrepped(ns, target) {
  const tolerance = 0.0001;
	const maxMoney = ns.getServerMaxMoney(target);
	const money = ns.getServerMoneyAvailable(target);
	const minSec = ns.getServerMinSecurityLevel(target);
	const sec = ns.getServerSecurityLevel(target);
	const secFix = Math.abs(sec - minSec) < tolerance;
	return (money === maxMoney && secFix) ? true : false;
}
/** @param {NS} ns */
export function GrantRoot (ns, target) {
  if (ns.fileExists("BruteSSH.exe") == true) {
    ns.brutessh(target)
  };
  if (ns.fileExists("FTPCrack.exe") == true) {
    ns.ftpcrack(target)
  };
  if (ns.fileExists("relaySMTP.exe") == true) {
    ns.relaysmtp(target)
  };
  if (ns.fileExists("HTTPWorm.exe") == true) {
    ns.httpworm(target)
  };
  if (ns.fileExists("SQLInject.exe") == true) {
    ns.sqlinject(target)
  }
  ns.nuke(target)
}

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
      ns.run("batch/weaken.js", threads, target)
      await ns.sleep(weakentime);
      break
    } else if (serveravalibleram(server) >= needram) {
      ns.scp("batch/weaken.js", server, ns.getHostname())
      ns.exec("batch/weaken.js", server, threads, target)
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
      ns.run("batch/grow.js", threads, target)
      await ns.sleep(growtime);
      break
    } else if (serveravalibleram(server) >= needram) {
      ns.scp("batch/grow.js", server, ns.getHostname())
      ns.exec("batch/grow.js", server, threads, target)
      await ns.sleep(growtime);
      break
    } else {
      await ns.sleep(1000)
    }
  }
}

export async function makeitrain(ns, target) {
  const threads = Math.ceil(ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.75));
  const hackram = ns.getScriptRam("hack.js");
  const needram = Math.ceil(hackram * threads);
  const hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer()) + 1000;
  ns.print("Need ram for hack:" + ns.formatRam(needram))
  for (const server of ns.scan(ns.getHostname())) {
    if (hostavaliableram(ns) >= needram) {
      ns.run("batch/hack.js", threads, target)
      await ns.sleep(hacktime);
      break
    } else {
      if (serveravalibleram(server) >= needram) {
        ns.scp("batch/hack.js", server, ns.getHostname())
        ns.exec("batch/hack.js", server, threads, target)
        await ns.sleep(hacktime);
        break
      } else {
        await ns.sleep(1000)
      }
    }
  }
}
