/** @param {NS} ns */
export async function main(ns) {
  ns.tprint(`This is a script library that doesn't do anything on it's own`)
}

/*
Mode:
1: to terminal
2: to log
*/
/** @param {NS} ns */
export function debugprint(ns, boolean = true || false, string, mode = 1 || 2) {
  if (boolean) {
    if (mode === 1) {
      return ns.tprint(`[DEBUG]${string}`)
    } else if (mode === 2) {
      return ns.print(`[DEBUG]${string}`)
    } else return ns.print(`Debug can only have mode 1 or 2`)
  } else return null
}

/** @param {NS} ns */
export function placescript(ns, server, script, overwrite = false) {
  for (const item of script) {
    if ((ns.fileExists(item, server) || overwrite) && ns.hasRootAccess) {
      ns.scp(item, server, "home")
    }
  }
}

/** @param {NS} ns */
export function attemptroot(ns, target = "n00dles") {
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
  };
  try {
    return ns.nuke(target)
  } catch (Error) {
    return false
  }
}

/** @param {NS} ns */
export function getnetwork(ns, lambdaCondition = () => true, hostname = "home", servers = [], visited = []) {
  if (visited.includes(hostname)) return;
  visited.push(hostname);
  if (lambdaCondition(hostname)) servers.push(hostname);
  const connectedNodes = ns.scan(hostname);
  if (hostname !== "home") connectedNodes.shift();
  for (const node of connectedNodes) getnetwork(ns, lambdaCondition, node, servers, visited);
  return servers;
}


/** @param {NS} ns */
export function servercheck(ns, server, target = "n00dles", formula = false) {
  if (!ns.hasRootAccess(server) && !attemptroot(ns, server)) return target;
  const you = ns.getPlayer();
  const curserver = ns.getServer(server);
  const preserver = ns.getServer(target);
  let curserverpoint;
  let preserverpoint;
  if (curserver.requiredHackingSkill <= you.skills.hacking / (formula ? 1 : 2)) {
    if (formula) {
      curserver.hackDifficulty = curserver.minDifficulty;
      preserver.hackDifficulty = preserver.minDifficulty;
      preserverpoint = preserver.moneyMax / ns.formulas.hacking.weakenTime(preserver, you) * ns.formulas.hacking.hackChance(preserver, you);
      curserverpoint = curserver.moneyMax / ns.formulas.hacking.weakenTime(curserver, you) * ns.formulas.hacking.hackChance(curserver, you);
    } else {
      preserverpoint = preserver.moneyMax / preserver.minDifficulty
      curserverpoint = curserver.moneyMax / curserver.minDifficulty
    }
    if (curserverpoint > preserverpoint) target = server
  }
  return target;
}

/** @param {NS} ns */
export function isPrepped(ns, server) {
  const tolerance = 0.0001;
  const maxMoney = ns.getServerMaxMoney(server);
  const money = ns.getServerMoneyAvailable(server);
  const minSec = ns.getServerMinSecurityLevel(server);
  const sec = ns.getServerSecurityLevel(server);
  const secFix = Math.abs(sec - minSec) < tolerance; // A fix for floating point innaccuracy.
  return (money === maxMoney && secFix) ? true : false;
}

/** @param {NS} ns */
export async function prep(ns, data, ramhost) {
  const maxMoney = data.maxMoney;
  const minSec = data.minSec;
  let money = data.money;
  let sec = data.sec;
  while (!isPrepped(ns, data.target)) {
    const wTime = ns.getWeakenTime(data.target);
    const gTime = wTime * 0.8;
    const dataPort = ns.getPortHandle(ns.pid);
    dataPort.clear();

    const ramhosts = ramhost.simhost();
    const maxThreads = Math.floor(ramhost.maxramsize / 1.75);
    const totalThreads = ramhost.prepThreads;
    let wThreads1 = 0;
    let wThreads2 = 0;
    let gThreads = 0;
    let batchcount = 1;
    let script, mode;
    /*
    Mode:
    1: Target Security
    2: Target Money
    3: Two birds
    */
    if (money < maxMoney) {
      gThreads = Math.ceil(ns.growthAnalyze(data.target, maxMoney / money));
      wThreads2 = Math.ceil(ns.growthAnalyzeSecurity(gThreads) / 0.05);
    }
    if (sec > minSec) {
      wThreads1 = Math.ceil((sec - minSec) * 20)
      if (!(wThreads1 + wThreads2 + gThreads <= totalThreads && gThreads <= maxThreads)) {
        gThreads = 0;
        wThreads2 = 0;
        batchcount = Math.ceil(wThreads1 / totalThreads);
        if (batchcount > 1) wThreads1 = totalThreads;
        mode = 1;
      } else mode = 3;
    } else if (gThreads > maxThreads || gThreads + wThreads2 > totalThreads) {
      mode = 2;
      const oldG = gThreads
      wThreads2 = Math.max(Math.floor(totalThreads / 13.5), 1);
      gThreads = Math.floor(wThreads2 * 12.5);
      batchcount = Math.ceil(oldG / gThreads);
    } else mode = 3;

    const wEnd1 = Date.now() + wTime + 1000;
    const gEnd = wEnd1 + data.spacer;
    const wEnd2 = gEnd + data.spacer;

    const work = {
      batch: "prep",
      target: data.target,
      job: "none",
      time: 0,
      end: 0,
      port: ns.pid,
      log: data.log,
      report: false
    }

    for (const host of ramhosts) {
      while (host.ram >= 1.75) {
        const hMax = Math.floor(host.ram / 1.75)
        let threads = 0
        if (wThreads1 > 0) {
          script = "Proto/Relapse2/weaken.js";
          work.job = "pWeaken1";
          work.time = wTime;
          work.end = wEnd1;
          threads = Math.min(wThreads1, hMax);
          if (wThreads2 === 0 && wThreads1 - threads <= 0) work.report = true
          wThreads1 -= threads;
        } else if (wThreads2 > 0) {
          script = "Proto/Relapse2/weaken.js";
          work.job = "pWeaken2";
          work.time = wTime;
          work.end = wEnd2;
          threads = Math.min(wThreads2, hMax);
          if (wThreads2 - threads === 0) work.report = true;
          wThreads2 -= threads
        } else if (gThreads > 0 && mode === 2) {
          script = "Proto/Relapse2/grow.js"
          work.job = "pGrow";
          work.time = gTime;
          work.end = gEnd;
          threads = Math.min(gThreads, hMax);
          work.report = false;
          gThreads -= threads;
        } else if (gThreads > 0 && hMax >= gThreads) {
          script = "Proto/Relapse2/grow.js"
          work.job = "pGrow";
          work.time = gTime;
          work.end = gEnd;
          threads = gThreads;
          work.report = false;
          gThreads = 0;
        } else break;
        data.server = host.server;
        const pid = ns.exec(script, host.server, { threads: threads, temporary: true }, JSON.stringify(work))
        if (!pid) throw new Error(`Unable to assign all job`)
        host.ram -= 1.75 * threads
      }
    }
    // Wait for the last weaken to finish.
    do await dataPort.nextWrite(); while (!dataPort.read() === String.prototype.startsWith("pWeaken"));
    await ns.sleep(100);
  }
  return true
}