import { AutocompleteInput, Create, Edit, ReferenceArrayInput, ReferenceInput, SimpleForm, TextInput } from 'react-admin'

export const RoomParticipationEdit = () => (
    <Edit>
    <div>Edit participation</div>
    <SimpleForm sx={{width:400}}>
    <TextInput disabled source='id' />
    <ReferenceInput readonly disabled source='rooms_id' reference='rooms'>
        <AutocompleteInput label='Room' />
    </ReferenceInput>
    <ReferenceArrayInput reference='forces' source='forces_id'/>
    <ReferenceArrayInput reference='users' source='users_id'/>
    <ReferenceArrayInput reference='templates' source='templates_id'/>
    </SimpleForm>
    </Edit>
)

export const RoomParticipationCreate = () => (
    <Create>
    <div>Create participation</div>
    <SimpleForm>
    <ReferenceInput readonly disabled source='rooms_id' reference='rooms' />
    <ReferenceArrayInput reference='forces' source='forces_id'/>
    <ReferenceArrayInput reference='users' source='users_id'/>
    <ReferenceArrayInput reference='templates' source='templates_id'/>
    </SimpleForm>
    </Create>
)

