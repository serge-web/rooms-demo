import * as XMPP from 'stanza';

export const clearSubscriptions = async (xClient: XMPP.Agent, pubJid: string, node: string,
  
) => {
  const opts = {
    node: node
  }
  return xClient.getSubscriptions(pubJid, opts).then(subs => {
    const unsubPromises = subs.items ? subs.items.map(item => {
      console.log('Unsubscribing from', node, item)
      const opts = {
        subid: item.subid,
        node: node
      }
      return xClient.unsubscribeFromNode(pubJid, opts)
    }) : []
    Promise.all(unsubPromises).catch(err => {
      console.error('Error unsubscribing', err)
    })
  })
}