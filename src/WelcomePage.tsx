// MUCRoom.tsx
import { Button, ButtonGroup, FormControl, Link, TextField, Typography } from '@mui/material'
import './WelcomePage.css'
import { useEffect, useState } from 'react'
import { WargameList } from './WargameList'
import logo from './war-room.png'
import CogIcon from '@mui/icons-material/Engineering'

export default interface WargameListProps {
  wargames: string[]
  handleLogin: (wargame: string, username: string, password: string) => void
  welcomeTitle?: string
  welcomeMsg?: string
}

export const WelcomePage: React.FC<WargameListProps> = ({ wargames, handleLogin, welcomeTitle, welcomeMsg }: WargameListProps) => {
  const [selectedWargame, setSelectedWargame] = useState<string>('')
  const [username, setUsername] = useState<string>('blue-co')
  const [password, setPassword] = useState<string>('pwd')
  const [loginDisabled, setLoginDisabled] = useState<boolean>(true)
  const [loginVisible, setLoginVisible] = useState<boolean>(false)

  // get members
  useEffect(() => {
    setLoginDisabled(selectedWargame === '' || username === '' || password === '')
   }, [selectedWargame, username, password])

     // get members
  useEffect(() => {
    setLoginVisible(selectedWargame !== '')
   }, [selectedWargame])

   const logoStyle: React.CSSProperties = {
    width: '300px',
    height: '300px',
    marginTop: '50px',
    marginRight: '50px',
    float: 'left'
   }

  return ( 
   <>
   <img style={logoStyle} src={logo} alt='war-room' />
   <div style={{width:'400px', float:'right'}}>
     <h2>{welcomeTitle || 'Welcome to War-Rooms'}</h2>
     <h4>{welcomeMsg || 'Sub-title'}</h4>
     <ButtonGroup orientation='horizontal' color='primary' aria-label='outlined primary button group'>
       <Button variant='text' onClick={() => handleLogin('localhost', 'admin', 'elwood')}>Admin</Button>
       <Button variant='text' onClick={() => handleLogin('localhost', 'blue-co', 'pwd')}>Blue CO</Button>
       <Button variant='text' onClick={() => handleLogin('localhost', 'red-co', 'pwd')}>Red CO</Button>
     </ButtonGroup>
     <ButtonGroup orientation='horizontal' color='primary' aria-label='outlined primary button group'>
       <Button variant='contained'>
        <Link style={{color: '#fff'}} href='\'>
          <CogIcon/>
        </Link>
       </Button>
     </ButtonGroup>
     <div id='wargame-panel' className='form-group'>
       <WargameList wargames={wargames} selectedWargame={selectedWargame} setSelectedWargame={setSelectedWargame} />
     </div>
     <div id='login-panel' className='form-group' style={{visibility: loginVisible ? 'visible' : 'hidden'}}>
        <FormControl>
          <Typography style={{textAlign:'left', marginBottom:'10px'}}>Login to {selectedWargame}:</Typography>
          <TextField required fullWidth label='Username (bob)' value={username} onChange={(event) => setUsername(event.target.value)}/>
          <TextField required fullWidth label='Password (secret)' type='password' value={password} 
            onChange={(event) => setPassword(event.target.value)} margin='normal' />  
          <Button variant='contained' type='submit' disabled={loginDisabled} 
            onClick={() => handleLogin(selectedWargame, username, password)}>Login</Button>
        </FormControl>
      </div>
    </div>
   </> 
  )
}
