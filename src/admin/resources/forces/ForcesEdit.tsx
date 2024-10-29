import { Edit, SimpleForm, TextInput } from 'react-admin';
import ColorPicker from '../../helpers/ColorPicker';

export const ForceEdit = () => (
    <Edit>
        <SimpleForm mode="onBlur" reValidateMode="onBlur">
            <TextInput disabled source="id" />
            <TextInput source="name" />
            <ColorPicker source="color" label="Color"/>
            <TextInput multiline minRows={5} source="objective" />
        </SimpleForm>
    </Edit>
);