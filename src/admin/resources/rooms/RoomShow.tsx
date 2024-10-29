import { ReferenceManyField, Show, SimpleShowLayout, TextField } from 'react-admin';
import { RoomParticipationList } from '../roomParticipations/RoomParticipationList';


export const RoomShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id"/>
            <TextField source="name" />
            <TextField source="type" />
            <ReferenceManyField reference="roomParticipations" target="rooms_id" label="Participants">
                <RoomParticipationList/>
            </ReferenceManyField>    
        </SimpleShowLayout>
    </Show>
);