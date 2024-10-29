import { Show, SimpleShowLayout, TextField } from 'react-admin';
import { ColorField } from '../../helpers/ColorField';

export const ForceShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <ColorField source="color" />
            <TextField source="objective" />
        </SimpleShowLayout>
    </Show>
);