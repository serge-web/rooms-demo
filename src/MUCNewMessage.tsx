// MUCRoom.tsx
import { Button,  } from '@mui/material';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import './MUCNewMessage.css';

export default interface NewMessageProps {
  sendMessage: (content: string) => void
  visible?: boolean
}

export const MUCNewMessage: React.FC<NewMessageProps> = ({ sendMessage, visible=true }: NewMessageProps) => {
  const [content, setContent] = useState<string>('');

  const localSendMessage = (content: string):void => {
    sendMessage(content)
    // clear the text box
    setContent('')
  }
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(content)
    setContent('')
  }

  return (
    <>{visible && <form onSubmit={handleSubmit} className='flexbox-container'>
      <input type='text' value={content} id='content' onChange={(event) => setContent(event.target.value)} />
      <Button style={{float: 'left'}} onClick={() => localSendMessage(content)}><SendIcon/></Button>
    </form> 
    }</>)
}
