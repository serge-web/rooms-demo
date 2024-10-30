import { Edit, ReferenceManyField, SimpleForm, TextInput } from 'react-admin';
import { RoomParticipationList } from '../roomParticipations/RoomParticipationList';

export const RoomEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="name" />
            <TextInput source="type" />
            <ReferenceManyField reference="roomParticipations" target="rooms_id" label="Participants">
                <RoomParticipationList/>
            </ReferenceManyField>    
        </SimpleForm>
    </Edit>
);