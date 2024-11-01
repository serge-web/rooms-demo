import { createContext, useCallback, useState } from 'react'
import { Theme, ThemeOptions, ThemeProvider, createTheme } from '@mui/material/styles'
import './App.css'
import Login from './Login'
import  { Game, GameState } from './Game'
import * as XMPP from 'stanza'
import { StanzaManager } from './helpers/StanzaManager'
import { AdminApp } from './admin/AdminApp'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export interface RoomDetails {
  jid: string
  name: string
  description: string
}

export interface PlayerContextInfo {
  domain: string
  fullJid: string
  vCard: XMPP.Stanzas.VCardTemp | undefined
  jid: string
  resourceName: string
  xClient: XMPP.Agent
  pubJid: string
  mucJid: string
  myRooms: RoomDetails[]
  oldMessages: XMPP.Stanzas.Forward[]
  roomsTheme: Theme | undefined
  stanzaMgr: StanzaManager
}

export const PlayerContext = createContext<PlayerContextInfo | null>(null)

export const GameContext = createContext<GameState | null>(null)

const baseTheme: Theme = createTheme({
  palette: {
    primary: {
      main: '#1a2461'
    },
    secondary: {
      main: '#494c7d'
    }
  }
})

function App() {
  
  const [playerState, setPlayerState] = useState<PlayerContextInfo | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)
  
  const welcomeTitle = 'War Rooms'
  const welcomeMessage = 'Welcome to the wargame'
  
  
  const setThemeOptions = (options: ThemeOptions) => {
    const theme = createTheme(options)
    setTheme(theme)
  }
  
  const setOldMessages = useCallback((oldMessages: XMPP.Stanzas.Forward[]) => {
    if (playerState) {
      const newState = {...playerState, oldMessages} as PlayerContextInfo
      setPlayerState(newState)
    }
  }, [playerState])
  
  const updateGameState = useCallback((newGameState: GameState) => {
    const existingJSON = JSON.stringify(gameState)
    const newJSON = JSON.stringify(newGameState)
    if (existingJSON !== newJSON) {
      setGameState(newGameState)
    }
  }, [gameState])
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={<AdminApp />} />
        <Route path='/app' element={
          <ThemeProvider theme={theme || baseTheme}>
          { playerState && <PlayerContext.Provider value={playerState}>
          <GameContext.Provider value={gameState}>
          <Game setPlayerState={setPlayerState} setGameState={updateGameState} baseTheme={theme ?? baseTheme}
          setThemeOptions={setThemeOptions} setOldMessages={setOldMessages} />
          </GameContext.Provider>
          </PlayerContext.Provider> }
          { !playerState && <Login showAdmin={() => console.log('open admin')} welcomeTitle={welcomeTitle} setThemeOptions={setThemeOptions} setPlayerState={setPlayerState}
          welcomeMsg={welcomeMessage} /> }  
          </ThemeProvider>
        } />
      </Routes>
    </BrowserRouter>
    
  )  
}

export default App
