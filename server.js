/** @param {NS} ns */
export async function main(ns) {
  var ram = 32
  const hostname = "hackserv-"
  let homemoney = ns.getServerMoneyAvailable("home");
  const serverlimit = ns.getPurchasedServerLimit();
  const payload = ["hack.js", "grow.js", "weaken.js", "payload-launch.js"];
  const maxram = ns.getPurchasedServerMaxRam();

  async function autoupgradeserverram() {
    var i = 0
    while (i < serverlimit) {
      var server = hostname + i;
      if (ns.serverExists(server)) {
        if (homemoney >= ns.getPurchasedServerUpgradeCost(ram)) {
          ns.print("Upgrading ram on " + server + " to " + ns.formatRam(ram, 2));
          ns.killall(server)
          await upgradeserverram(server)
          ++i;
        } else {
          ns.print("Unable to upgrade " + server + " require: " + ns.formatNumber(ns.getPurchasedServerUpgradeCost(ram), 3, 1e4) + "$ \n"
            + "Have: " + ns.formatNumber(homemoney, 3, 1e4) + "$");
        }
      } else if (canPurchasedserver()) {
        ns.print("Purchasing " + server + " with " + ns.formatRam(ram, 2));
        ns.purchaseServer(server, ram);
        await copypayload(payload, server);
        ++i;
      } else {
        ns.print("Unable to purchase " + server + " require: " + ns.formatNumber(ns.getPurchasedServerCost(ram), 3, 1e4) + "$ \n"
          + "Have: " + ns.formatNumber(homemoney, 3, 1e4) + "$");
        await ns.sleep(5)
        ns.kill("server/server.js", "home");
      }
    }
  }

  async function upgradeserverram(server) {
    var curram = ns.getServerMaxRam(server);
    if (curram < ram) {
      ns.upgradePurchasedServer(server, ram);
      await ns.sleep(10000);
      ++i;
    }
  }

  function canPurchasedserver() {
    return homemoney > ns.getPurchasedServerCost(ram)
  };

  async function copypayload(payload, server) {
    ns.scp(payload, server, "home")
  };

  while (true) {
    await autoupgradeserverram();
    if (ram == maxram) {
      break;
    }

    var newram = ram * 2;
    if (newram > maxram) {
      ram = maxram
    } else {
      ram = newram
    }
  }
}
