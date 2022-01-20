const IPFS = require("ipfs-core");
const tmp = require("tmp");
const getPort = require("get-port");
const OrbitDB = require("orbit-db");
const AccessController = require("orbit-db-access-controllers/src/access-controller-interface");
const AccessControllers = require("orbit-db-access-controllers");

const type = "messagesaccess";
class MessagesAccessController extends AccessController {
  constructor(ipfs, options) {
    super();
    this._ipfs = ipfs;
    this._write = Array.from(options.write || []);
  }

  // Returns the type of the access controller
  static get type() {
    return type;
  }

  // Return a Set of keys that have `access` capability
  get write() {
    return this._write;
  }

  async canAppend(entry, identityProvider) {
    // Allow if access list contain the writer's publicKey or is '*'
    const key = entry.identity.id;
    if (this.write.includes(key) || this.write.includes("*")) {
      // check identity is valid
      return identityProvider.verifyIdentity(entry.identity);
    }
    return true;
  }

  async load(address) {
    // Transform '/ipfs/QmPFtHi3cmfZerxtH9ySLdzpg1yFhocYDZgEZywdUXHxFU'
    // to 'QmPFtHi3cmfZerxtH9ySLdzpg1yFhocYDZgEZywdUXHxFU'
    if (address.indexOf("/ipfs") === 0) {
      address = address.split("/")[2];
    }

    try {
      this._write = await io.read(this._ipfs, address);
    } catch (e) {
      console.log("IPFSAccessController.load ERROR:", e);
    }
  }

  async save() {
    let cid;
    try {
      cid = await io.write(this._ipfs, "dag-cbor", {
        write: JSON.stringify(this.write, null, 2),
      });
    } catch (e) {
      console.log("IPFSAccessController.save ERROR:", e);
    }
    // return the manifest data
    return { address: cid };
  }

  static async create(orbitdb, options = {}) {
    options = {
      ...options,
      ...{ write: options.write || [orbitdb.identity.id] },
    };
    return new MessagesAccessController(orbitdb._ipfs, options);
  }
}

AccessControllers.addAccessController({
  AccessController: MessagesAccessController,
});

const createTmpDir = () => {
  return tmp.dirSync({ mode: 0o750, prefix: "TestTmp_", unsafeCleanup: true });
};

const main = async () => {
  const dir1 = createTmpDir();
  const dir2 = createTmpDir();
  const dir3 = createTmpDir();
  const port1 = await getPort();
  const port2 = await getPort();
  const port3 = await getPort();
  const port4 = await getPort();
  const port5 = await getPort();
  const port6 = await getPort();
  const port7 = await getPort();
  const port8 = await getPort();
  const port9 = await getPort();
  const port10 = await getPort();
  const port11 = await getPort();
  const port12 = await getPort();

  const ipfs1 = await IPFS.create({
    repo: dir1.name,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/${port1}`, `/ip4/127.0.0.1/tcp/${port2}/ws`],
        API: `/ip4/127.0.0.1/tcp/${port3}`,
        Gateway: `/ip4/127.0.0.1/tcp/${port4}`,
      },
    },
  });

  const ipfs2 = await IPFS.create({
    repo: dir2.name,
    config: {
      Addresses: {
        Swarm: [`/ip4/0.0.0.0/tcp/${port5}`, `/ip4/127.0.0.1/tcp/${port6}/ws`],
        API: `/ip4/127.0.0.1/tcp/${port7}`,
        Gateway: `/ip4/127.0.0.1/tcp/${port8}`,
      },
    },
  });

  // const ipfs3 = await IPFS.create({
  //   repo: dir3.name,
  //   config: {
  //     Addresses: {
  //       Swarm: [`/ip4/0.0.0.0/tcp/${port9}`, `/ip4/127.0.0.1/tcp/${port10}/ws`],
  //       API: `/ip4/127.0.0.1/tcp/${port11}`,
  //       Gateway: `/ip4/127.0.0.1/tcp/${port12}`
  //     }
  //   }
  // })

  const orbitdb1 = await OrbitDB.createInstance(ipfs1, {
    directory: dir1.name,
    AccessControllers: AccessControllers,
  });
  const orbitdb2 = await OrbitDB.createInstance(ipfs2, {
    directory: dir2.name,
    AccessControllers: AccessControllers,
  });
  // const orbitdb3 = await OrbitDB.createInstance(ipfs3, { directory: dir3.name })

  const simpleAccessControler = {
    canAppend: (entry) => entry.identity.publicKey === identity.publicKey,
  };

  const kev = await orbitdb1.log("kev", {
    accessController: {
      type: "messagesaccess",
      write: ["*"],
    },
  });

  const kev2 = await orbitdb2.log("kev", {
    accessController: {
      type: "messagesaccess",
      write: ["*"],
    },
  });

  kev.events.on("write", () => {
    console.log("writing to db1");
  });
  kev.events.on("replicated", () => {
    console.log("replicated data");
  });

  kev2.events.on("write", () => {
    console.log("writing to db2");
  });
  kev2.events.on("replicated", () => {
    console.log("replicated data");
  });
  // const kev3 = await orbitdb3.keyvalue('kev', {
  //   accessController: {
  //     write: ['*']
  //   }
  // })

  // const kev_1 = await orbitdb1.keyvalue('kev2', {
  //   accessController: {
  //     write: ['*']
  //   }
  // })
  // const kev2_1 = await orbitdb2.keyvalue('kev2', {
  //   accessController: {
  //     write: ['*']
  //   }
  // })
  // const kev3_1 = await orbitdb3.keyvalue('kev2', {
  //   accessController: {
  //     write: ['*']
  //   }
  // })

  await kev.add("hello");
  await kev2.add("hello");

  const sleep = async (time = 1000) =>
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });

  await sleep(20000);
  await orbitdb1.stop();
  await orbitdb2.stop();
  // await orbitdb3.stop()
  await sleep(2000);
  await ipfs1.stop();
  await ipfs2.stop();
  // await ipfs3.stop()
};

main();
