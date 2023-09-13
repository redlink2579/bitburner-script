/** @param {NS} ns */
export async function main(ns) {
  const player = ns.getPlayer()
  function getserver() {
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
  let servers = getserver()
  let filteredserver = servers.filter(server => ns.getHackingLevel() > ns.getServerRequiredHackingLevel(server))
  filteredserver.lenght = 3

  ns.clear("server.txt")
  for (let i = 0; i < 3; i++) {
    let server = filteredserver[i]
    let serverhacklevel = ns.formatNumber(ns.getServerRequiredHackingLevel(server),3,1000)
    let servermaxmoney = ns.formatNumber(ns.getServerMoneyAvailable(server),3,1000)
    let string = "\nserver: " + server +  "\nHack lvl: " + serverhacklevel + "\nMax Money: " + servermaxmoney
    ns.write("server.txt", string, "a")
  }
  ns.tprint("Recommend server are now in server.txt")
}
