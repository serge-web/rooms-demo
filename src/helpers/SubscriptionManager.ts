import * as XMPP from 'stanza';
import { StanzaErrorCondition } from 'stanza/Constants';
import { JSONItem, StanzaError } from 'stanza/protocol';

export type SubsCallback<t> = (msg: t) => void

interface NodeSubscription {
  node: string
  subId: string
  callback: SubsCallback<object>
}

export class SubsManager {
  xClient: XMPP.Agent
  pubJid: string
  subs: Array<NodeSubscription>
  constructor(xClient: XMPP.Agent, pubJid: string) {
    this.xClient = xClient
    this.pubJid = pubJid
    this.subs = []
    this.xClient.on('pubsub:published', (msg) => {
      console.log('SubMgr: pubsub:published', msg.pubsub.node, msg)
      const items = msg.pubsub.items
      if (items) {
        const node = items.node
        if (items.published && items.published.length > 0) {
          const first = items.published[0] 
          const content = first.content as JSONItem
          const payload = JSON.parse(content.json)
          const sub = this.subs.find((sub) => sub.node === node)
          if (sub) {
            sub.callback(payload)
          } else {
            console.warn('No callback for node', node)
          }
        }
      }
    })
  }
  subscribeToNode(node: string, callback: <T>(msg: T) => void): void {
    // check if already subscribed
    if (!this.subs.some((sub) => sub.node === node)) {
      const sub: NodeSubscription = {
        node,
        subId: 'pending',
        callback
      }
      // store the callback before we subscribe, since there's a good chance
      // we'll instantly get a time-late published document
      this.subs.push(sub)
      
      this.xClient.subscribeToNode(this.pubJid, node).then((res) => {
        sub.subId = res.subid || 'unknown'
      }).catch((err: {error: StanzaError}) => {
        if (err.error.condition === StanzaErrorCondition.ItemNotFound) {
          console.warn('Node does not exist:', node)
        } else {
          console.error('Failed to subscribe to node:', node, err)
        }
      })  
    }
  }
  async unsubscribeAll(): Promise<XMPP.Stanzas.PubsubSubscription[]> {
    const unsubs = this.subs.map((sub) => {
      const options = {
        node: sub.node,
        subId: sub.subId
      }
      return this.xClient.unsubscribeFromNode(this.pubJid, options)
    })
    return await Promise.all(unsubs)
  }

  printSubs(): void {
    console.table(this.subs)
  }
}
