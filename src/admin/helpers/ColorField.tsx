import { useRecordContext } from "react-admin";

// regex for an html color code
export const htmlRegEx = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const backColor = '#ccc';

export const ColorField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  const rgb = record[source];
  console.log('color: ', rgb);
  // use regex to test if the string is a valid rgb color
  if (htmlRegEx.test(rgb)) {
    return <div style={{ alignContent:'center', backgroundColor:backColor, color: rgb }}>{rgb}</div>;
  } else {
    return 'invalid ' + '(' + rgb + ')';
  }
};