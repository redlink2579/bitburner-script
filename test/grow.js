/** @param {NS} ns */
export async function main(ns) {
  const works = JSON.parse(ns.args[0])
  const target = ns.args[1]
  let growtime = ns.args[2]
  let endtime = ns.args[3]
  const dataport = ns.getPortHandle(ns.args[4])
  const port = ns.getPortHandle(ns.pid)
  let delay = endtime - Date.now() - growtime
  ns.print(ns.tFormat(delay))

  if (delay < 0) {
    ns.tprint(`WARN: ${works.job} was ${-delay} ms late, expect runing time was:, ${ns.tFormat(growtime)}`)
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint(`INFO: Running ${works.job} at ${target} for: ${ns.tFormat(growtime + delay)}`)
    port.write(0)
  }
  let growadd = await ns.grow(target, { additionalMsec: delay })
  ns.write("logging.txt", "grow-add = " + growadd + " \n ", "a")

  const end = Date.now
  ns.atExit(() => {
    if (works.report) { dataport.write(works.job, end) }
    ns.tprint(`SUCCESS: Batch ${works.job} has finished at  ${new Date().toLocaleTimeString()}`)
  })
}
