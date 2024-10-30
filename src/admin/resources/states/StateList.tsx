import { Datagrid, DateField, List, TextField } from 'react-admin';
import { DurationField } from '../../helpers/DurationField';

export const StateList = () => (
    <List exporter={false}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="id" />
            <TextField source="description" />
            <TextField source="turn" />
            <DateField source="gameDate" />
            <DurationField source="turnTime" />
            <DurationField source="planningAllowance" />
        </Datagrid>
    </List>
);