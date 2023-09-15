/** @param {NS} ns */
export async function main(ns) {
  const arg = ns.args[0]
  const home = "home"
  let port = ns.getPortHandle(ns.getRunningScript("pain.js", home, arg).pid)//Get port from batch script
  let port2 = ns.getPortHandle(1) //Addition port for cycle log
  const maxWidth = 10;
  let indexline = 0;
  const refreshRate = 1000 //How often the loop refresh
  const edge = "============================================="
  const section = "---------------------------------------------"
  const start = Date.now();
  ns.tail();
  ns.disableLog("sleep")
  ns.disableLog("getServerSecurityLevel")
  ns.disableLog("getServerMinSecurityLevel")
  ns.disableLog("getServerMoneyAvailable")
  ns.disableLog("getServerMaxMoney")

  while (true) {
    let time = Date.now() - start;
    const line = "".padStart(indexline, "|").padEnd(maxWidth, " ");
    let serverCurrentSecurity = ns.getServerSecurityLevel(arg)
    let serverMinSecurity = ns.getServerMinSecurityLevel(arg)
    let servermoney = ns.formatNumber(ns.getServerMoneyAvailable(arg), 0, 1000)
    let servermaxmoney = ns.formatNumber(ns.getServerMaxMoney(arg), 0, 1000)
    let money = `${servermoney}`.padStart(9) + "/" + `${servermaxmoney}`.padEnd(9)
    let Security = "(".padStart(9) + serverMinSecurity + ")" + Math.abs(serverCurrentSecurity - serverMinSecurity) + "+".padEnd(9)
    ns.print(edge);
    ns.print("Target: " + arg)
    ns.print("pain.js: " + JSON.parse(port.peek()))
    ns.print(section);
    ns.print("        Money        |       Security")
    ns.print(money + "|".padStart(3) + Security)
    ns.print(section);
    ns.print("Elapsed for: " + ns.tFormat(time), "[" + line + "]")
    ns.print(section);
    ns.print("Cycle:")
    if (!port2.empty) {
      ns.print("[" + port2.peek + "]")
    } else {
      ns.print("[" + "Empty :(" + "]")
    }
    ns.print(edge);
    indexline = ++indexline % (maxWidth + 1);

    await ns.sleep(refreshRate)
    ns.clearLog()
  }
}
