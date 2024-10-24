// MUCRoom.tsx
import { Card, CardActions, CardContent, CardHeader, Skeleton, Typography } from '@mui/material';
import { ReactElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import * as XMPP from 'stanza';
import { MUCNewMessage } from './MUCNewMessage';
import { FOOTER_MARKER, MUCMessage } from './MUCMessage';
import './MUCMessage.css';
import { PlayerContext, PlayerContextInfo, RoomDetails } from './App';
import { ExtendedAddress } from 'stanza/protocol';

export default interface RoomProps {
  // details of room
  details: RoomDetails
  
  // placeholder for new messages
  newMessage?: XMPP.Stanzas.Message

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
  const {xClient, oldMessages} = useContext(PlayerContext) as PlayerContextInfo

  // const [members, setMembers] = useState<ReactElement>(<span/>);
  const [messages, setMessages] = useState<XMPP.Stanzas.Message[]>([]);
  const [description, setDescription] = useState<string | ReactElement>('')
  const [title, setTitle] = useState<string>('')
  const listRef = useRef(null);
  const [newMessagePending, setNewMessagePending] = useState<boolean>(false)

  // const showMembers = false

  // console.log('room messages', details && details.jid, messages)

  // generate the UI elements for the messages
  const messagesRX = useMemo(() => {
    if (messages && details) {
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
  }, [messages, compact, details])
  
  useEffect(() => {
    if (oldMessages && details) {
      const myMessages = oldMessages.filter(msg => {
        const stanza = msg as XMPP.Stanzas.Message
        const room = stanza.from?.split('/')[0]
        return room === details.jid
      })
      const newMessages: XMPP.Stanzas.Message[] = myMessages.map((msg: XMPP.Stanzas.Forward): XMPP.Stanzas.Message => {
        const asMsg = msg as XMPP.Stanzas.Message
        const fromAddr = asMsg.addresses as ExtendedAddress[]
        const from = fromAddr && fromAddr.length > 0 ? fromAddr[0].jid : ''
        return {
          to: asMsg.to,
          from: from,
          id: asMsg.id,
          lang: asMsg.lang,
          type: asMsg.type,
          body: asMsg.body,
          delay: asMsg.delay
        }
      })
      setMessages(newMessages)
    }
  }, [oldMessages, details])
  
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
      const theRoom = newMessage.from?.split('/')[0]
      if (details && theRoom === details.jid) {
        // check we don't already have this message
        // console.log('last one?', messages[messages.length - 1]?.message?.id, newMessage.message?.id)
        const found = messages && messages.find((msg) => msg.id === newMessage.id)
        if (!found) {
          const newMessages = (messages === null) ? [newMessage] : [...messages, newMessage]
          setMessages(newMessages)
          setNewMessagePending(true)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, details])

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
