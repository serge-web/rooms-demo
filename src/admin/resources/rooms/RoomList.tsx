import { Datagrid, List, TextField } from "react-admin"

export const RoomList = () => (
  <List exporter={false}>
      <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="type" />
      </Datagrid>
  </List>
)