import { DateField, NumberField, Show, SimpleShowLayout, TextField } from 'react-admin';
import { DurationField } from '../../helpers/DurationField';

export const StateShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="description" />
            <NumberField source="turn" />
            <DateField showTime source="gameDate" />
            <DurationField source="turnTime" />
            <DurationField source="planningAllowance" />
        </SimpleShowLayout>
    </Show>
);