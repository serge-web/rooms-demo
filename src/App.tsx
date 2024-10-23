import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Theme, ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import './App.css'
import Login from './Login'
import  { Game, GameState } from './Game'
import * as XMPP from 'stanza';
import { getAppConfig } from './helpers/getAppTheme';

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
  playerFlags: string[]
  playerForce: string
}


export interface AppConfiguration {
  title: string
  welcomeMessage: string
  theme: ThemeOptions
}

export const PlayerContext = createContext<PlayerContextInfo | null>(null)

const baseTheme: Theme = createTheme({
  palette: {
    primary: {
      main: "#9a2461"
    },
    secondary: {
      main: "#494c7d"
    }
  }
});


function App() {

  const [playerState, setPlayerState] = useState<PlayerContextInfo | null>(null)
  const [config, setConfig] = useState<AppConfiguration | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)

  const clientDone = useRef<boolean>(false);

  const storeConfig = (newConfig: AppConfiguration | null) => {
    if (newConfig) {
      setConfig(newConfig)
    }
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


  useEffect(() => {
    if (config !== null) {
      setTheme(createTheme(config.theme))
    }
  }, [config])

  useEffect(() => {
    if (!clientDone.current) {
      {
        clientDone.current = true
        if (!playerState) {
          getAppConfig(storeConfig)
        }
      }
    }
  }, [playerState])

  return (
    <ThemeProvider theme={theme || baseTheme}>
      { playerState &&  <PlayerContext.Provider value={playerState}>
              <Game setPlayerState={setPlayerState} setGameState={setGameState}  parentTheme={theme || baseTheme}  />
            </PlayerContext.Provider> }
      { !playerState && <Login welcomeTitle={config?.title} setPlayerState={setPlayerState}
      welcomeMsg={config?.welcomeMessage} /> }    
    </ThemeProvider>
  )  
}

export default App
