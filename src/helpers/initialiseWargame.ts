import { StanzaManager } from "./StanzaManager"
import * as XMPP from 'stanza';


interface RoomConfig {
  name: string
  visibility: string
}

const adminRoom: RoomConfig = {
  name: '_admin',
  visibility: 'public'
}

const createRoom = (client: XMPP.Agent, config: RoomConfig, mucJid: string) =>
{
  console.log('about to create room', config)
  const name = config.name + '@' + mucJid
  client.joinRoom(name, 'ian').then((res) => {
    console.log('joined', res)
  })
  // client.configureRoom(name, {}).then((config) => console.log(config))
  .catch((err) => {
    console.log('failed to create room')
    console.error(err)
  })
}

const initialiseWargame = (subMgr: StanzaManager) => {
  console.log('checking wargame init')
  const initialised = subMgr.checkInitialized()

  if (initialised) {
    subMgr.client.getRoomConfig(adminRoom.name + '@' + subMgr.mucJid).then((res) => {
      return console.log('config', res)
    }).then(() => {
//      subMgr.client.deleteNode(subMgr.mucJid, adminRoom.name + '@' + subMgr.mucJid)

    })
    .then((res) => {
      console.log('deleted', res)
    })
  }

  if (!initialised) {
    // creating room
    const client = subMgr.client
    createRoom(client, adminRoom, subMgr.mucJid)
  }
}

export default initialiseWargame