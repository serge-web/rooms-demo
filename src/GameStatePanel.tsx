// MUCMessage.tsx
import { Box, Button, ButtonGroup, Card, CardHeader, Tab, Tabs, Tooltip, Typography  } from '@mui/material';
import './GameStatePanel.css';
import { GameState, ForceDetails } from './Game';
import * as XMPP from 'stanza';
import { useState, useEffect, ReactElement, SyntheticEvent, useContext } from 'react';
import { MUCRoom } from './MUCRoom';
import { TextInputDialog } from './TextInputDialog';
import ChatIcon from '@mui/icons-material/Chat';
import Groups2Icon from '@mui/icons-material/Groups2';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import React from 'react';
import Person3Icon from '@mui/icons-material/Person3';
import { ADMIN_CHANNEL, FEEDBACK_CHANNEL, GAME_STATE_NODE, GAME_THEME_NODE } from './Constants';
import { PlayerContext, PlayerContextInfo, RoomDetails } from './App';
import { JSONItem, PubsubSubscription, PubsubSubscriptions } from 'stanza/protocol';
import { NS_JSON_0 } from 'stanza/Namespaces';
import { createNodeIfNecessary } from './helpers/configNode';
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
  forceDetails: ForceDetails[] | undefined
  vCard: XMPP.Stanzas.VCardTemp | undefined | null
}

export const GameStatePanel: React.FC<GameStateProps> = ({ logout, sendMessage, showHidden, setShowHidden,  properName, isFeedbackObserver, isGameControl, newMessage, forceDetails, vCard
 }: GameStateProps) => {
  const {fullJid, domain, myRooms, jid, xClient, gameState, pubJid} = useContext(PlayerContext) as PlayerContextInfo

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
    if (vCard && forceDetails) {
      const org = vCard.records?.find((record) => record.type === 'organization')
      if (org && org.value) {
        const thisForce = forceDetails.find((force) => force.id === org.value)
        if (thisForce) {
          const icon = () => {
            const iconStyle: React.CSSProperties = {
              color: thisForce?.color || '#333'
            }
            return <Person3Icon style={iconStyle}/>
          }
          setUserIcon(icon)

          if (thisForce && thisForce.objective) {
            setObjectivesIcon(<Tooltip title={thisForce.objective}>
              <AdsClickIcon />
            </Tooltip>)
          } else {
            setObjectivesIcon(<></>)
          }

        }
      }
    }
  }, [vCard, forceDetails])

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
  
      createNodeIfNecessary(xClient, pubJid, GAME_STATE_NODE, 'Game state').then(() => {
        xClient.publish(jid, GAME_STATE_NODE, jsonItem).catch((err: unknown) => {
          console.error('Error publishing game state', err, !!subscribeIfNecessary)
        })
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

  const doUnsubscribe = () => {
    console.clear()
    // clear subscriptions
    const opts = {
    }
    xClient.getSubscriptions(pubJid, opts).then((subs:PubsubSubscriptions) => {
      console.log('got subscriptions', subs)
      const doUnsub = subs.items ? subs.items.map((item: PubsubSubscription) => {
        const opts: XMPP.PubsubUnsubscribeOptions = {
          subid: item.subid,
          node: item.node
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

  const tmpSendMessage = () => {
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

    xClient.getVCard(jid).then((vCard) => {
      console.log('Got vCard', vCard)
      // if (vCard.records) {
      //   const categories = vCard.records.find((record) => record.type === 'categories')
      //   if (categories) {
      //     categories.value.push(FLAG_IS_FEEDBACK_OBSERVER)
      //   }
      //   xClient.publishVCard(vCard).then((res) => {
      //     console.log('Set vCard', res)
      //   })
      // }
    }).catch((err: unknown) => {
      console.error('Error getting vCard', err)
    }).finally(() => {
      console.log('finally')
    })

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

    // const theme: ThemeDetails = {
    //   type: 'Theme',
    //   data: {
    //     palette: {
    //       primary: {
    //         main: "#9a2461"
    //       },
    //       secondary: {
    //         main: "#494c7d"
    //       }
    //     }
    //   }
    // }

    // const themeJSON = JSON.stringify(theme)
    // const jsonItem: JSONItem = { 
    //   itemType: NS_JSON_0,
    //   json: themeJSON
    // }
    // console.log('about to publish theme state', jid, GAME_STATE_NODE, jsonItem, pubJid)
    // xClient.publish(pubJid, GAME_STATE_NODE, jsonItem).catch((err: unknown) => {
    //   console.error('Error publishing game theme 2', err)
    // })
    // xClient.publish(pubJid, GAME_THEME_NODE, jsonItem).catch((err: unknown) => {
    //   console.error('Error publishing game theme 2', err)
    // })

   //  createNodeIfNecessary(xClient, pubJid, GAME_STATE_NODE, 'Game state')



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
      <CardHeader title={<>{userIcon}<Typography component={'span'}>{properName || fullJid.split('@')[0]}</Typography>&nbsp;{objectivesIcon}</>} subheader={'T' + gameState?.gameTurn + ' ' + gameTime} />
      <ButtonGroup orientation='horizontal'>
      <Button style={{marginRight:'10px'}}  variant='contained' onClick={() => logout()}>Logout</Button>
      <Button variant='contained' onClick={() => setShowFeedback(true)}>Feedback</Button>
      <Button variant='contained' onClick={() => tmpSendMessage()}>[debug]]</Button>
      <Button variant='contained' onClick={() => doUnsubscribe()}>[unsub]]</Button>
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
