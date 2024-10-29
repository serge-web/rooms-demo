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
import { RoomParticipationEdit } from "./resources/roomParticipations/RoomParticipationEdit.tsx";
import { RoomParticipationShow } from "./resources/roomParticipations/RoomParticipationShow.tsx";
import { RoomParticipationList } from "./resources/roomParticipations/RoomParticipationList.tsx";

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
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="forces"
      icon={Groups}
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="users"
      icon={Person}
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="rooms"
      icon={MeetingRoom}
      list={ListGuesser}
      edit={EditGuesser}
      show={RoomShow}
    />
    <Resource
      name="roomParticipations"
      options={{ label: 'Room Membership' }} 
      icon={RoomPreferences}
      list={RoomParticipationList}
      edit={RoomParticipationEdit}
      show={RoomParticipationShow}
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
