/** @param {NS} ns */
export async function main(ns) {
  let i = 0
  let j = 0
  const player = ns.getPlayer()
  function getserver() {
    let serversSeen = ["home"]
    for (i = 0; i < serversSeen.length; i++) {
      let thisScan = ns.scan(serversSeen[i]);
      for (j = 0; j < thisScan.length; j++) {
        if (serversSeen.indexOf(thisScan[j]) === -1) {
          serversSeen.push(thisScan[j]);
        }
      }
    }
    return serversSeen;
  }
  let servers = getserver()
  const predicate = (server) => (player.skills.hacking) > ns.getServerRequiredHackingLevel(server)
  let serverarray = []
  let filteredserver = servers.filter(predicate)
  serverarray.push(filteredserver)
  serverarray.lenght = 3

  for (let i = 0 ; i < 3 ; i++) {
    let server = serverarray[i]
    let serverhacklevel = ns.getServerRequiredHackingLevel(server)
    let servermaxmoney = ns.getServerMoneyAvailable(server)
    let string = "server: " + server + ", Hack lvl: " + serverhacklevel + ", Max Money: " + servermaxmoney
    ns.write("server.txt",string,a)
  }
  ns.tprint("Recommend server are now in server.txt")
}
