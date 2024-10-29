import { Datagrid, ReferenceField, TextField } from 'react-admin';

export const RoomShowParticipants = () => (
  <Datagrid>
    <TextField source="id" />
    <ReferenceField source="rooms_id" reference="rooms" />
    <ReferenceField source="forces_id" reference="forces" />
    <ReferenceField source="users_id" reference="users" />
    <ReferenceField source="templates_id" reference="templates" />
  </Datagrid>
)
