import { BooleanField, Datagrid, List, ReferenceField, TextField } from 'react-admin';

export const UserList = () => (
    <List exporter={false}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="id" />
            <TextField source="name" />
            <ReferenceField label="Force" source="forces_id" reference="forces" />
            <BooleanField source="isGameControl" />
            <BooleanField source="isFeedbackViewer" />
        </Datagrid>
    </List>
);