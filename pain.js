/** @param {NS} ns */
export async function main(ns) {
  const host = ns.getHostname();
  const target = ns.args[0];
  const maxmoney = ns.getServerMaxMoney(target);
  const minsecurity = ns.getServerMinSecurityLevel(target);
  let money = ns.getServerMoneyAvailable(target);
  let currentsec = ns.getServerSecurityLevel(target);

  while (true) {
    if (currentsec > minsecurity) {
      const threads = Math.ceil((currentsec - minsecurity) / ns.weakenAnalyze(1));
      const weakenram = ns.getScriptRam("weaken.js");
      const needram = Math.ceil(weakenram * threads);
      const weakentime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer()) + 10;
      ns.print("Need ram for weaken:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= needram) {
          ns.scp("weaken.js", server, host)
          ns.exec("weaken.js", server, threads, target)
          await ns.sleep(weakentime);
          let nowcurrentsec = ns.getServerSecurityLevel(target);
          nowcurrentsec = currentsec
        } else {
          await ns.sleep(1000)
        }
      };
    } else if (money < maxmoney) {
      const threads = Math.ceil( ns.growthAnalyze(target,maxmoney / money, 1));
      const growram = ns.getScriptRam("grow.js");
      var needram = Math.ceil(growram * threads);
      var growtime = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer()) + 10;
      ns.print("Need ram for grow:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= needram) {
          ns.scp("grow.js", server, host)
          ns.exec("grow.js", server, threads, target)
          await ns.sleep(growtime);
          let nowmoney = ns.getServerMoneyAvailable(target);
          nowmoney = money
        } else {
          await ns.sleep(1000)
        }
      }
    } else {
      const threads = Math.celi(ns.hackAnalyzeThreads(target,maxmoney*0.75));
      const hackram = ns.getScriptRam("hack.js");
      const needram = Math.ceil(hackram * threads);
      const hacktime = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer()) + 10;
      ns.print("Need ram for hack:" + ns.formatRam(needram))
      for (const server of ns.scan(host)) {
        if (ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= needram) {
          ns.scp("hack.js", server, host)
          ns.exec("hack.js", server, threads, target)
          await ns.sleep(hacktime);
          let nowmoney = ns.getServerMoneyAvailable(target);
          nowmoney = money
        } else {
          await ns.sleep(1000)
        }
      }
    }
  }
}