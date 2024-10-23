// MUCRoom.tsx
import { FormControl, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import './MUCMessage.css';

export default interface WargameListProps {
  wargames: string[]
  setSelectedWargame: (wargame: string) => void
  selectedWargame: string
}

export const WargameList: React.FC<WargameListProps> = ({ wargames, selectedWargame, setSelectedWargame}: WargameListProps) => {
  const boldText = {
    fontWeight: 'bold',
    marginTop: '0px'
  };
  
  return ( 
    <FormControl>
    <h2>Wargames:</h2>
  <List style={{overflow:'scroll'}} id='wargame-list'>
  {wargames.map((wargame) => (
    <ListItem style={{padding:'0px 10px'}} key={wargame} value={wargame} onClick={(evt) => setSelectedWargame(evt.currentTarget.textContent || '')}>
      <ListItemButton style={{padding:'0px 10px'}}>
        <ListItemText primaryTypographyProps={ wargame === selectedWargame ? { style: boldText }  : {}} >
          {wargame}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  ))}
  </List>
  </FormControl>
  )
}
