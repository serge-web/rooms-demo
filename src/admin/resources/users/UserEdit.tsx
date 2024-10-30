
import { AutocompleteInput, BooleanInput, Create, Edit, PasswordInput, ReferenceInput, required, SimpleForm, TextInput } from 'react-admin';

interface UserFormProps {
  isEdit?: boolean
}

const BaseForm: React.FC<UserFormProps> = ( { isEdit }: UserFormProps) => (
  <SimpleForm sx={{width:'500px'}}>
    <TextInput readOnly={isEdit} source="id" validate={required()} />
    <TextInput source="name" validate={required()} />
    <PasswordInput source="password" validate={required()} />
    <ReferenceInput label="Force" source="forces_id" reference="forces" >
      <AutocompleteInput label="Force" />
    </ReferenceInput>
    <BooleanInput source="isGameControl" />
    <BooleanInput source="isFeedbackViewer" />
  </SimpleForm>
)

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