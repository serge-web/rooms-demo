import * as XMPP from 'stanza';
import { PubsubSubscription, PubsubSubscriptions } from 'stanza/protocol';

export const clearSubscriptions = async (xClient: Readonly<XMPP.Agent>, pubJid: string, node: string) => {
  if (!xClient)
    return
  const opts = {
    node: node
  }
  return await xClient.getSubscriptions(pubJid, opts).then((subs: PubsubSubscriptions) => {
    if (subs.items) {
      console.log('Unsubscribing from', node, subs.items?.length, 'subscriptions', subs)
      const unsubPromises = (subs && subs.items) ? subs.items.map((item: PubsubSubscription): void => {
        const opts: XMPP.PubsubUnsubscribeOptions = {
          subid: item.subid,
          node: node
        }
        xClient.unsubscribeFromNode(pubJid, opts)
      }) : []
      Promise.all(unsubPromises).catch((err: unknown) => {
        console.error('Error unsubscribing', err)
      })  
    }
  }).catch((err: unknown) => {
    console.error('trouble getting subscriptions', err)
  })
}