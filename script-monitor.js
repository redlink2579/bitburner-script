/** @param {NS} ns */
export async function main(ns) {
  let port = ns.getPortHandle(ns.getRunningScript("pain.js").pid)
  let serverport = ns.getPortHandle(ns.getRunningScript("pain.js").pid + 5)
  const lines = ["|        ","||       ","|||      ","||||     ","|||||    ","||||||   ","|||||||  ","|||||||| ","|||||||||"]
  let indexline = 0
  const refreshRate = 1000
  let time = 0
  const server = JSON.parse(serverport.read())
  ns.tail();
  ns.disableLog("sleep")
  
  while (true) {
    let serverCurrentSecurity = ns.getServerSecurityLevel(server)
    const serverMinSecurity = ns.getServerMinSecurityLevel(server);
    let servermoney = ns.formatNumber(ns.getServerMoneyAvailable(server),3,1000)
    let servermaxmoney = ns.formatNumber(ns.getServerMaxMoney(server),3,1000)
    let line = lines[indexline]
    ns.print("=============================================");
    ns.print(JSON.parse(port.peek()))
    ns.print("---------------------------------------------");
    ns.print("Target: " + server)
    ns.print("Target's money: " + servermoney + "$/" + servermaxmoney)
    ns.print("Target's security: +" + (serverCurrentSecurity - serverMinSecurity).toFixed(2) + "(" + serverMinSecurity + ")")
    ns.print("---------------------------------------------");
    ns.print("Elapsed for: " + ns.tFormat(time), "[" + line + "]")
    ns.print("=============================================");
    
    await ns.sleep(refreshRate)
    ns.clearLog()

    indexline = indexline >= lines.length - 1 ? 0 : indexline + 1;

    time = time + 1000
  }
}
