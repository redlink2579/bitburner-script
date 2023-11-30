/** @param {NS} ns */
export async function main(ns) {
  const works = JSON.parse(ns.args[0])
  JSON.parse(works)
  const target = ns.args[1]
  let hacktime = ns.args[2]
  const port = ns.getPortHandle(ns.pid)
  const startTime = Date.now();
  const endTime = Date.now() + works.hacktime;
  let timeElapsed = Date.now() - startTime;
  let delay = endTime - hacktime + works.delay - Date.now()
  if (delay < 0) {
    ns.tprint("!!WARNING!!:", works.job, " was ", ns.tFormat(-delay, true), "late", ns.tFormat(hacktime))
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint("Running ", works.job, " at ", target, " for:", ns.tFormat(hacktime))
    await ns.weaken(target, { additionalMsec: delay })
  }

  const end = Date.now
  ns.atExit(() =>
    port.write(works, end),
    ns.tprint("Batch ", works, " has finished at ", ns.tFormat(end))
  )
}
