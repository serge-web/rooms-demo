// Login.tsx
import * as XMPP from 'stanza';

import './Login.css';
import { WelcomePage } from './WelcomePage';
import { SimpleDialog } from './SimpleDialog';
import { PlayerContextInfo, RoomDetails } from './App';
import { useState } from 'react';
import { GAME_STATE_NODE, GAME_THEME_NODE } from './Constants';
import { ThemeOptions } from '@mui/material';
import { clearSubscriptions } from './helpers/clearSubscriptions';

const wargames = ['localhost'];

export interface LoginProps {
  setPlayerState: (state: PlayerContextInfo | null) => void
  setThemeOptions: (theme: ThemeOptions) => void
  welcomeTitle?: string
  welcomeMsg?: string
}

export const Login: React.FC<LoginProps> = ({ setPlayerState, welcomeTitle, welcomeMsg }: LoginProps) => {
  const [dialog, setDialog] = useState<string | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  
  const handleLogin = (selectedWargame: string, username: string, password: string) => {
    console.log('Logging into ', selectedWargame,' with:', username, password);
    const jid = username + '@' + selectedWargame;
    // whether to use https or http
    // const securehttp = true
    const config = {
      jid: jid,
      password: password,
      resource: username,
      transports: {
        websocket: false, // 'wss://164.92.157.13:5280/ws-xmpp',
        bosh: '/dobosh'
        // bosh: securehttp ? 'https://war-rooms.info/bosh' :'http://164.92.157.13:5280/http-bind'
      }
    }
    const client = XMPP.createClient(config);
    
    // client.on('raw:*', (direction, data) => {
    //     console.log('== ', new Date().toISOString(), direction, data)
    //   })
    
    client.on('session:started', () => {
      console.log('Logged in. Setting xClient')
      const jid = username + '@' + selectedWargame;
      const context: Partial<PlayerContextInfo> = {
      }
      // find out server capabilities
      client.getDiscoItems(selectedWargame).then((services) => {
        // get the capabilities
        const serviceJids = services.items.map((item) => item.jid)
        const promises = services.items.map((item) => client.getDiscoInfo(item.jid))
        Promise.all(promises).then((capabilities) => {
          capabilities.forEach((capability, index) => {
            // console.log('capability', capability)
            const jid = serviceJids[index]
            if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/muc')) { 
              context.mucJid = jid
            }
            if(capability.features.find((feature) => feature === 'http://jabber.org/protocol/pubsub')) { 
              context.pubJid = jid
            }
          })
        }).then(() => {
          // clear any existing theme or game subscriptions
          return clearSubscriptions(client, context.pubJid || '', GAME_THEME_NODE)
        }).then(() => {
          // clear any existing theme or game subscriptions
          return clearSubscriptions(client, context.pubJid || '', GAME_STATE_NODE)
        }).then(() => {
          // get room configs
          if (context.mucJid) {
            client.getDiscoItems(context.mucJid).then((rooms) => {
              return rooms.items
            }).then((rooms) => {
              console.log('SETTING player state', context.myRooms)
              const roomIds = rooms.map((room) => room.jid || '')
              const roomNames = rooms.map((room) => room.name || '')
              const queryRooms = rooms.map((room) => client.getDiscoInfo(room.jid || ''))
              Promise.all(queryRooms).then((roomConfigs) => {
                
                // collate room names and descriptions
                context.myRooms = roomConfigs.map((config, index):RoomDetails => {
                  const firstExtension = config?.extensions[0]
                  const desc = firstExtension?.fields?.find((field) => field.label === 'Description')?.value || 'Unknown'
                  return {
                    jid: roomIds[index],
                    name: roomNames[index],
                    description: desc as string
                  }
                })
                
                setPlayerState({
                  domain: selectedWargame,
                  fullJid: jid + '/' + username,
                  jid: jid,
                  resourceName: username,
                  xClient: client,
                  pubJid: context.pubJid || '',
                  mucJid: context.mucJid || '',
                  myRooms: context.myRooms || [],
                  gameState: null})
                })  
              })
            }
          })
        })
      })
      
      
      client.on('auth:failed', () => {
        setDialogTitle('Login')
        setDialog('Authorisation failed')
      })
      
      client.on('bosh:terminate', (direction) => {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const safeObj: any = direction
        if (safeObj.condition && safeObj.condition === XMPP.Constants.StreamErrorCondition.HostUnknown) {
          setDialogTitle('Login')
          setDialog('Wargame not found')
        }
      })
      
      client.connect();
      
      client.off('bosh:terminate', (direction) => {
        console.log('ignoring terminate', direction)
      })
      
      console.log('connect sent:', config.jid)
    }
    
    
    return ( 
      <>
      <div id='login-container'>
      <WelcomePage welcomeTitle={welcomeTitle} welcomeMsg={welcomeMsg} wargames={wargames} handleLogin={handleLogin} />
      </div> 
      <SimpleDialog dialog={dialog} setDialog={setDialog} dialogTitle={dialogTitle} />
      </>
    )
  }
  
  export default Login;