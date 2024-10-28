import * as XMPP from 'stanza';
import { PlayerContextInfo, RoomDetails } from '../App';

/** class that handles subscriptions to pub-sub nodes, supporting callbacks
* for when those documents change
*/
export class StanzaManager {
  client: XMPP.Agent
  mucJid: string = ''
  pubJid: string = ''
  fullJid: string = ''
  myRooms: RoomDetails[] = []
  wargame: string = ''
  vCard: XMPP.Stanzas.VCardTemp | undefined = undefined
  print() {
    console.log('mucJid', this.mucJid)
    console.log('pubJid', this.pubJid)
    console.log('fullJid', this.fullJid)
    console.log('myRooms', this.myRooms)
    console.log('wargame', this.wargame)
  }
  constructor(xClient: XMPP.Agent, wargame: string, username: string) {
    this.client = xClient
    this.fullJid = wargame + '/' + username
    this.wargame = wargame
  }
  async config(setPlayerState: (state: PlayerContextInfo | null) => void) {
    console.clear()
    if (this.client) {
      console.log('congiguring stanza manager')
      let roomIds: string[] = []
      let roomNames: string[]
      
      // discover the services for this client
      this.client.getDiscoItems(this.wargame)
      .then((services) => {
        // get the capabilities
        const serviceJids = services.items.map((item) => item.jid)
        const promises = services.items.map((item) => this.client.getDiscoInfo(item.jid))
        Promise.all(promises).then((capabilities) => {
          capabilities.forEach((capability, index) => {
            // console.log('capability', capability)
            const jid = serviceJids[index]
            if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/muc')) { 
              this.mucJid = jid as string
            }
            if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/pubsub')) { 
              this.pubJid = jid as string
            }
          })
        }).then(() => {
          return this.client.getDiscoItems(this.mucJid) 
        }).then((rooms) => {
          return rooms.items
        }).then((rooms) => {
          console.log('SETTING player state')
          roomIds = rooms.map((room) => room.jid || '')
          roomNames = rooms.map((room) => room.name || '')
          const queryRooms = rooms.map((room) => this.client.getDiscoInfo(room.jid || ''))
          return Promise.all(queryRooms)
        }).then(roomConfigs => {
          // collate room names and descriptions
          this.myRooms = roomConfigs.map((config, index):RoomDetails => {
            const firstExtension = config?.extensions[0]
            const desc = firstExtension?.fields?.find((field) => field.label === 'Description')?.value || 'Unknown'
            return {
              jid: roomIds[index],
              name: roomNames[index],
              description: desc as string
            }
          })
          console.log('setting  rooms', this.myRooms)
        }).then(() => {
          return this.client.getVCard(this.fullJid)
        }).then((vCard) => {
          this.vCard = vCard
        }).then(() => {
          const player: Partial<PlayerContextInfo> = {
            vCard: this.vCard,
            myRooms: this.myRooms

            // domain: string
            // fullJid: string
            // jid: string
            // resourceName: string
            // xClient: XMPP.Agent
            // pubJid: string
            // mucJid: string
            // myRooms: RoomDetails[]
            // gameState: GameState | null
            // oldMessages: XMPP.Stanzas.Forward[]
            // roomsTheme: Theme | undefined

          }
          setPlayerState(player as PlayerContextInfo)
        })
      })
    }
  }
}
