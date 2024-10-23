import * as XMPP from 'stanza';

export const subscribeIfNecessary = async (xClient: XMPP.Agent, pubJid: string, node: string,
  setSubscriptions: {(value: Array<{node: string, subId: string}>): void},
  subscriptions: Array<{node: string, subId: string}>
) => {
  if(!subscriptions.some((sub) => sub.node === node)) {
    xClient.subscribeToNode(pubJid, node).then((res) => { 
      console.log('Subscribed to game state', node, subscriptions.length, res)
      setSubscriptions([...subscriptions, {node, subId: res.subid || 'unknown'}])
    }).catch((err: unknown) => {
      console.log('Failed to subscribe to node:', node, err)
    })
  } else {
    console.log('Already subscribed to game state')
  }
}