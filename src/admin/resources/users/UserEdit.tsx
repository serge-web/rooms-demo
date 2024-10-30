
import { AutocompleteInput, BooleanInput, Create, DeleteButton, Edit, PasswordInput, ReferenceInput, required, SaveButton, SimpleForm, TextInput, Toolbar, useRecordContext } from 'react-admin';

interface UserFormProps {
  isEdit?: boolean
}

const NormalToolbar = (
  <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteButton mutationMode="pessimistic" />
  </Toolbar>
);

const JustSaveToolbar = (
  <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <SaveButton />
      <DeleteButton disabled title='Cannot delete admin role' />
  </Toolbar>
);

const BaseForm: React.FC<UserFormProps> = ( { isEdit }: UserFormProps) => 
  {
    const record = useRecordContext();
    if (!record) return null;
    const isAdmin = record['id'] === 'admin'
    const toolbar = isAdmin ? JustSaveToolbar : NormalToolbar
    return (
  <SimpleForm sx={{width:'500px'}} toolbar={toolbar}>
    <TextInput readOnly={isEdit} source="id" validate={required()} />
    <TextInput source="name" validate={required()} />
    <PasswordInput source="password" validate={required()} />
    <ReferenceInput label="Force" source="forces_id" reference="forces" >
      <AutocompleteInput label="Force" />
    </ReferenceInput>
    <BooleanInput source="isGameControl" />
    <BooleanInput source="isFeedbackViewer" />
  </SimpleForm>
)}

export const UserEdit = () => (
    <Edit>
        <BaseForm isEdit={true} />
    </Edit>
);

export const UserCreate = () => (
  <Create>
     <BaseForm/>
  </Create>
)