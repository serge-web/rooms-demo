import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Layout } from "./Layout.tsx";
import localDataProvider from "./localDataProvider.ts";
import { authProvider } from "./authProvider.ts";
import defaultData from "./initial_data.ts";

const dataProvider = localDataProvider({defaultData: defaultData})

export const AdminApp = () => (
  <Admin
    layout={Layout}
    dataProvider={dataProvider}
    authProvider={authProvider}
  >
    <Resource
      name="states"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="forces"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="users"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="rooms"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="roomParticipations"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
  </Admin>
);
