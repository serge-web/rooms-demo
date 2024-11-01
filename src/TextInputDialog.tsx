// MUCMessage.tsx
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import './TextInputDialog.css'
import { useState } from 'react'

export default interface MessageProps {
  title: string
  guidance: string
  setter: (value: string | null) => void
  multiline?: boolean
  icon?: React.ReactElement
  open: boolean
}

export const TextInputDialog: React.FC<MessageProps> = ({ title, guidance, setter, multiline=true, icon, open }: MessageProps) => {
  const [text, setText] = useState<string>('')
  const cancel = () => {
    setText('')
    setter(null)
  }
  return (
    <Dialog
    open={open}
    onClose={() => cancel()}  >
    <DialogTitle>{icon} &nbsp;{title}</DialogTitle>
    <DialogContent>
      <TextField style={{width:'300px'}} autoFocus required label={guidance} fullWidth className='textfield' multiline={multiline} type='text' value={text} onChange={e => setText(e.target.value)} variant='standard' />
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' onClick={() => cancel()}>Cancel</Button>
      <Button style={{marginRight:'20px'}} variant='contained' onClick={() => setter(text)}>Submit</Button>
    </DialogActions>
  </Dialog>
  )
}
