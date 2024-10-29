import moment from "moment";
import { useRecordContext } from "react-admin";

export const DurationField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  const durMom = moment.duration(record[source])
  return durMom.humanize()
};