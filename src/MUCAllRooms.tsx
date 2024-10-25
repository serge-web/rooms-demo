import * as XMPP from 'stanza';
import * as FlexLayout from 'flexlayout-react'
import 'flexlayout-react/style/light.css';  
import { useEffect, useMemo, useState } from 'react';
import { MUCRoom } from './MUCRoom';
import './MUCAllRooms.css';
import { RoomDetails } from './App';

export default interface AllRoomsProps {
  // id of room
  rooms: RoomDetails[]
  // new received message
  newMessage: XMPP.Stanzas.Message | undefined

  // old messages for all rooms
  oldMessages: XMPP.Stanzas.Forward[]
}

type Factory = (node: FlexLayout.TabNode) => React.ReactNode

export const MUCAllRooms: React.FC<AllRoomsProps> = ( { rooms, newMessage }: AllRoomsProps) => {
  const [modelData, setModelData] = useState<FlexLayout.Model | undefined>(undefined);

  useEffect(() => {
    if (rooms.length > 0) {
      const roomNodes = rooms.map((room):FlexLayout.IJsonTabSetNode => {
        return {
          type: "tabset",
          weight: 50,
          children: [
              {
                  type: "tab",
                  name: room.name,
                  id: room.jid,
                  component: "button",
              }
          ]
      }})

      const model: FlexLayout.IJsonModel= {
        global: {
          tabSetTabStripHeight: 45,
          tabEnableClose: false,
          tabEnableRenderOnDemand: false,
          tabSetEnableMaximize: false
        },
        borders: [],
        layout: {
            type: "row",
            weight: 100,
            children: roomNodes
        }
      }
      setModelData(FlexLayout.Model.fromJson(model)) 
    }
  }, [rooms])

  const factory = useMemo( (): Factory => {
    return (node: FlexLayout.TabNode): React.ReactNode => {
      const details = rooms.find((room) => room.jid === node.getId())
      if (details) {
        return <MUCRoom details={details} key={details.jid} newMessage={newMessage} />
      } else {
        return <span>Room not found</span>
      }
    }
  }, [newMessage, rooms])

return useMemo(() => {
  return <div className='message-feed'>
  { modelData &&
    <FlexLayout.Layout
    model={modelData}
    factory={factory}  />}
</div>
}, [modelData, factory])

}
