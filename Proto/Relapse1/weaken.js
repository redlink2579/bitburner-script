//This code was copied from test folder, though there is some change to it
/** @param {NS} ns */
export async function main(ns) {
  const works = JSON.parse(ns.args[0])
  const port = ns.getPortHandle(ns.pid)
  let delay = works.end - works.time - Date.now()

  if (delay < 0) {
    ns.tprint(`WARN: Batch ${works.batch} ${works.job} was ${-delay}ms late, expect running time was:, ${ns.tFormat(works.end - Date.now())}`)
    port.write(-delay)
    delay = 0
  } else {
    ns.tprint(`INFO: Running ${works.job} at ${works.target} for: ${ns.tFormat(works.end + delay - Date.now())}`)
    port.write(0)
  }
  const secreduce = await ns.weaken(works.target, { additionalMsec: delay })
  ns.write("logging.txt", "sec-reduce = " + secreduce + "\n", "a")

  ns.atExit(() => {
    if (works.report) { ns.writePort(works.port, works.type + works.host) }
    ns.tprint(`SUCCESS: Batch ${works.batch} : ${works.job} has finished at  ${new Date().toLocaleTimeString()}`)
  })
}
