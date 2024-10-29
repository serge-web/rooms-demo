import { ReferenceArrayField, ReferenceField, Show, SimpleShowLayout, SingleFieldList, TextField } from 'react-admin';

export const RoomParticipationShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="rooms_id" reference="rooms" />
            <ReferenceArrayField reference="forces" source="forces_id">
              <SingleFieldList/>
            </ReferenceArrayField>
            <ReferenceArrayField reference="users" source="users_id">
              <SingleFieldList/>
            </ReferenceArrayField>
            <ReferenceArrayField reference="templates" source="templates_id">
              <SingleFieldList/>
            </ReferenceArrayField>
        </SimpleShowLayout>
    </Show>
);