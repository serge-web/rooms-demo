import { BooleanInput, Create, Edit, PasswordInput, ReferenceInput, required, SimpleForm, TextInput } from 'react-admin';

const UserForm = () => (<SimpleForm>
  <TextInput disabled source="id" />
  <TextInput source="name" />
  <PasswordInput source="password" />
  <ReferenceInput label="Force" source="forces_id" reference="forces" />
  <BooleanInput source="isGameControl" />
  <BooleanInput source="isFeedbackViewer" />
</SimpleForm>)

export const UserEdit = () => (
    <Edit>
        <UserForm/>
    </Edit>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="id" validate={required()} />
      <TextInput source="name" validate={required()} />
      <PasswordInput source="password" validate={required()} />
      <ReferenceInput label="Force" source="forces_id" reference="forces" />
      <BooleanInput source="isGameControl" />
      <BooleanInput source="isFeedbackViewer" />
    </SimpleForm>
  </Create>
)