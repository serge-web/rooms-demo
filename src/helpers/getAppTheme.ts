import { ThemeOptions } from '@mui/material';
import * as XMPP from 'stanza';
import { AppConfiguration } from '../App';

export const getAppConfig = (setConfig: {(config: AppConfiguration | null): void}) => {
  // plus, _eventually_, we will retrieve the data from private storage for admin
  const adminLogin = 'admin@localhost'
  const adminPwd = 'pwd'
  const securehttp = true
  const config = {
    jid: adminLogin,
    password: adminPwd,
    resource: 'web-cient',
    transports: {
      websocket: false,
      bosh: securehttp ? 'https://war-rooms.info/bosh' :'http://164.92.157.13:5280/http-bind'
    }
  }
  const client = XMPP.createClient(config);


    // client.on('raw:*', (direction, data) => {
    //     console.log('== ', new Date().toISOString(), direction, data)
    //   })

    // const doIt = () => {
    //   const theme: ThemeOptions = {
    //     palette: {
    //       primary: {
    //         main: "#2a9461"
    //       },
    //       secondary: {
    //         main: "#494c7d"
    //       }
    //     }
    //   }
    //   const appData: AppConfiguration = {
    //     title: 'New Title',
    //     welcomeMessage: 'New Welcome Message',
    //     theme: theme
    //   }
    //   const str = JSON.stringify(appData)
    //   const msg = {
    //     to: "_store@group.localhost",
    //     body: str
    //   }
    //   console.log('sending', msg)
    //   client.sendMessage(msg)
    // }

      // client.on('raw:*', (direction, data) => {
      //   console.log('== ', new Date().toISOString(), direction, data)
      // })


    client.on('session:started', () => {
      console.log('Debug routine running. Logged in')

      const theme: ThemeOptions = {
        palette: {
          primary: {
            main: "#2a9461"
          },
          secondary: {
            main: "#494c7d"
          }
        }
      }
      const appData: AppConfiguration = {
        title: 'Configured Title',
        welcomeMessage: 'Configured Welcome Message',
        theme: theme
      }
      setConfig(appData)

      // client.getPrivateData('bookmarks').then((res) => {
      //   console.log('get private data', res)
      // }).catch((err) => {console.error('get private data error', err)})

      // const str = JSON.stringify(appData)

      // // send private data
      // client.setPrivateData("init",str).then((res => {
      //   console.log('set private data', res)
      // })).catch((err) => {
      //   console.error('set private data error', err)
      // }).finally(() => {
      //   // first join the store room
      //   console.log('disconnecting')
      client.disconnect()
      // })
    });

    client.connect()
  }