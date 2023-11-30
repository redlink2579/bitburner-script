/** @param {NS} ns */
export async function main(ns) {
  const works = JSON.parse(ns.args[0])
  const target = ns.args[1]
  let weakentime = ns.args[2]
  let delay = ns.args[3]
  const port = ns.getPortHandle(ns.pid)

  if (delay < 0) {
    ns.tprint("!!WARNING!!:", works.job, " was ", ns.tFormat(-delay, true), "late", ns.tFormat(weakentime))
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint("Running ", works.job, " at ", target, " for:", ns.tFormat(delay))
    await ns.weaken(target, { additionalMsec: delay })
  }

  const end = Date.now
  ns.atExit(() =>
    port.write(works, end),
    ns.tprint("Batch ", works, " has finished at ", ns.tFormat(end))
  )
}
