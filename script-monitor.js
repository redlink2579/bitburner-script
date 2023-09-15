/** @param {NS} ns */
export async function main(ns) {
  const arg = ns.args[0]
  const home = "home"
  let port = ns.getPortHandle(ns.getRunningScript("pain.js", home, arg).pid)//Get port from batch script
  let port2 = ns.getPortHandle(1) //Addition port for cycle log
  const lines = ["|        ", "||       ", "|||      ", "||||     ", "|||||    ", "||||||   ", "|||||||  ", "|||||||| ", "|||||||||"]
  let indexline = 0 //Cool line beside time
  const refreshRate = 1000 //How often the loop refresh
  let time = 0 //Time for how long monitor have been running
  const edge = "============================================="
  const section = "---------------------------------------------"
  ns.tail();
  ns.disableLog("sleep")
  ns.disableLog("getServerSecurityLevel")
  ns.disableLog("getServerMinSecurityLevel")
  ns.disableLog("getServerMoneyAvailable")
  ns.disableLog("getServerMaxMoney")

  while (true) {
    let serverCurrentSecurity = ns.getServerSecurityLevel(arg)
    let serverMinSecurity = ns.getServerMinSecurityLevel(arg)
    let servermoney = ns.formatNumber(ns.getServerMoneyAvailable(arg), 2, 1000)
    let servermaxmoney = ns.formatNumber(ns.getServerMaxMoney(arg), 2, 1000)
    let money = servermoney + "$/" + servermaxmoney + "$"
    let Security = "(" + serverMinSecurity + ")" + "+" + Math(serverCurrentSecurity - serverMinSecurity)
    let line = lines[indexline]
    ns.print(edge);
    ns.print("Target: " + arg)
    ns.print("pain.js: " + JSON.parse(port.peek()))
    ns.print(section);
    ns.print("        Money        |       Security")
    ns.print(targetmoney + "$" + spacer.padStart(3) + serverMinSecurity)
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

    await ns.sleep(refreshRate)
    ns.clearLog()

    indexline = indexline >= lines.length - 1 ? 0 : indexline + 1;

    time = time + 1000
  }
}
