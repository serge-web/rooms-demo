import * as XMPP from 'stanza';

export const createNodeIfNecessary = async (xClient: XMPP.Agent, pubJid: string, node: string,
  description: string, allVersions: boolean = false
) => {
  // check if node exists
  xClient.getNodeConfig(pubJid, node).then(() => {
    // success
    console.log('got config for node', node)
  }).catch((err: { error: { condition: string } }) => {
    // ignore compiler warning for unknown type on line below
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
        if (allVersions && nodeConfig.fields) {
          // indicate we want to store all previous versions
          nodeConfig.fields.push({name: 'pubsub#max_items', value: '1000'})
        }
        console.log('about to config node', nodeConfig)
        xClient.configureNode(pubJid, node, nodeConfig).then(() => {
          // success
          console.log('new node configured')
        }).catch((err: unknown) => {
          console.error('Error creating/configuring node', err)
      })
    })}})
}