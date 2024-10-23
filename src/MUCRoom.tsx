// MUCRoom.tsx
import { Card, CardActions, CardContent, CardHeader, Skeleton, Typography } from '@mui/material';
import { ReactElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import * as XMPP from 'stanza';
import { MUCNewMessage } from './MUCNewMessage';
import { FOOTER_MARKER, MUCMessage } from './MUCMessage';
import './MUCMessage.css';
import { PlayerContext, PlayerContextInfo, RoomDetails } from './App';

export default interface RoomProps {
  // details of room
  details: RoomDetails
  
  newMessage: XMPP.Stanzas.Forward | undefined

  // height value for the message list
  height?: string

  // optional title icon
  icon?: React.ReactElement

  // whether to display messages in a compact format
  compact?: boolean

  // whether to display the room
  visible?: boolean

  // include send button
  showSendButton?: boolean
}

export const MUCRoom: React.FC<RoomProps> = ({ details, newMessage, height='735px', 
  icon=<MeetingRoomIcon/>, compact, visible=true, showSendButton = true }: RoomProps) => {
  const {xClient} = useContext(PlayerContext) as PlayerContextInfo

  // const [members, setMembers] = useState<ReactElement>(<span/>);
  const [messages, setMessages] = useState<XMPP.Stanzas.Forward[] | null>(null);
  const [description, setDescription] = useState<string | ReactElement>('')
  const [title, setTitle] = useState<string>('')
  const listRef = useRef(null);
  const [newMessagePending, setNewMessagePending] = useState<boolean>(false)

  const historyDone = useRef<boolean>();

  // const showMembers = false

  // console.log('room messages', jid, messages)

  // generate the UI elements for the messages
  const messagesRX = useMemo(() => {
    if (messages) {
      if (messages.length === 0) {
        return <span>Empty</span>
      } else {
        const msgs = messages.map((msg, index) => {
          return <MUCMessage compact={compact} key={index} message={msg} />
        })
        return <span ref={listRef}>{msgs}</span>
      }
    } else {
      return null
    }
  }, [messages, compact])
  
  
  // scroll to the last message
  useEffect(() => {
    if (listRef && listRef.current && (listRef.current as HTMLElement).lastElementChild){
      if (newMessagePending){
        const lastChild = (listRef.current as HTMLElement).lastElementChild
        if (lastChild) {
          const footerEntry = lastChild.querySelector('.' + FOOTER_MARKER)
          if (footerEntry) {
            footerEntry.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
          } else {
            console.log('failed to find footer entry', lastChild, footerEntry)
          }  
        }
        setNewMessagePending(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesRX])
  
  // get members
  useEffect(() => {
    if (newMessage !== undefined) {
      const theRoom = newMessage.message?.from?.split('/')[0]
      if (details && theRoom === details.jid) {
        // check we don't already have this message
        // console.log('last one?', messages[messages.length - 1]?.message?.id, newMessage.message?.id)
        const found = messages && messages.find((msg) => msg.message?.id === newMessage.message?.id)
        if (!found) {
          const newMessages = (messages === null) ? [newMessage] : [...messages, newMessage]
          setMessages(newMessages)
          setNewMessagePending(true)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, details])
  
  // get message history
  useEffect(() => {
    if (xClient && details && details.jid && historyDone.current === undefined) {
      // set flag to say we have been run
      historyDone.current = true

      // retrieve history for this room, if necessary
      const startTime = new Date().getTime()

      // method that we'll call recursively to get all the history
      const getHistory = (jid: string, start: number, entries: XMPP.Stanzas.Forward[]) => {
        // capture the page size and the start index
        // TODO: currently the `count` is being ignored
        const pOpts: Partial<XMPP.MAMQueryOptions> = {
          paging: {count: 10, index: start}
        }
        // const time = new Date().getTime()
        console.log('getting more results', jid, start)
        xClient?.searchHistory(jid, pOpts).then((results) => {
          const msgs:XMPP.Stanzas.Forward[] = results.results?.map((msg) => msg.item as XMPP.Stanzas.Forward) || []
          const numReceived = results.results?.length || 0
          // const elapsedSecs = (new Date().getTime() - time) / 1000
          // console.log('got history after secs', elapsedSecs, jid, start, msgs.length, results)
          entries.push(...msgs)
          // msgs.forEach((msg) => {
          //   // console.log('history entry', msg.delay?.timestamp, msg.message?.id)
          // })
          if (!results.complete) {
            getHistory(jid, start + numReceived, entries)
          } else {
            const elapsedSecs = (new Date().getTime() - startTime) / 1000
            console.log('History received for', jid.split('@')[0] + ' (' + entries.length, 'msgs in', elapsedSecs, 'secs)')
            setMessages(entries)
          }
          return entries
        }).catch((err: unknown) => {
          console.error('getHistory error', jid, err)
        })
      }
      
      // the array that we'll append content into
      const items: XMPP.Stanzas.Forward[] = []
      // start the recursive process
      // console.log('about to get history', jid, !!getHistory, items)
      //if (jid.includes('chat'))
      console.log('Not calling getHistory', !!getHistory, !!items)
      // getHistory(details.jid, 0, items)
    }
  }, [details, xClient])

  // get room description and title
  useEffect(() => {
    if (details) {
      setDescription(<Typography fontStyle={'italic'}>{details.description}</Typography>)
      setTitle(details.name)
    }
  }, [details])
  
  const sendMessage = (content: string) => {
    const msg: XMPP.Stanzas.Message = {
      to: details.jid,
      type: 'groupchat',
      body: content,
      from: xClient?.jid || 'unknown',
      id: new Date().getTime().toString()
    }
    xClient?.sendMessage(msg)
    // console.log('Sent message', msg, res)
  }

  const messageArray = (): React.ReactElement[] => {
    // return array of 4 Skeleton elements
    return [...Array(4)].map((_, index) => {
      return <Skeleton key={index} animation='wave' variant='text' width={200} height={100}/>
  })
}

  return ( 
    <Card style={{display: visible ? 'block' : 'none'}}>
    {title ? !compact && <CardHeader title={<>{icon}&nbsp;{title}</>} subheader={description || 'Room: ' + details.jid?.split('@')[0]} /> : <Skeleton variant='rectangular' height={50} />}
    {/* {showMembers && <Paper style={{height:'50px'}} variant='outlined'>
    Members:{ members }
    </Paper>} */}
    {messagesRX ? 
    <CardContent style={{height:height, overflow: 'auto'}}>{messagesRX}</CardContent> : messageArray()
    }
    <CardActions>
    <MUCNewMessage visible={showSendButton} sendMessage={sendMessage} />
    </CardActions>
    </Card>  
  )
}
