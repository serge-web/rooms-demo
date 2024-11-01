// MUCMessage.tsx
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { WarningAmber } from '@mui/icons-material'

export default interface SimpleDialogProps {
  dialog: string | null
  dialogTitle?: string
  setDialog: (value: string | null) => void
}

export const SimpleDialog: React.FC<SimpleDialogProps> = ({ dialog, setDialog, dialogTitle }: SimpleDialogProps) => {
  return (
  <Dialog open={dialog != null} onClose={() => setDialog(null)}>
    <DialogTitle><WarningAmber style={{float:'left'}}/>{dialogTitle || 'Message'}</DialogTitle>
    <DialogContent>{dialog}</DialogContent>
    <DialogActions>
      <Button style={{marginRight:'20px'}} variant='contained' onClick={() => setDialog(null)}>OK</Button>
    </DialogActions>
  </Dialog>  
  )
}
