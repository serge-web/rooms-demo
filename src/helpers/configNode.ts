import * as XMPP from 'stanza';

export const createNodeIfNecessary = async (xClient: XMPP.Agent, pubJid: string, node: string,
  description: string
) => {
  // check if node exists
  xClient.getNodeConfig(pubJid, node).then(() => {
    // success
    console.log('got config for node', node)
  }).catch((err: unknown) => {
    if (err.error.condition === 'item-not-found') {
      console.log('creating node', node)
      // create node
      xClient.createNode(pubJid, node).then(() => {
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
        xClient.configureNode(pubJid, node, nodeConfig).then(() => {
          // success
        }).catch((err: unknown) => {
          console.error('Error creating/configuring node', err)
      })
    })}})
}