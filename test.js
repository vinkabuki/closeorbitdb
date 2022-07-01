const IPFS =require('ipfs-core')
const tmp = require('tmp')
const getPort = require('get-port')
const OrbitDB = require('orbit-db')

const sleep = async (time = 1000) =>
  await new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })

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

  // const ipfs2 = await IPFS.create({
  //   repo: dir2.name,
  //   config: {
  //     Addresses: {
  //       Swarm: [`/ip4/0.0.0.0/tcp/${port5}`, `/ip4/127.0.0.1/tcp/${port6}/ws`],
  //       API: `/ip4/127.0.0.1/tcp/${port7}`,
  //       Gateway: `/ip4/127.0.0.1/tcp/${port8}`
  //     }
  //   }
  // })

  let orbitdb1 = await OrbitDB.createInstance(ipfs1, { directory: dir1.name })
  // let orbitdb2 = await OrbitDB.createInstance(ipfs2, { directory: dir2.name })

  let kev = await orbitdb1.log('kev', {
    accessController: {
      write: ['*']
    }
  })

  
  
  // const kev2 = await orbitdb2.log('kev', {
  //   accessController: {
  //     write: ['*']
  //   }
  // })

  kev.events.on('write', () => {
    console.log('wrote message')
  })
  
  // kev2.events.on('write', () => {
  //   console.log('Adding message')
  // })
  
  kev.events.on('replicate.progress', () => {

  })
  
  // kev2.events.on('replicate.progress', (address, _hash, entry, progress, total) => {
  //   console.log('replicated something')
  //   console.log(Date.now() - entry.payload.value.timestamp)
    
  // })

  const sendMessages = async () => {
    for (let i = 0; i<100000;  i++) {
      console.log(i)

      await kev.add({
        timestamp: Date.now(),
        message: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagfdge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagdsfgdfge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messadfgge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagde: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagsdfse: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messsdfgage: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf',
        messagsdfgdsfge: 'adsfasdfasfasdfasdfafasfaslfknas asdklfasjkd flkasdjfa sfjasdlflaksdflajslfaslkd fjasdf'
      })
    }
  }

  await sendMessages()

  console.log('before laoding into memory')
  await kev.load()
  console.log('after loading into memory')

  // await kev.add('testEntry')
  // await kev.add('testEntry')
  // await kev2.add('testEntry')
  // await kev2.add('testEntry')
  // await kev2.add('testEntry')
  // await kev.add('testEntry')
  console.log('After creating stores')
  
  await sleep(5000)
  
  await orbitdb1.stop()
  // await orbitdb2.stop()
  await ipfs1.stop()
  // await ipfs2.stop()
}

main()
