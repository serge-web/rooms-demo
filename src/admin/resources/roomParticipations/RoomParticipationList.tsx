import { Datagrid, List, ReferenceArrayField, ReferenceField, SingleFieldList, TextField } from 'react-admin'

export const RoomParticipationList = () => (
  <Datagrid>
      <TextField source='id' />
      <ReferenceField source='rooms_id' reference='rooms' />
      <ReferenceArrayField reference='forces' source='forces_id'>
        <SingleFieldList/>
      </ReferenceArrayField>  
      <ReferenceArrayField reference='users' source='users_id'>
        <SingleFieldList/>
      </ReferenceArrayField>
      <ReferenceArrayField source='templates_id' reference='templates' >
        <SingleFieldList/>
      </ReferenceArrayField>
  </Datagrid>
)

export const RoomParticipationFullList = () => (
  <List exporter={false}>
    <Datagrid bulkActionButtons={false}>
        <TextField source='id' />
        <ReferenceField source='rooms_id' reference='rooms' />
        <ReferenceArrayField reference='forces' source='forces_id'>
          <SingleFieldList/>
        </ReferenceArrayField>  
        <ReferenceArrayField reference='users' source='users_id'>
          <SingleFieldList/>
        </ReferenceArrayField>
        <ReferenceArrayField source='templates_id' reference='templates' >
          <SingleFieldList/>
        </ReferenceArrayField>
    </Datagrid>
  </List>
)