import { BooleanField, Datagrid, List, ReferenceField, TextField } from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="password" />
            <ReferenceField label="Force" source="forces_id" reference="forces" />
            <BooleanField source="isGameControl" />
            <BooleanField source="isFeedbackViewer" />
        </Datagrid>
    </List>
);