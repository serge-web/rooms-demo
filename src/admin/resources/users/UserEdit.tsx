import { BooleanInput, Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="name" />
            <TextInput source="password" />
            <ReferenceInput label="Force" source="forces_id" reference="forces" />
            <BooleanInput source="isGameControl" />
            <BooleanInput source="isFeedbackViewer" />
        </SimpleForm>
    </Edit>
);