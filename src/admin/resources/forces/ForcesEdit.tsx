import { Edit, regex, SimpleForm, TextInput } from 'react-admin';
import { htmlRegEx } from '../../helpers/ColorField';

const validateColor = regex(htmlRegEx, 'Invalid color code (expecting #f00, #226644, etc.)');

export const ForceEdit = () => (
    <Edit>
        <SimpleForm mode="onBlur" reValidateMode="onBlur">
            <TextInput disabled source="id" />
            <TextInput source="name" />
            <TextInput source="color" validate={validateColor} />
            <TextInput source="objective" />
        </SimpleForm>
    </Edit>
);