const IPFS =require('ipfs-core')
const tmp = require('tmp')
const getPort = require('get-port')
const OrbitDB = require('orbit-db')
const PeerMonitor = require('ipfs-pubsub-peer-monitor')


const createTmpDir = () => {
  return tmp.dirSync({ mode: 0o750, prefix: 'TestTmp_', unsafeCleanup: true })
}

const main = async () => {
  const dir1 = createTmpDir()
  const dir2 = createTmpDir()
  const port1 = await getPort()
  const port2 = await getPort()
  const port3 = await getPort()
  const port4 = await getPort()
  const port5 = await getPort()
  const port6 = await getPort()
  const port7 = await getPort()
  const port8 = await getPort()

  const ipfs1 = await IPFS.create({
    repo: dir1.name,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/${port1}`, `/ip4/127.0.0.1/tcp/${port2}/ws`],
        API: `/ip4/127.0.0.1/tcp/${port3}`,
        Gateway: `/ip4/127.0.0.1/tcp/${port4}`
      }
    }
  })

  const topic = '/orbitdb/zdpuAxvRXH3ck1pPizcLS7ZsqQa87sPPTC3FsNfnJzqT8USWZ/kev'
  
  ipfs1.pubsub.subscribe(topic, (message) => {}, (err, res) => {})

  const topicMonitor = new PeerMonitor(ipfs1.pubsub, topic)

  topicMonitor.stop()

  await ipfs1.stop()
}

main()
