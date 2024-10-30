import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Description, EventAvailable, Groups, MeetingRoom, Person, RoomPreferences } from "@mui/icons-material";
import { Layout } from "./Layout.tsx";
import localDataProvider from "./localDataProvider.ts";
import { authProvider } from "./authProvider.ts";
import defaultData from "./initial_data.ts";
import { RoomShow } from "./resources/rooms/RoomShow.tsx";
import { RoomParticipationCreate, RoomParticipationEdit } from "./resources/roomParticipations/RoomParticipationEdit.tsx";
import { RoomParticipationFullList } from "./resources/roomParticipations/RoomParticipationList.tsx";
import { StateList } from "./resources/states/StateList.tsx";
import { StateEdit } from "./resources/states/StateEdit.tsx";
import { ForceList } from "./resources/forces/ForcesList.tsx";
import { ForceEdit } from "./resources/forces/ForcesEdit.tsx";
import { UserList } from "./resources/users/UserList.tsx";
import { UserCreate, UserEdit } from "./resources/users/UserEdit.tsx";
import { RoomList } from "./resources/rooms/RoomList.tsx";
import { RoomCreate, RoomEdit } from "./resources/rooms/RoomEdit.tsx";

const dataProvider = localDataProvider({defaultData: defaultData})

export const AdminApp = () => (
  <Admin
    layout={Layout}
    dataProvider={dataProvider}
    authProvider={authProvider}
  >
    <Resource
      name="states"
      options={{ label: 'Current game state' }} 
      icon={EventAvailable}
      list={StateList}
      edit={StateEdit}
    />
    <Resource
      name="forces"
      icon={Groups}
      list={ForceList}
      edit={ForceEdit}
    />
    <Resource
      name="users"
      icon={Person}
      list={UserList}
      edit={UserEdit}
      create={UserCreate}
    />
    <Resource
      name="rooms"
      icon={MeetingRoom}
      list={RoomList}
      edit={RoomEdit}
      show={RoomShow}
      create={RoomCreate}
    />
    <Resource
      name="roomParticipations"
      options={{ label: 'Room Membership' }} 
      icon={RoomPreferences}
      list={RoomParticipationFullList}
      edit={RoomParticipationEdit}
      create={RoomParticipationCreate}
    />
    <Resource
      name="templates"
      icon={Description}
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
  </Admin>
);
