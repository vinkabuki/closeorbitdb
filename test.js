const tmp = require('tmp')
const getPort = require('get-port')
const fs = require('fs')
const crypto = require('crypto')
const { Multiaddr } = require('multiaddr')

const sleep = async (time = 1000) =>
  await new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })

const createTmpDir = () => {
  return tmp.dirSync({ mode: 0o750, prefix: 'TestTmp_', unsafeCleanup: true })
}

function createFile(filePath, size) {
  const stream = fs.createWriteStream(filePath)
  const maxChunkSize = 1048576 // 1MB
  if (size < maxChunkSize) {
    stream.write(crypto.randomBytes(size))
  } else {
    const chunks = Math.floor(size / maxChunkSize)
    for (let i = 0; i < chunks; i++) {
      stream.write(crypto.randomBytes(Math.min(size, maxChunkSize)))
      size -= maxChunkSize
    }
  }
  stream.end()
}

const uploadFile = async (ipfsInstance, filename) => {
  const stream = fs.createReadStream(`./${filename}`, { highWaterMark: 64 * 1024 * 10 })
  const uploadedFileStreamIterable = {
    async* [Symbol.asyncIterator]() {
      for await (const data of stream) {
        yield data
      }
    }
  }

  // Create directory for file
  const dirname = 'uploads'
  await ipfsInstance.files.mkdir(`/${dirname}`, { parents: true })

  console.time(`Writing ${filename} to ipfs`)
  await ipfsInstance.files.write(`/${dirname}/${filename}`, uploadedFileStreamIterable, {
    create: true
  })
  console.timeEnd(`Writing ${filename} to ipfs`)

  let cid
  const entriesLS = ipfsInstance.files.ls(`/${dirname}`)
  for await (const entry of entriesLS) {
    if (entry.name === filename) {
     cid = entry.cid
    }
  }
  return cid
}

const downloadFile = async (ipfsInstance, cid, filename) => {
  console.log(cid, 'cid')
  const stat = await ipfsInstance.files.stat(cid)
  console.log(stat)
  const entries = ipfsInstance.cat(cid)
  const writeStream = fs.createWriteStream(`received${filename}`)
  console.log('before iterating')
  let counter = 1
  for await (const entry of entries) {
    console.log('entry', counter)
    counter++
    await new Promise((resolve, reject) => {
      writeStream.write(entry, err => {
        if (err) {
          console.error(`${metadata.name} download error: ${err}`)
          reject(err)
        }
        resolve()
      })
    })
  }
  writeStream.end()
  console.log('after iterating')
}

async function createPeerId() {
  const PeerId = await import('peer-id')
  const { peerIdFromKeys } = await eval("import('@libp2p/peer-id')")
  const peerId = await PeerId.create()
  // @eslint-ignore
  return peerIdFromKeys(peerId.marshalPubKey(), peerId.marshalPrivKey())
}

const main = async () => {
  const { create } = await import('ipfs-core')
  const {createInstance} = (await import('orbit-db')).default
  const { createLibp2p } = await import('libp2p')
  const { noise } = await import('@chainsafe/libp2p-noise')
  const { gossipsub }  = await import('@chainsafe/libp2p-gossipsub')
  const { mplex } = await import('@libp2p/mplex')
  const { kadDHT } = await import('@libp2p/kad-dht')
  const { webSockets } = await import('@libp2p/websockets')
  const filters = await import('@libp2p/websockets/filters')

  
  
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

  const port9 = await getPort()
  const port10 = await getPort()

  const peerId1 = await createPeerId()
  const peerId2 = await createPeerId()

  // Custom Libp2p instances
  const p2p1 = await createLibp2p({
    connectionManager: {
      minConnections: 3,
      maxConnections: 8,
      dialTimeout: 120_000,
      maxParallelDials: 10
    },
    peerId: peerId1,
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/${port9}/ws`]
    },
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    relay: {
      enabled: false,
      hop: {
        enabled: true,
        active: false
      }
    },
    transports: [
      webSockets({
        filter: filters.all
      })],
    dht: kadDHT(),
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
  })

  const p2p2 = await createLibp2p({
    connectionManager: {
      minConnections: 3,
      maxConnections: 8,
      dialTimeout: 120_000,
      maxParallelDials: 10
    },
    peerId: peerId2,
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/${port10}/ws`]
    },
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    relay: {
      enabled: false,
      hop: {
        enabled: true,
        active: false
      }
    },
    transports: [
      webSockets({
        filter: filters.all
      })],
    dht: kadDHT(),
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
  })

  // Custom IPFS instances
  const ipfs1 = await create({
    libp2p: async () => p2p1,
    preload: { enabled: false },
    EXPERIMENTAL: {
      ipnsPubsub: true
    },
    init: {
      privateKey: peerId1
    },
    repo: dir1.name,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/${port1}`, `/ip4/127.0.0.1/tcp/${port2}/ws`],
        API: `/ip4/127.0.0.1/tcp/${port3}`,
        Gateway: `/ip4/127.0.0.1/tcp/${port4}`
      }
    }
  })

  const ipfs2 = await create({
    libp2p: async () => p2p2,
    preload: { enabled: false },
    EXPERIMENTAL: {
      ipnsPubsub: true
    },
    init: {
      privateKey: peerId2
    },
    repo: dir2.name,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/${port5}`, `/ip4/127.0.0.1/tcp/${port6}/ws`],
        API: `/ip4/127.0.0.1/tcp/${port7}`,
        Gateway: `/ip4/127.0.0.1/tcp/${port8}`
      }
    }
  })

  let orbitdb1 = await createInstance(ipfs1, { directory: dir1.name })
  let orbitdb2 = await createInstance(ipfs2, { directory: dir2.name })
  
  console.log('Peer1 is dialing peer2 by address')
  await p2p1.dial(new Multiaddr(`/ip4/127.0.0.1/tcp/${port10}/ws`))

  let kev = await orbitdb1.log('kev', {
    accessController: {
      write: ['*']
    }
  })

  const kev2 = await orbitdb2.log('kev', {
    accessController: {
      write: ['*']
    }
  })

  kev.events.on('write', () => {
    console.log('kev wrote message')
  })
  
  kev2.events.on('write', () => {
    console.log('kev2 wrote message')
  })
  
  kev.events.on('replicate.progress', (address, _hash, entry, progress, total) => {
    console.log('kev replicated:', entry.payload.value)
  })
  
  kev2.events.on('replicate.progress', (address, _hash, entry, progress, total) => {
    console.log('kev2 replicated:', entry.payload.value)
  })

  const filename = `${(Math.random() + 1).toString(36).substring(7)}_largeFile.txt`
  createFile(filename, 73400320) // 70MB    
  const cid = await uploadFile(ipfs1, filename)
  
  await sleep(20000)
  // Send some messages to prove that peers are connected and replicating
  await kev.add('testEntry1')
  await kev.add('testEntry2')
  await kev2.add('testEntry3')
  
  await downloadFile(ipfs2, cid, filename)
  await sleep(20000)
  
  await orbitdb1.stop()
  await orbitdb2.stop()
  await ipfs1.stop()
  await ipfs2.stop()
}

main()
