import { createContext, useCallback, useState } from 'react';
import { Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import './App.css'
import Login from './Login'
import  { Game, GameState } from './Game'
import * as XMPP from 'stanza';

export interface RoomDetails {
  jid: string
  name: string
  description: string
}

export interface PlayerContextInfo {
  domain: string
  fullJid: string
  jid: string
  resourceName: string
  xClient: XMPP.Agent
  pubJid: string
  mucJid: string
  myRooms: RoomDetails[]
  gameState: GameState | null
}

export const PlayerContext = createContext<PlayerContextInfo | null>(null)

const baseTheme: Theme = createTheme({
  palette: {
    primary: {
      main: "#1a2461"
    },
    secondary: {
      main: "#494c7d"
    }
  }
});


function App() {

  const [playerState, setPlayerState] = useState<PlayerContextInfo | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)

  const welcomeTitle = 'War Rooms'
  const welcomeMessage = 'Welcome to the wargame'


  const setThemeOptions = (options: ThemeOptions) => {
    const theme = createTheme(options)
    setTheme(theme)
  }

  const setGameState = useCallback((gameState: GameState) => {
    const existingGameState = playerState?.gameState
    const existingJSON = JSON.stringify(existingGameState)
    const newJSON = JSON.stringify(gameState)
    if (existingJSON !== newJSON) {
      const newState = {...playerState, gameState} as PlayerContextInfo
      setPlayerState(newState)
    }
  }, [playerState]);

  return (
    <ThemeProvider theme={theme || baseTheme}>
      { playerState && <PlayerContext.Provider value={playerState}>
              <Game setPlayerState={setPlayerState} setGameState={setGameState} 
                parentTheme={theme ?? baseTheme} setThemeOptions={setThemeOptions}  />
            </PlayerContext.Provider> }
      { !playerState && <Login welcomeTitle={welcomeTitle} setThemeOptions={setThemeOptions} setPlayerState={setPlayerState}
      welcomeMsg={welcomeMessage} /> }    
    </ThemeProvider>
  )  
}

export default App
