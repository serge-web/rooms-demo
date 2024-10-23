// Login.tsx
import * as XMPP from 'stanza';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './Login.css';
import { GameStatePanel } from './GameStatePanel';
import { FORCE_DETAILS, GAME_STATE, GAME_STATE_NODE, GAME_THEME_NODE, THEME } from './Constants'
import { SimpleDialog } from './SimpleDialog';
import { MUCAllRooms } from './MUCAllRooms';
import { PlayerContext, PlayerContextInfo, RoomDetails } from './App';
import { ThemeOptions, ThemeProvider } from '@mui/material';
import { SubsManager } from './helpers/SubscriptionManager';

export interface GamePresence {
  jid: string
  present: boolean
}

interface GameData {
  type: string
}

export interface GameState extends GameData {
  type: typeof GAME_STATE
  gameTurn: number
  gameTime: string
  gameTimeStep: string
}

export interface ForceDetails extends GameData {
  type: typeof FORCE_DETAILS
  id: string // short name
  name: string // display name
  color: string // hex color
  icon?: string // icon URL
  objective?: string // objectives for this force
}

export interface ThemeDetails extends GameData {
  type: typeof THEME
  data: ThemeOptions
}
 
export interface GameProps {
  setPlayerState: (state: null) => void
  setGameState: (state: GameState) => void
  parentTheme: ThemeOptions
}



// const handleDataMessage =(message: XMPP.Stanzas.Message, setGameState, states: GameState[], forces: ForceDetails[], setTheme:{(theme: ThemeOptions): void}): void => {
//   const theId = message.id
//   if (theId && theId.startsWith('_')) {
//     const json = JSON.parse(message.body || '{}') as GameData
//     const msgType = json.type
//     switch(msgType) {
//       case GAME_STATE:{
//         states.push(json as GameState)
//         break
//       }
//       case FORCE_DETAILS:{
//         forces.push(json as ForceDetails)
//         break
//       }
//       case THEME:{
//         // Update the theme
//         console.log('display', json as ThemeDetails)
//         setTheme(createTheme((json as ThemeDetails).data))
//         break
//       }
//     }
//   }
// }

const onlyLastForce = (forces: ForceDetails[]): ForceDetails[] => {
  const map: {[index: string]: ForceDetails} = {}
  forces.forEach((item: ForceDetails) =>{
    map[ item.id ] = item;
  })
  return Object.keys( map ).map( function(key){
    return map[key];
  })
}

