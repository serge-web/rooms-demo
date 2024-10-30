import { Edit, ReferenceManyField, SimpleForm, TextInput } from 'react-admin';
import { RoomParticipationList } from '../roomParticipations/RoomParticipationList';
import { CreateRelatedRecordButton } from '../../helpers/CreateRelatedRecordButton';

export const RoomEdit = () => {
  return ( 
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <TextInput source="name" />
            <TextInput source="type" />
            <ReferenceManyField reference="roomParticipations" target="rooms_id" label="Participants">
                <RoomParticipationList/>
            </ReferenceManyField>
            <CreateRelatedRecordButton resource="roomParticipations" source="id" target="rooms_id"/>
        </SimpleForm> 
    </Edit>
)};