import { DateTimeInput, Edit, NumberInput, required, regex, SimpleForm, TextInput } from 'react-admin'


const durationError = 'Must be valid ISO 8601 Duration according to https://en.wikipedia.org/wiki/ISO_8601#Durations'
const iso8601Duration = /^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
const validateDuration = [required(),  regex(iso8601Duration, durationError)]

export const StateEdit = () => (
    <Edit>
        <SimpleForm mode="onBlur" reValidateMode="onBlur">
            <TextInput disabled source="id" />
            <TextInput source="description" />
            <NumberInput source="turn" validate={required()} />
            <DateTimeInput source="gameDate" validate={required()}/>
            <TextInput source="turnTime" validate={validateDuration}/>
            <TextInput source="planningAllowance"  validate={validateDuration}/>
        </SimpleForm>
    </Edit>
)