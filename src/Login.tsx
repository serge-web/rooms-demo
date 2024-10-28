// Login.tsx
import * as XMPP from 'stanza';

import './Login.css';
import { WelcomePage } from './WelcomePage';
import { SimpleDialog } from './SimpleDialog';
import { PlayerContextInfo } from './App';
import { useState } from 'react';
import { ThemeOptions } from '@mui/material';
import { StanzaManager } from './helpers/StanzaManager';


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
      const stanzaMgr = new StanzaManager(client, selectedWargame, username)
      stanzaMgr.config().then((state) => {
        if (state) {
          setPlayerState(state)
        } else {
          console.error('No state')
        }
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