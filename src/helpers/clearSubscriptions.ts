import * as XMPP from 'stanza';
import { PubsubSubscription } from 'stanza/protocol';

export const clearSubscriptions = async (xClient: XMPP.Agent, pubJid: string, node: string,
  
) => {
  const opts = {
    node: node
  }
  return xClient.getSubscriptions(pubJid, opts).then(subs => {
    const unsubPromises = subs.items ? subs.items.map((item: PubsubSubscription): Promise<PubsubSubscription> => {
      console.log('Unsubscribing from', node, item)
      const opts = {
        subid: item.subid,
        node: node
      }
      return xClient.unsubscribeFromNode(pubJid, opts)
    }) : []
    Promise.all(unsubPromises).catch((err: unknown) => {
      console.error('Error unsubscribing', err)
    })
  })
}