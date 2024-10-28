import * as XMPP from 'stanza';
import { StanzaErrorCondition } from 'stanza/Constants';
import { JSONItem, PubsubEventItems, PubsubItem, PubsubSubscription, PubsubSubscriptionOptions, PubsubSubscriptions, StanzaError } from 'stanza/protocol';

export type SubsCallback<t> = (msg: t) => void

/* the interface isn't exported from stanza, so
re-create it here */
interface LocalPubsubPublish {
  pubsub: PubsubEventItems & {
      items: {
          node: string,
          published: PubsubItem[]
      }
  },
}

interface NodeSubscription {
  node: string
  subId: string
  callback: SubsCallback<object>
}

const PENDING = 'id-pending'

/** class that handles subscriptions to pub-sub nodes, supporting callbacks
 * for when those documents change
 */
export class SubsManager {
  xClient: XMPP.Agent
  pubJid: string
  subs: Array<NodeSubscription>
  constructor(xClient: XMPP.Agent, pubJid: string) {
    this.xClient = xClient
    this.pubJid = pubJid
    this.subs = []
    if (this.xClient) {
      this.xClient.on('pubsub:published', (msg: LocalPubsubPublish) => {
        console.log('%% PubSub updated doc:', msg.pubsub.items.node, msg.pubsub.items.published)
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
  }
  async clearSubscriptions(xClient: Readonly<XMPP.Agent>, pubJid: string, node: string): Promise<void> {
    if (!xClient)
      throw new Error('No client')
    const opts = {
      node: node
    }
    await xClient.getSubscriptions(pubJid, opts).then((subs: PubsubSubscriptions) => {
      if (subs.items) {
        const unsubPromises = (subs && subs.items) ? subs.items.map((item: PubsubSubscription): Promise<PubsubSubscriptionOptions> => {
          const opts: XMPP.PubsubUnsubscribeOptions = {
            subid: item.subid,
            node: node
          }
          return xClient.unsubscribeFromNode(pubJid, opts)
        }) : []
        return Promise.all(unsubPromises).catch(() => {
          // ignore this error, server reporting invalid subId, after
          // it's server that provided the subId
          // console.log('Error unsubscribing 2', err, node)
        })  
      }
    }).catch((err: unknown) => {
      console.warn('trouble getting subscriptions', node, err)
    })
  }
  subscribeToNode(node: string, callback: <T>(msg: T) => void): void {
    if (!this.xClient)
      return

    // check if already subscribed
    if (!this.subs.some((sub) => sub.node === node)) {

      // clear any existing subscriptions
      this.clearSubscriptions(this.xClient, this.pubJid, node).then(() => {
        const sub: NodeSubscription = {
          node,
          subId: PENDING,
          callback
        }
        // store the callback before we subscribe, since there's a good chance
        // we'll instantly get a time-late published document
        this.subs.push(sub)
        this.xClient.subscribeToNode(this.pubJid, node).then((res) => {
          sub.subId = res.subid || 'unknown'
        }).catch((err: {error: StanzaError}) => {
          if (err.error.condition === StanzaErrorCondition.ItemNotFound) {
            console.warn('Node does not exist:', node, err)
            // delete the stored subscription
            // this.subs = this.subs.filter((item: NodeSubscription) => item.subId !== sub.subId)
          } else {
            console.error('Failed to subscribe to node:', node, err)
          }
        }).then(() => {
          return 'done'
        })  
      })
    }
  }
  async unsubscribeAll(): Promise<XMPP.Stanzas.PubsubSubscription[]> {
    const validSubs = this.subs.filter((sub) => sub.subId !== PENDING)
    const unsubs = this.xClient ? validSubs.map((sub) => {
      const options = {
        node: sub.node,
        subId: sub.subId
      }
      // console.log('about to unsubscribe from', options)
      return this.xClient.unsubscribeFromNode(this.pubJid, options)
    }) : []
    return await Promise.all(unsubs)
  }

  printSubs(): void {
    console.table(this.subs)
  }
}
