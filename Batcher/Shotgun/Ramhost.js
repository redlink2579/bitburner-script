/** @param {NS} ns */
export class RamHost {
  #ramhosts = []
  #minramsize = Infinity;
  #maxramsize = 0;
  #totalram = 0;
  #maxram = 0;
  #prepThreats = 0;
  #index = new Map()

  /** @param {NS} ns */
  constructor(ns, servers) {
    for (const server of servers) {
      if (ns.hasRootAccess(server)) {
        const maxRam = ns.getServerMaxRam(server);
        const ram = maxRam - ns.getServerUsedRam(server);
        if (ram >= 1.70) {
          const ramhosts = { server: server, ram: ram }
          this.#ramhosts.push(ramhosts);
          if (ram < this.#minramsize) this.#minramsize = ram;
          if (ram > this.#maxramsize) this.#maxramsize = ram;
          this.#totalram += ram;
          this.#maxram += maxRam;
          this.#prepThreats += Math.floor(ram / 1.75);
        }
      }
    }
    this.#sort();

    this.#ramhosts.forEach((ramhost, index) => this.#index.set(ramhost.server, index))
  }

  #sort() {
    this.#ramhosts.sort((x, y) => {
      if (x.server === "home" || x.server.startsWith("share-serv")) return 1;
      if (y.server === "home" || y.server.startsWith("share-serv")) return -1;

      return x.ram - y.ram
    })
  }

  gethost(server) {
    if (this.#index.has(server)) {
      return this.#ramhosts[this.#index.get(server)];
    } else {
      throw new Error(`Server ${server} not found in ramhost`)
    }
  }

  get totalram() {
    return this.#totalram
  }

  get maxram() {
    return this.#maxram
  }

  get maxramsize() {
    return this.#maxramsize
  }

  get prepThreads() {
    return this.#prepThreats
  }

  buyram(ns, cost) {
    buypid = ns.exec("buyone.js", "home", 1, cost, true)
    return  ns.readPort(buypid)
  }

  assign(Work) {
    const ramhost = this.#ramhosts.find(ramhost => ramhost.ram >= Work.cost);
    if (ramhost) {
      Work.host = ramhost.server;
      ramhost.ram -= Work.cost;
      this.#totalram -= Work.cost;
      return true;
    } else if (buyram(ns, Work.cost)) return false
  }

  finish(Work) {
    const ramhost = this.gethost(Work.server)
    ramhost.ram += Work.cost
    this.#totalram += Work.cost
  }

  simhost() {
    return this.#ramhosts.map(ramhost => ({ ...ramhost }));
  }

  printhost(ns) {
    for (const ramhost of this.#ramhosts) ns.tprint(ramhost)
  }

  testCost(workcost) {
    const simram = this.simhost();
    let batches = 0
    let found = true
    while(found) {
      for(const cost of workcost) {
        found = false;
        const ram = simram.find(ramhost => ramhost.ram >= cost);
        if (ram) {
          ram.ram -= cost;
          found = true;
        } else break;
      }
      if (found) batches ++;
    }
    return batches;
  }
}
