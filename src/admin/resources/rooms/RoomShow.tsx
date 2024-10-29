import { ListGuesser, ReferenceManyField, Show, SimpleShowLayout, TextField } from 'react-admin';


export const RoomShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id"/>
            <TextField source="name" />
            <TextField source="type" />
            <ReferenceManyField reference="roomParticipations" target="rooms_id" label="Participants">
              <ListGuesser />
            </ReferenceManyField>    
        </SimpleShowLayout>
    </Show>
);