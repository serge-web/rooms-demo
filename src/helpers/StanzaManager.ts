import * as XMPP from 'stanza';
import { PlayerContextInfo, RoomDetails } from '../App';
import { SubsManager } from './SubscriptionManager';

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
  subsMgr: SubsManager | undefined = undefined
  print() {
    console.log('mucJid', this.mucJid)
    console.log('pubJid', this.pubJid)
    console.log('fullJid', this.fullJid)
    console.log('myRooms', this.myRooms)
    console.log('wargame', this.wargame)
  }
  constructor(xClient: XMPP.Agent, wargame: string, username: string) {
    this.client = xClient
    this.fullJid = username + '@' + wargame
    this.wargame = wargame
  }
  subscribeToNode(node: string, callback: <T>(msg: T) => void): void {
    this.subsMgr?.subscribeToNode(node, callback)
  }
  async unsubscribeAll(): Promise<XMPP.Stanzas.PubsubSubscription[] | undefined> {
    return this.subsMgr?.unsubscribeAll()
  }
  async config(): Promise<PlayerContextInfo | null> {
    if (this.client) {
      let roomIds: string[] = []
      let roomNames: string[]
      const state: Partial<PlayerContextInfo> = { }
      const serviceJids: Array<string> = []
      const promises: Promise<XMPP.Stanzas.DiscoInfoResult>[] = []
      return this.client.getDiscoItems(this.wargame).then((services) => {
        // get the capabilities
        serviceJids.push(... services.items.map((item) => item.jid as string))
        promises.push(... services.items.map((item) => this.client.getDiscoInfo(item.jid)))
      }).then(() => {
        return Promise.all(promises)
      }).then((capabilities) => {
        capabilities.forEach((capability, index) => {
          // console.log('capability', capability)
          const jid = serviceJids[index]
          if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/muc')) { 
            this.mucJid = jid as string
            state.mucJid = jid
          }
          if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/pubsub')) { 
            this.pubJid = jid as string
            state.pubJid = jid
            this.subsMgr = new SubsManager(this.client, this.pubJid)
          }
        })
      }).then(() => {
        return this.client.getDiscoItems(this.mucJid) 
      }).then((rooms) => {
        return rooms.items
      }).then((rooms) => {
        roomIds = rooms.map((room) => room.jid || '')
        roomNames = rooms.map((room) => room.name || '')
        const queryRooms = rooms.map((room) => this.client.getDiscoInfo(room.jid || ''))
        return Promise.all(queryRooms)
      }).then(roomConfigs => {
        // collate room names and descriptions
        state.myRooms = roomConfigs.map((config, index):RoomDetails => {
          const firstExtension = config?.extensions[0]
          const desc = firstExtension?.fields?.find((field) => field.label === 'Description')?.value || 'Unknown'
          return {
            jid: roomIds[index],
            name: roomNames[index],
            description: desc as string
          }
        })
      }).then(() => {
        return this.client.getVCard(this.fullJid)
      }).then((vCard) => {
        console.log('requesting vCard for', this.fullJid, vCard)
        state.vCard = vCard
      }).catch((err) => {
        console.error('Error in stanza manager', err)
      }).then(() => {
        const res: PlayerContextInfo = {
          domain: this.wargame,
          fullJid: this.fullJid,
          jid: this.fullJid,
          resourceName: this.fullJid,
          xClient: this.client,
          pubJid: this.pubJid,
          mucJid: this.mucJid,
          myRooms: state.myRooms || [],
          oldMessages: [],
          roomsTheme: undefined,
          vCard: state.vCard || undefined,
          stanzaMgr: this
        }
        return res
      })
      return null
    } else {
      throw new Error('No client')
    }
  }
}
