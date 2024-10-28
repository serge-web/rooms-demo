// MUCMessage.tsx
import { Box, Button, ButtonGroup, Card, CardHeader, Tab, Tabs, Tooltip, Typography  } from '@mui/material';
import './GameStatePanel.css';
import { GameState, ForceDetails, ThemeDetails } from './Game';
import * as XMPP from 'stanza';
import { useState, useEffect, ReactElement, SyntheticEvent, useContext } from 'react';
import { MUCRoom } from './MUCRoom';
import { TextInputDialog } from './TextInputDialog';
import ChatIcon from '@mui/icons-material/Chat';
import Groups2Icon from '@mui/icons-material/Groups2';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import React from 'react';
import Person3Icon from '@mui/icons-material/Person3';
import { ADMIN_CHANNEL, FEEDBACK_CHANNEL, GAME_STATE_NODE, GAME_THEME_NODE, ROOMS_THEME_NODE } from './Constants';
import { GameContext, PlayerContext, PlayerContextInfo, RoomDetails } from './App';
import { JSONItem, PubsubSubscription, PubsubSubscriptions } from 'stanza/protocol';
import { NS_JSON_0 } from 'stanza/Namespaces';
import { createNodeIfNecessaryThenPublish } from './helpers/createThenPublishNode';
import { subscribeIfNecessary } from './helpers/subscribeIfNecessary';

export default interface GameStateProps {
  logout: () => void
  sendMessage: (msg: XMPP.Stanzas.Message) => void
  showHidden: boolean
  setShowHidden: (show: boolean) => void
  isGameControl: boolean
  isFeedbackObserver: boolean
  properName: string
  newMessage: XMPP.Stanzas.Forward | undefined
  forceDetails: ForceDetails | null
  vCard: XMPP.Stanzas.VCardTemp | undefined | null
}

