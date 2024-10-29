import { DateTimeInput, Edit, NumberInput, required, regex, SimpleForm, TextInput } from 'react-admin';


const validateDuration = [required(),  regex(/^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/, 'Must be valid ISO 8601 Duration')];

export const StateEdit = () => (
    <Edit>
        <SimpleForm  mode="onBlur" reValidateMode="onBlur">
            <TextInput disabled source="id" />
            <TextInput source="description" />
            <NumberInput source="turn" validate={required()} />
            <DateTimeInput source="gameDate" validate={required()}/>
            <TextInput source="turnTime" validate={validateDuration}/>
            <TextInput source="planningAllowance"  validate={validateDuration}/>
        </SimpleForm>
    </Edit>
);