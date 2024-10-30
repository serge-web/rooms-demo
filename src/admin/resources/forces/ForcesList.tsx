import { Datagrid, List, TextField } from 'react-admin';
import { ColorField } from '../../helpers/ColorField';

export const ForceList = () => (
    <List exporter={false}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="id" />
            <TextField source="name" />
            <ColorField source="color" />
            <TextField source="objective" />
        </Datagrid>
    </List>
);