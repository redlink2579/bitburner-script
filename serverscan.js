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
  function filteredserver(servers) {
    for (let i = 0; i < 3; i++) {
    let server = servers[i]
    JSON.stringify(server)
    const predicate = (server) => (player.skills.hacking) > ns.getServerRequiredHackingLevel(server)
    let filteredserver = servers.filter(predicate)
    filteredserver.lenght = 3
    }
  return filteredserver
  }

  for (let i = 0; i < 3; i++) {
    let server = filteredserver[i]
    let serverhacklevel = ns.getServerRequiredHackingLevel(server)
    let servermaxmoney = ns.getServerMoneyAvailable(server)
    let string = "server: " + server + ", Hack lvl: " + serverhacklevel + ", Max Money: " + servermaxmoney
    ns.write("server.txt", string, "a")
  }
  ns.tprint("Recommend server are now in server.txt")
  ns.tprint(servers)
}
