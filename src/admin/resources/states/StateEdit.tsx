import { DateTimeInput, Edit, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const StateEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="description" />
            <NumberInput source="turn" />
            <DateTimeInput source="gameDate" />
            <TextInput source="turnTime" />
            <TextInput source="planningAllowance" />
        </SimpleForm>
    </Edit>
);