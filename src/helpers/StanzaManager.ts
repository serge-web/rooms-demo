import * as XMPP from 'stanza';
import { PlayerContextInfo, RoomDetails } from '../App';
import { SubsManager } from './SubscriptionManager';
import { DiscoInfoResult, DiscoItemsResult, JSONItem, Message, ReceivedPresence } from 'stanza/protocol';

/** class that handles subscriptions to pub-sub nodes, supporting callbacks
* for when those documents change
*/
export class StanzaManager {
  client: XMPP.Agent
  mucJid = ''
  pubJid = ''
  fullJid = ''
  myRooms: RoomDetails[] = []
  wargame = ''
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
  async disconnect(): Promise<void> { 
    const promises =this.myRooms.map((room) => this.client.leaveRoom(room.jid))
    Promise.all(promises).catch((err) => {
      console.error('Error unsubscribing rooms', err)  
    }).then(() => {
      return this.subsMgr?.unsubscribeAll()
    }).catch((err) => {
      console.error('Error unsubscribing nodes', err)
    }).finally(() => {
      return this.client.disconnect()
    })
  }
  sendMessage(message: Message): string {
    return this.client.sendMessage(message)
  }
  async config(): Promise<PlayerContextInfo | null> {
    if (this.client) {
      let roomIds: string[] = []
      let roomNames: string[]
      const state: Partial<PlayerContextInfo> = { }
      const serviceJids: string[] = []
      const promises: Promise<XMPP.Stanzas.DiscoInfoResult>[] = []
      return this.client.getDiscoItems(this.wargame).then((services) => {
        // get the capabilities
        serviceJids.push(... services.items.map((item) => item.jid as string))
        promises.push(... services.items.map((item) => this.client.getDiscoInfo(item.jid)))
      }).then(() => {
        return Promise.all(promises)
      }).then((capabilities: DiscoInfoResult[]) => {
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
      }).then((rooms: DiscoItemsResult) => {
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
  joinRoom(room: string): void {
    const roomPresence: XMPP.Stanzas.MUCPresence = {
      muc: {
        type: 'join',
        history:  {
          maxStanzas: 20
        }
      }
    }
    this.client.joinRoom(room, this.fullJid, roomPresence).catch((err: unknown) => {
      console.log('Failed to join room', room, err)
    })  
  }
  async leaveRoom(room: string): Promise<ReceivedPresence> {
    return this.client.leaveRoom(room)
  }
  async createNodeIfNecessaryThenPublish (node: string,
    description: string, jsonItem: JSONItem, allVersions = false
  ): Promise<void> {
    // check if node exists
    this.client.getNodeConfig(this.pubJid, node).then(() => {
      // success
      // console.log('got config for node', node)
    }).catch((err: { error: { condition: string } }) => {
      // ignore compiler warning for unknown type on line below
      if (err.error.condition === 'item-not-found') {
        console.log('creating node', node)
        // create node
        this.client.createNode(this.pubJid, node).then(() => {
          console.log('created node', node)
          // now configure it
          const nodeConfig: XMPP.Stanzas.DataForm = {
            fields:[
              {name: 'pubsub#description', value: description},
              {name: 'pubsub#type', value: 'json'},
              {name: 'pubsub#persist_items', value: true}
            ],
            type: 'submit',
            title: 'Node configuration'
          }
          if (allVersions && nodeConfig.fields) {
            // indicate we want to store all previous versions
            nodeConfig.fields.push({name: 'pubsub#max_items', value: '1000'})
          }
          console.log('about to config node', node, nodeConfig)
          this.client.configureNode(this.pubJid, node, nodeConfig).then(() => {
            // success
            console.log('new node configured')
          }).catch((err: unknown) => {
            console.error('Error creating/configuring node', err)
          })
      })}}).then(() => {
        this.client.publish(this.pubJid, node, jsonItem).then((res) => {
          console.log('Published game state', res)
        })
      }).catch((err: unknown) => {
          console.error('Error publishing game state', err)
      })
  }
}
