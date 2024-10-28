// Login.tsx
import * as XMPP from 'stanza';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './Login.css';
import { GameStatePanel } from './GameStatePanel';
import { FLAG_IS_FEEDBACK_OBSERVER, FLAG_IS_GAME_CONTROL, FORCE_DETAILS, FORCE_NODE, GAME_STATE, GAME_STATE_NODE, GAME_THEME_NODE, THEME } from './Constants'
import { SimpleDialog } from './SimpleDialog';
import { MUCAllRooms } from './MUCAllRooms';
import { PlayerContext, PlayerContextInfo, RoomDetails } from './App';
import { Theme, ThemeOptions, ThemeProvider } from '@mui/material';

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
  setGameState: {(state: GameState): void}
  setThemeOptions: {(theme: ThemeOptions): void}
  setOldMessages: {(messages: XMPP.Stanzas.Forward[]): void}
  baseTheme: Theme
}

const onlyLastForce = (forces: ForceDetails[]): ForceDetails[] => {
  const map: {[index: string]: ForceDetails} = {}
  forces.forEach((item: ForceDetails) =>{
    map[ item.id ] = item;
  })
  return Object.keys( map ).map( function(key){
    return map[key];
  })
}

export const Game: React.FC<GameProps> = ({ setPlayerState, setGameState, setThemeOptions, setOldMessages, baseTheme }: GameProps) => {
  const {xClient, myRooms, oldMessages, roomsTheme, stanzaMgr, vCard
   } = useContext(PlayerContext) as PlayerContextInfo
  const [trimmedRooms, setTrimmedRooms] = useState<RoomDetails[]>([]);
  const [newMessage, setNewMessage] = useState<XMPP.Stanzas.Forward | undefined>();
  const [showHidden, setShowHidden] = useState(false);
  const [isGameControl, setIsGameControl] = useState<boolean>(false);
  const [isFeedbackObserver, setIsFeedbackObserver] = useState<boolean>(false);
  const [properName, setProperName] = useState<string>('');
  
  const [forceId, setForceId] = useState<string>('');
  const [force, setForce] = useState<ForceDetails | null>(null);

  const [dialog, setDialog] = useState<string | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  
  const [pendingOldMessages] = useState<XMPP.Stanzas.Forward[]>([])

  // TODO: this flag prevents us setting up the client multiple times
  // it would be better to not have the issue
  const clientDone = useRef<boolean>();

  const storeOldMessage = useCallback((msg: XMPP.Stanzas.Forward | null) => {
    if (msg) {
      pendingOldMessages.push(msg)  
    } else {
      console.log('old messages done', pendingOldMessages.length)
      setOldMessages(pendingOldMessages)
    }
    // setOldMessages([...oldMessages, msg])
  }, [pendingOldMessages, setOldMessages])

  // post-login steps
  useEffect(() => {
    if (xClient && clientDone.current === undefined) {
      clientDone.current = true

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

      let timeout: NodeJS.Timeout

      // listen for incoming messages
      xClient.on('groupchat', (msg: XMPP.Stanzas.ReceivedMessage) => {
        const message: XMPP.Stanzas.Message = msg as XMPP.Stanzas.Message
        if (message.delay) {
          // const source = message.stanzaIds && message.stanzaIds.length && message.stanzaIds[0].by || message.from
          // console.log('ignoring legacy message', source, msg, msg.delay?.timestamp)
          storeOldMessage(message)
          if(timeout) {
            clearTimeout(timeout)
          }
          timeout = setTimeout(() => {
            storeOldMessage(null)
          }, 500)
          // setOldMessages([...oldMessages, message])
        } else {
          // old messages done, drop the array
          console.log('EV: group chat', msg)
          // wrap message in a Forward stanza, so it has a delay
          const withTimeStamp = {...message, delay: {timestamp: new Date()}}
          setNewMessage(withTimeStamp)
        }
      });
      
      xClient.on('bosh:terminate', (direction, data) => {
        console.log('bosh:terminate: logging out', direction, 'data:', data, !!force)
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
      
      xClient?.on('muc:join', () => {
        // console.log('new MUC join', muc)
      });

      xClient?.on('muc:topic', () => {
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

      // xClient.on('muc:leave', () => {
      //   // console.log('new MUC leave', muc)
      // });
      
      xClient.on('muc:error', (muc) => {
        console.log('new MUC error', muc)
      });

      // request carbons
      xClient.enableCarbons().then(() => {
        // console.log('carbons enabled')
      }).catch((err: unknown) => {
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
  if (stanzaMgr) {
    stanzaMgr.subscribeToNode(GAME_STATE_NODE, (msg) => {
      const gameState = msg as GameState
      setGameState(gameState)
    })

    stanzaMgr.subscribeToNode(GAME_THEME_NODE, (msg) => {
      const gameTheme = msg as ThemeOptions
      setThemeOptions(gameTheme)
    })
  }
}, [stanzaMgr, setGameState, setThemeOptions])

// update user flags from vCard categories
useEffect(() => {
  if (vCard !== undefined) {
    if ((vCard !== null)) {
      // start off with categories
      const records = vCard.records
      const categoryRecords = records?.find((record) => record.type === 'categories')
      if (categoryRecords) {
        const records = categoryRecords as XMPP.Stanzas.VCardTempCategories
        const categories = records.value
        if (categories) {
          setIsGameControl(categories.includes(FLAG_IS_GAME_CONTROL))
          setIsFeedbackObserver(categories.includes(FLAG_IS_FEEDBACK_OBSERVER))
        }
      }

      // now the organisation (force)
      const organizationRecords = records?.find((record) => record.type === 'organization')
      if (organizationRecords) {
        const org = organizationRecords as XMPP.Stanzas.VCardTempOrg
        const orgName = org.value
        if (orgName) {
          setForceId(orgName)
        }
      }
      
      // now the name
      if (vCard.fullName) {
        setProperName(vCard.fullName)
      }  
    } else {
      setIsGameControl(false)
      setProperName('')
    }
  }
}, [vCard])

/** try to get my force details */
useEffect(() => {
  if (forceId && stanzaMgr) {
    stanzaMgr.subscribeToNode(FORCE_NODE + forceId, (msg) => {
      const forceDetails = msg as ForceDetails
      setForce(forceDetails)
    })  
  }
}, [forceId, stanzaMgr, setForce])

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
        stanzaMgr.joinRoom(room.jid)
      }  
    })
    // console.log('trimmed rooms', trimmed, showHidden)
    setTrimmedRooms(trimmed)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [myRooms, showHidden])

const handleLogout = useCallback(() => {
  console.clear()
  // leave rooms
    if (xClient && myRooms !== null) {
      const rooms = myRooms.map(room => stanzaMgr.leaveRoom(room.jid || 'unknown'))
      Promise.all(rooms).then(() => {
        return stanzaMgr?.unsubscribeAll()
        }).catch((err: {pubsub: {unsubscribe: { node: string}}}) => {
          console.log('unsub err', err)
          console.log('trouble unsubscribing from node', err.pubsub.unsubscribe.node, err)
        }).finally(() => {
          stanzaMgr.disconnect()
          setPlayerState(null)
      })
    }
}, [myRooms, xClient, stanzaMgr, setPlayerState])

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
  <ThemeProvider theme={roomsTheme || baseTheme}>
    <MUCAllRooms rooms={trimmedRooms} newMessage={newMessage} oldMessages={oldMessages} />  
  </ThemeProvider>
  <GameStatePanel logout={handleLogout} 
  sendMessage={sendMessage} isGameControl={isGameControl}
  properName={properName} isFeedbackObserver={isFeedbackObserver} newMessage={newMessage}
  showHidden={showHidden} setShowHidden={setShowHidden}
  vCard={vCard} forceDetails={force} />
  <SimpleDialog dialog={dialog} setDialog={setDialog} dialogTitle={dialogTitle} />
</div>
)
}