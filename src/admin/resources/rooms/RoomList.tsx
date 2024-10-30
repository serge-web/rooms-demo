import { Datagrid, List, TextField } from "react-admin";

export const RoomList = () => (
  <List>
      <Datagrid>
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="type" />
      </Datagrid>
  </List>
);