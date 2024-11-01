import React from "react"
import { Admin, Resource } from "react-admin"
import { Layout } from "./Layout"

const App = () => (
  <Admin layout={Layout}>
    <Resource name="users" />
  </Admin>
)

export default App
