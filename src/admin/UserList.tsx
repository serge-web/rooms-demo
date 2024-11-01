import React from "react"
import { List, Datagrid, TextField, EmailField } from "react-admin"

export const UserList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
    </Datagrid>
  </List>
)
