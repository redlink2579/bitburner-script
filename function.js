/** @param {NS} ns */
export function all(ns) {
  const home = "home"
  const host = ns.getHostname()
  const target = ns.args[0];
  const maxmoney = ns.getServerMaxMoney(target);
  const minsecurity = ns.getServerMinSecurityLevel(target);
  let currentsec = ns.getServerSecurityLevel(target);
  let money = ns.getServerMoneyAvailable(target);

  function issecurityprep(target) {
    return currentsec > minsecurity
  }

  function ismoneyprep(target) {
    return money < maxmoney
  }

  function avaliableram(host) {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
  }

  function serveravalibleram(server) {
    return ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
  }

  async function weakensecurity(target) {
    const threads = Math.ceil((currentsec - minsecurity) / ns.weakenAnalyze(1));
    const weakenram = ns.getScriptRam("weaken.js");
    const needram = Math.ceil(weakenram * threads);
    const weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer()) + 1000;
    ns.print("Need ram for weaken:" + ns.formatRam(needram))
    for (const server of ns.scan(host)) {
      if (avaliableram(host) >= needram) {
        ns.run("weaken.js", threads, target)
        await ns.sleep(weakentime);
        break
      } else if (serveravalibleram(server) >= needram) {
        ns.scp("weaken.js", server, home)
        ns.exec("weaken.js", server, threads, target)
        await ns.sleep(weakentime);
        break
      } else {
        await ns.sleep(1000)
      }
    }
  }

  async function growmoney(target) {
    const threads = Math.ceil(ns.growthAnalyze(target, maxmoney / money, 1));
    const growram = ns.getScriptRam("grow.js");
    var needram = Math.ceil(growram * threads);
    var growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer()) + 1000;
    ns.print("Need ram for grow:" + ns.formatRam(needram))
    for (const server of ns.scan(host)) {
      if (avaliableram(host) >= needram) {
        ns.run("grow.js", threads, target)
        await ns.sleep(growtime);
        break
      } else if (serveravalibleram(server) >= needram) {
        ns.scp("grow.js", server, home)
        ns.exec("grow.js", server, threads, target)
        await ns.sleep(growtime);
        break
      } else {
        await ns.sleep(1000)
      }
    }
  }

  async function makeitrain(target) {
    const threads = Math.ceil(ns.hackAnalyzeThreads(target, maxmoney * 0.75));
    const hackram = ns.getScriptRam("hack.js");
    const needram = Math.ceil(hackram * threads);
    const hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer()) + 1000;
    ns.print("Need ram for hack:" + ns.formatRam(needram))
    for (const server of ns.scan(host)) {
      if (avaliableram(host) >= needram) {
        ns.run("hack.js", threads, target)
        await ns.sleep(hacktime);
        break
      } else {
        if (serveravalibleram(server) >= needram) {
          ns.scp("hack.js", server, host)
          ns.exec("hack.js", server, threads, target)
          await ns.sleep(hacktime);
          break
        } else {
          await ns.sleep(1000)
        }
      }
    }
  }
}
