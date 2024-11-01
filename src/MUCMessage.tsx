// MUCMessage.tsx
import { Card, CardActions, CardContent, Paper, Typography } from '@mui/material'
import './MUCMessage.css'
import * as XMPP from 'stanza'
import { useState, useEffect } from 'react'
import moment from 'moment'
export default interface MessageProps {
  message: XMPP.Stanzas.Message
  compact?: boolean
}

export const FOOTER_MARKER = 'footer'

export const MUCMessage: React.FC<MessageProps> = ({ message, compact=false }: MessageProps) => {
  const [body, setBody] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [timestamp, setTimestamp] = useState<string>('')
  const [hoverText, setHoverText] = useState<string>('')

  // get members
  useEffect(() => {
    const bodyText = message.body || ''
    const limit = 30
    if (bodyText.length > limit) {
      setBody(bodyText.substring(0, limit) + '...')
      setHoverText(bodyText)
    } else {
      setBody(bodyText)
    } 
    setFrom(message.from?.split('@')[0] || message.muc?.jid?.split('@')[0] || '')
    if (message.delay) {
      setTimestamp(moment(message.delay.timestamp).fromNow())
    } else {
      setTimestamp('--')
    }
  }, [message])

  const dateFormat: React.CSSProperties = {
    fontStyle: 'italic',
    fontSize: 'small',
    textAlign: 'right',
    width: '100%'
  }

  const fromFormat: React.CSSProperties = {
    fontStyle: 'normal'
  }

  const compactDateFormat: React.CSSProperties = { ... dateFormat, float: 'right',
    width: '40%'
  }

  const compactFromFormat: React.CSSProperties = { ... fromFormat, float: 'left',
    width: '40%', textAlign: 'left'
  }

  if (compact) {
    return (
      <Card variant='outlined'>
        <CardContent style={{padding:'5px'}}>
          <Typography title={hoverText}>
            {body}
          </Typography>
          <Typography style={compactFromFormat} sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            {from}
          </Typography>
          <Typography className={FOOTER_MARKER} style={compactDateFormat} sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            {timestamp}
          </Typography>
        </CardContent>
      </Card>
    )
  } else {
    return (
      <Paper variant='outlined'>
        <Card variant='outlined' title={hoverText}>
          <Typography style={fromFormat} sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            {from}
          </Typography>
          {body}
          <CardActions>
            <Typography style={dateFormat} className={FOOTER_MARKER}>
              {timestamp}
            </Typography>
          </CardActions>
        </Card>
      </Paper>
    )
  }
}