export const GameStatePanel: React.FC<GameStateProps> = ({ logout, sendMessage, showHidden, setShowHidden,  properName, isFeedbackObserver, isGameControl, newMessage, forceDetails, vCard
 }: GameStateProps) => {
  const {fullJid, domain, myRooms, xClient, pubJid} = useContext(PlayerContext) as PlayerContextInfo
  const gameState = useContext(GameContext) as GameState

  const [adminDetails, setAdminDetails] = useState<RoomDetails | undefined>(undefined);
  const [feedbackDetails, setFeedbackDetails] = useState<RoomDetails | undefined>(undefined);

  const [gameTime, setGameTime] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [userIcon, setUserIcon] = useState<ReactElement>(<></>) 
  const [objectivesIcon, setObjectivesIcon] = useState<ReactElement>(<></>)

  useEffect(() => {
    if (gameState) {
      const date = gameState.gameTime
      const dateStr = new Date(date).toLocaleString('en-GB', {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'})
      setGameTime(dateStr)
    } else {
      setGameTime('===')
    }
  }, [gameState])

  useEffect(() => {
    if (myRooms) {
      setAdminDetails(myRooms.find((room) => room.jid.startsWith('_admin')))
      setFeedbackDetails(myRooms.find((room) => room.jid.startsWith('_feedback')))
    }
  }, [myRooms])

  useEffect(() => {
    if (forceDetails) {
      if (forceDetails.icon) {
        const icon = () => {
          const iconStyle: React.CSSProperties = {
            color: forceDetails.color || '#333'
          }
          return <Person3Icon style={iconStyle}/>
        }
        setUserIcon(icon)
      }

      if (forceDetails.objective) {
        setObjectivesIcon(<Tooltip title={forceDetails.objective}>
          <AdsClickIcon />
        </Tooltip>)
      } else {
        setObjectivesIcon(<></>)
      }
    }
  }, [forceDetails])

  const stepForward = () => {
    if (xClient) {
      console.clear()

      let newState: GameState
      if(gameState){
        const time = new Date(gameState.gameTime)
        // increment time by one hour
        time.setHours(time.getHours() + 1)
        newState = {...gameState,
          gameTime:  time.toISOString(), 
          gameTurn: gameState.gameTurn + 1}
  
      } else {
        newState = {
          type: 'GameState',
          gameTurn: 1,
          gameTime: '2024-08-20T14:00:00Z',
          gameTimeStep: '1 hour'
        }
      }
          
      const stateJSON = JSON.stringify(newState)
      const jsonItem: JSONItem = { 
        itemType: NS_JSON_0,
        json: stateJSON
      }
  
      createNodeIfNecessaryThenPublish(xClient, pubJid, GAME_STATE_NODE, 'Game state', 
        jsonItem, true).catch((err: unknown) => {
        console.error('Error publishing game state', err, !!subscribeIfNecessary)
      })
    }
  }


  // const gameStateStyle: React.CSSProperties = {
  //   backgroundColor: '#e0e0e0',
  //   width: '300px'
  // }

    
  const submitFeedback = (value: string | null) => {
    setShowFeedback(false)  
    if (value != null) {
      const msg: XMPP.Stanzas.Message = {
        to: '_feedback@group.' + domain,
        type: 'groupchat',
        body: value,
        from: fullJid
      }
      sendMessage(msg)
      // console.log('Sent message', msg, res)
    }
  }  

  const handleTabChange = (_event: SyntheticEvent<Element, Event>, newValue: number) => {
    setCurrentTab(newValue)
  }  

  const tabStyle: React.CSSProperties = {
    minHeight: '40px'
  }

  const doUnsubscribe = (): void => {
    console.clear()
    if (!xClient) 
      return

    // clear subscriptions
    const opts = {
    }
    xClient.getSubscriptions(pubJid, opts).then((subs:PubsubSubscriptions) => {
      console.log('got subscriptions', subs)
      const doUnsub = (xClient && subs.items && subs.items.length) ? subs.items.map((item: PubsubSubscription) => {
        const opts: XMPP.PubsubUnsubscribeOptions = {
          subid: (item as PubsubSubscription).subid as string,
          node: item.node as string
        }
        return xClient.unsubscribeFromNode(pubJid, opts)
      }) : []
      Promise.all(doUnsub).then((res) => {
        console.log('unsubscribed', res)
      }).catch((err: unknown) => {
        console.error('Error unsubscribing', err)
      })
    })
  }

  const tmpSendMessage = (): void => {
    console.log('', !!GAME_THEME_NODE, !!GAME_STATE_NODE)
    console.clear()


    // xClient.getDefaultNodeConfig(pubJid || '').then((items) => {
    //   console.log('Got disco', items, jid)   
    //  })

    // console.log('about to get item', jid, GAME_STATE_NODE)
    // xClient.getNodeAffiliations(jid, GAME_STATE_NODE).then((item) => {
    //   console.log('got item', item)
    // }).catch((err: unknown) => {
    //   console.error('Error getting game state', err)
    // })

    // xClient.getVCard(jid).then((vCard) => {
    //   console.log('Got vCard', vCard)
    //   const org: VCardTempOrg = {
    //     value: 'red',
    //     type: 'organization'
    //   }
    //   vCard.records = []
    //   vCard.records.push(org)
    //   xClient.publishVCard(vCard).then((res) => {
    //     console.log('Set vCard', res)
    //   }).catch((err: unknown) => {
    //     console.error('Error setting vCard', err)
    //   })
    //  }).catch((err: unknown) => {
    //   console.error('Error getting vCard', err)
    // })

    // xClient.getDefaultSubscriptionOptions(pubJid).then((items) => {
    //   console.log('Got disco', items, jid, !!subscribeIfNecessary)
    // })

    // subscribeIfNecessary(xClient, pubJid, GAME_STATE_NODE, jid)

    // console.log('about to get item', jid, GAME_STATE_NODE, !!pubJid)
    // xClient.getNodeConfig(pubJid, GAME_STATE_NODE).then((info) => {
    //   console.log('info', info)
    // }).then(() => {
    //   console.log('about to get items')
    //   xClient.getNodeSubscribers(pubJid, GAME_STATE_NODE).then((subscribers) => {
    //     console.log('subscribers', subscribers)
    //   }).catch((err: unknown) => {
    //     console.error('Error getting game state', err)
    //   })

      // xClient.getItems(pubJid, GAME_STATE_NODE).then((item) => {
      //   console.log('got items', item)
      // }).catch((err: unknown) => {
      //   console.error('Error getting game state', err)
      // })
    // })

      // xClient.subscribeToNode(pubJid, GAME_STATE_NODE).then((res) => { 
      //   console.log('Subscribed to game state', res)
      // }).catch((err: unknown) => {
      //   console.log('Failed to subscribe to game state', err)
      // })

    // const mockGameState: GameState = {
    //   type: 'GameState',
    //   gameTurn: 1,
    //   gameTime: '2024-08-20T16:00:00Z',
    //   gameTimeStep: '1 hour'
    // }
    // const stateJSON = JSON.stringify(mockGameState)
    // const jsonItem: JSONItem = { 
    //   itemType: NS_JSON_0,
    //   json: stateJSON
    // }
    // console.log('about to publish game state', jid, GAME_STATE_NODE, jsonItem, pubJid)
    // xClient.publish(pubJid, GAME_STATE_NODE, jsonItem).catch((err: unknown) => {
    //   console.error('Error publishing game state 2', err)
    // })

    const theme: ThemeDetails = {
      type: 'Theme',
      data: {
        palette: {
          primary: {
            main: "#fa2461"
          },
          secondary: {
            main: "#494c7d"
          }
        },
        typography: {
          fontFamily: 'Georgia',
        }
      }
    }
    // const blueForce: ForceDetails = {
    //   type: FORCE_DETAILS,
    //   id: 'blue',
    //   name: 'Blue Force',
    //   color: '#0000ff',
    //   objective: 'Capture the flag'
    // }

    const themeJSON = JSON.stringify(theme)
    const jsonItem: JSONItem = { 
      itemType: NS_JSON_0,
      json: themeJSON
    }
    createNodeIfNecessaryThenPublish(xClient, pubJid, ROOMS_THEME_NODE, 'Rooms Theme', 
      jsonItem, true).catch((err: unknown) => {
      console.error('Error publishing game state', err, !!subscribeIfNecessary)
    })
//    console.log('about to publish theme state', jid, FORCE_NODE + 'blue', jsonItem, pubJid)

    // xClient.publish(pubJid, GAME_THEME_NODE, jsonItem).catch((err: unknown) => {
    //   console.error('Error publishing game theme 2', err)
    // })

   
    // createNodeIfNecessary(xClient, pubJid, FORCE_NODE + 'blue', 'Blue force')



    // xClient.getNodeConfig(pubJid, GAME_STATE_NODE).then((res) => {
    //   console.log('node config', res)
    // }).catch((err: unknown) => {
    //   console.error('Error creating game state 2', err)
    // })

    // xClient.deleteNode(pubJid, GAME_STATE_NODE).then((res) => {
    //   console.log('node deleted', res)
    // }).catch((err: unknown) => {
    //   console.error('Error deleting game state 2', err)
    // })


    // const affiliations: PubsubAffiliation[] = [{jid: jid, affiliation: 'owner'}, {jid: 'red-co@localhost', affiliation: 'publisher'}]
    // xClient.updateNodeAffiliations(jid, GAME_STATE_NODE, affiliations).then((res) => {
    //   console.log('Updated affiliations', res)
    // }).catch((err: unknown) => {
    //   console.error('Error updating affiliations', err)
    // })
  }
  
  return (
    <Card className='out-of-game-feed'>
      <CardHeader title={<>{userIcon}<Typography component={'span'}>{properName || fullJid?.split('@')[0]}
        {vCard && vCard.fullName && (' - ' + vCard.fullName)}</Typography>&nbsp;{objectivesIcon}</>} subheader={'T' + gameState?.gameTurn + ' ' + gameTime} />
      <ButtonGroup orientation='horizontal'>
      <Button style={{marginRight:'10px'}}  variant='contained' onClick={() => logout()}>Logout</Button>
      <Button variant='contained' onClick={() => setShowFeedback(true)}>Feedback</Button>
      <Button variant='contained' onClick={() => { tmpSendMessage() }}>[debug]]</Button>
      <Button variant='contained' onClick={() => { doUnsubscribe() }}>[unsub]]</Button>
      </ButtonGroup>
      { isGameControl && <ButtonGroup style={{marginTop:'10px'}}>
        <Button style={{marginRight:'10px'}} variant='contained' onClick={() => stepForward()}>Step</Button>
        <Button variant={showHidden ? 'contained' : 'outlined'} onClick={() => setShowHidden(!showHidden)}>Hidden Rooms</Button>
        </ButtonGroup>
      }
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
    <Tabs style={{paddingTop:'10px'}} variant='fullWidth' value={currentTab} onChange={handleTabChange} aria-label='basic tabs example'>
    <Tab style={tabStyle} icon={<Groups2Icon/>} iconPosition='start'  label='Admin'  />
    {isFeedbackObserver && <Tab style={tabStyle} icon={<ChatIcon/>} iconPosition='start' label='Feedback' />}
  </Tabs>
    <MUCRoom visible={currentTab === 0} compact height='calc(100vh - 268px)' newMessage={newMessage} key={ADMIN_CHANNEL} details={adminDetails as RoomDetails} />
    {isFeedbackObserver && feedbackDetails && <MUCRoom visible={currentTab === 1} showSendButton={false} compact height='260px' newMessage={newMessage} key={FEEDBACK_CHANNEL} details={feedbackDetails}/>}
  <TextInputDialog open={showFeedback} icon={<ChatIcon/>} title='Feedback' guidance='Please enter feedback' setter={submitFeedback}  />
</Box>
    </Card>
  )
}