export const Game: React.FC<GameProps> = ({ setPlayerState, setGameState, parentTheme }: GameProps) => {
  const {jid, resourceName, xClient, myRooms, pubJid
   } = useContext(PlayerContext) as PlayerContextInfo
  const [trimmedRooms, setTrimmedRooms] = useState<RoomDetails[]>([]);
  const [newMessage, setNewMessage] = useState<XMPP.Stanzas.Forward | undefined>();
  const [showHidden, setShowHidden] = useState(false);
  // null for when no vCard found
  const [vCard, setVCard] = useState<XMPP.Stanzas.VCardTemp | undefined | null>(undefined);
  const [isGameControl, setIsGameControl] = useState<boolean>(false);
  const [isFeedbackObserver, setIsFeedbackObserver] = useState<boolean>(false);
  const [properName, setProperName] = useState<string>('');
  
  const [dialog, setDialog] = useState<string | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  
  const [forceDetails] = useState<ForceDetails[]>([]);

  const [theme] = useState<ThemeOptions>(parentTheme);

  const [subsManager, setSubsManager] = useState<SubsManager | null>(null)

  // TODO: this flag prevents us setting up the client multiple times
  // it would be better to not have the issue
  const clientDone = useRef<boolean>();

  // post-login steps
  useEffect(() => {
    if (xClient && clientDone.current === undefined) {
      clientDone.current = true

      // set up subscriptions manager
      setSubsManager(new SubsManager(xClient, pubJid))

      // xClient.on('raw:*', (direction, data) => {
      //   console.log('== ', new Date().toISOString(), direction, data)
      // })
      
      // listen for incoming messages
      xClient.on('disconnected', msg => {
        console.log('EV: disconnected', msg, !!setDialogTitle, !!onlyLastForce)
      });
      
      // listen for incoming messages
      xClient.on('stream:error', msg => {
        console.log('EV:stream error', msg)
      });
      
      // listen for incoming messages
      xClient.on('presence:error', msg => {
        console.log('EV:presence error', msg)
      });
      
      // listen for incoming messages
      xClient.on('chat', msg => {
        console.log('EV: chat3', msg)
      });

      // listen for incoming messages
      xClient.on('groupchat', (msg: XMPP.Stanzas.ReceivedMessage) => {
        console.log('EV: group chat', msg)
        const message: XMPP.Stanzas.Message = msg as XMPP.Stanzas.Message
        // wrap message in a Forward stanza, so it has a delay
        const forward: XMPP.Stanzas.Forward = {
          message: message,
          delay: message.delay || {timestamp: new Date()}
        }
        setNewMessage(forward)
      });
      
      xClient.on('bosh:terminate', (direction, data) => {
        console.log('bosh:terminate: logging out', direction, 'data:', data)
        // clear local data
        setNewMessage(undefined)
        setShowHidden(false)
        // clear client link (to log out)
        setPlayerState(null)
        // console.clear()
      })
      
      xClient.on('muc:available', () => {
        // console.log('new MUC available', muc)
      });

      xClient.on('muc:other', (muc) => {
        console.log('new MUC other', muc)
      });
      
      xClient.on('muc:join', (muc) => {
        console.log('new MUC join', muc)
      });

      xClient.on('muc:topic', () => {
        // note: we ignore the room topic, we use the 
        // room-name from the room config details
        // console.log('new MUC topic', muc)
      });

      xClient.on('iq', (iq) => {
        if (iq.muc && iq.muc.type === 'user-list') {
          // response to get room users
        } else if (iq.muc && iq.muc.type === 'configure') {
          // response to get room config
        } else if (iq.vcard){
          // response to get vcard
        } else if (iq.archive){
          // response to get history
          // console.log('iq archive', iq)
        } else if (iq.roster){
          // response to get roster
        } else {
          // ignore
          // console.log('new IQ', iq)
        }
      });

      xClient.on('muc:leave', (muc) => {
        console.log('new MUC leave', muc)
      });
      
      xClient.on('muc:error', (muc) => {
        console.log('new MUC error', muc)
      });
     
      // get my vcard
      xClient.getVCard(jid).then((vcard) => {
        setVCard(vcard)
      }).catch(() => {
        console.log('No vCard for', jid)
        setVCard(null)
      })

      // request carbons
      xClient.enableCarbons().then(() => {
        // console.log('carbons enabled')
      }).catch((err) => {
        console.log('Failed to enable carbons', err)
      })
      
      // general presence announcement
      xClient.sendPresence()
  }
  
  // note: we ignore the exhaustive-deps warning here because#
  // it would introduce race condition where we update rooms and a
  // the effect gets called again due to rooms changing
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [xClient])

// register for pubsub node updates
useEffect(() => {
  if (subsManager) {
    subsManager.subscribeToNode(GAME_STATE_NODE, (msg) => {
      const gameState = msg as GameState
      setGameState(gameState)
    })

    subsManager.subscribeToNode(GAME_THEME_NODE, (msg) => {
      const gameTheme = msg as ThemeOptions
      console.log('theme is', gameTheme)
    })

  }
}, [subsManager, setGameState])

// update user flags from vCard categories
useEffect(() => {
  if (vCard !== undefined) {
    if ((vCard !== null)) {
      // start off with categories
      const records = vCard.records
      const categoryRecords = records?.filter((record) => record.type === 'categories')
      const categories = categoryRecords?.map((record) => record.value[0])
      if (categories) {
        setIsGameControl(categories.includes('GameControl'))
        setIsFeedbackObserver(categories.includes('FeedbackObserver'))
      }
      
      // now the 
      if (vCard.fullName) {
        setProperName(vCard.fullName)
      }  
    } else {
      setIsGameControl(false)
      setProperName('')
    }
  }
}, [vCard])


/** join my rooms */
useEffect(() => {
  if (xClient && myRooms) {
    const trimmed = myRooms.filter((room) => {
      return showHidden || !(room.jid && room.jid.startsWith('_'))
    })
    // join the rooms (even the none-vis ones)
    myRooms.forEach((room) => {
      // enter this room
      if (room && room.jid) {
        const roomPresence: XMPP.Stanzas.MUCPresence = {
          muc: {
            type: 'join',
            history:  {
              maxStanzas: 20
            }
          }
        }
        xClient.joinRoom(room.jid, resourceName, roomPresence).catch((err) => {
          console.log('Failed to join room', room, err)
        })  
      }  
    })
    // console.log('trimmed rooms', trimmed, showHidden)
    setTrimmedRooms(trimmed)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [myRooms, showHidden])

const handleLogout = useCallback(() => {
  // leave rooms
  // console.log('Leaving rooms', trimmedRooms.length)
    if (xClient && myRooms !== null) {
      const rooms = myRooms.map(room => xClient.leaveRoom(room.jid || 'unknown'))
      Promise.all(rooms).then(() => {
        return subsManager?.unsubscribeAll()
        }).catch((err) => {
          console.log('trouble leaving rooms', err)
        }).finally(() => {
          xClient.disconnect()
          setPlayerState(null)
      })
    }
}, [myRooms, xClient, subsManager, setPlayerState])

const sendMessage = (msg: XMPP.Stanzas.Message): string | undefined => {
  return xClient?.sendMessage(msg)
}

const containerStyles:  React.CSSProperties = {
  margin: '0',
  width: '90vw',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  border: '1px solid #000',
  borderRadius: '10px',
  padding: '1em',
}

return ( <div style={containerStyles}>
  <ThemeProvider theme={theme}>
  <MUCAllRooms rooms={trimmedRooms} newMessage={newMessage} />  
  <GameStatePanel logout={handleLogout} 
  sendMessage={sendMessage} isGameControl={isGameControl}
  properName={properName} isFeedbackObserver={isFeedbackObserver} newMessage={newMessage}
  showHidden={showHidden} setShowHidden={setShowHidden}
  vCard={vCard} forceDetails={forceDetails} />
  <SimpleDialog dialog={dialog} setDialog={setDialog} dialogTitle={dialogTitle} />
  </ThemeProvider>
</div>
)
}