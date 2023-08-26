/** @param {NS} ns */
export async function main(ns) {
  const host = ns.getHostname();
  const target = ns.args[0];
  var currentsec = ns.getServerSecurityLevel(target);
  var minsecurity = ns.getServerMinSecurityLevel(target);
  var maxmoney = ns.getServerMaxMoney(target);
  var money = ns.getServerMoneyAvailable(target);

  //Try to find out if the server have enough ram by taking both server max ram and used ram to calculation
  function ramavalible(server) {
    return ns.getServerMaxRam(server)-ns.getServerUsedRam(server) >= needram
  }
  
  async function waituntillramavalible() {
    
  }
  
  while (true) {
    if (currentsec > minsecurity) {
      //Weaken function
      var threads = Math.ceil((currentsec - minsecurity) / ns.weakenAnalyze(1));
      var weakenram = ns.getScriptRam("weaken.js");
      var needram = Math.ceil(weakenram * threads);
      var weakentime = ns.getWeakenTime(target);
      for (const server of ns.scan(host)) {
        if (ramavalible(server)) {
          ns.scp("weaken.js", server, host)
          ns.exec("weaken.js", server, threads, target)
          await ns.sleep(weakentime);
        }
      };
    } else if (money < maxmoney) {
      //Grow function
      var threads = Math.ceil((maxmoney - money) / ns.growthAnalyze(target, 1, 1));
      var growram = ns.getScriptRam("grow.js");
      var needram = Math.ceil(growram * threads);
      var growtime = ns.getGrowTime(target);
      for (const server of ns.scan(host)) {
        if (ramavalible(server)) {
          ns.scp("grow.js", server, host)
          ns.exec("grow.js", server, threads, target)
          await ns.sleep(growtime);
        };
      }
    } else {
      //Hack function
      var threads = ns.hackAnalyzeThreads(target, maxmoney * 0.75);
      var hackram = ns.getScriptRam("hack.js");
      var needram = Math.ceil(hackram * threads);
      var hacktime = ns.getHackTime(target);
      for (const server of ns.scan(host)) {
        if (ramavalible(server)) {
          ns.scp("hack.js", server, host)
          ns.exec("hack.js", server, threads, target)
          await ns.sleep(hacktime);
        };
      }
    }
  }
}
