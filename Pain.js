/** @param {NS} ns */
export async function main(ns) {
  const host = ns.getHostname();
  const target = ns.args[0];
  var currentsec = ns.getServerSecurityLevel(target);
  var minsecurity = ns.getServerMinSecurityLevel(target);
  var maxmoney = ns.getServerMaxMoney(target);
  var money = ns.getServerMoneyAvailable(target);

  while (true) {
    if (currentsec > minsecurity) {
      var threads = Math.ceil((currentsec - minsecurity) / ns.weakenAnalyze(1));
      var weakenram = ns.getScriptRam("weaken.js");
      var needram = Math.ceil(weakenram * threads);
      var weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
      ns.print("Need ram for weaken:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server)-ns.getServerUsedRam(server) >= needram) {
          ns.scp("weaken.js", server, host)
          ns.exec("weaken.js", server, threads, target)
          await ns.sleep(weakentime);
        } else {
          await ns.sleep(1000)
        }
      };
    } else if (money < maxmoney) {
      var threads = Math.ceil((maxmoney - money) / ns.growthAnalyze(target, 2, 1));
      var growram = ns.getScriptRam("grow.js");
      var needram = Math.ceil(growram * threads);
      var growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
      ns.print("Need ram for grow:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server)-ns.getServerUsedRam(server) >= needram) {
          ns.scp("grow.js", server, host)
          ns.exec("grow.js", server, threads, target)
          await ns.sleep(growtime);
        } else {
          await ns.sleep(1000)
        }
      }
    } else {
      var threads = ns.hackAnalyzeThreads(target, maxmoney * 0.75);
      var hackram = ns.getScriptRam("hack.js");
      var needram = Math.ceil(hackram * threads);
      var hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
      ns.print("Need ram for hack:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server)-ns.getServerUsedRam(server) >= needram) {
          ns.scp("hack.js", server, host)
          ns.exec("hack.js", server, threads, target)
          await ns.sleep(hacktime);
        } else {
          await ns.sleep(1000)
        }
      }
    }
  }
}
