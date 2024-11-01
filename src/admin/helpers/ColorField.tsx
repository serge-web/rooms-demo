import { useRecordContext } from "react-admin"

// regex for an html color code
const htmlRegEx = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

// styling for the color field
const divParams = (rgb: string) => ({ 
  width:'10px', marginRight:'2px',
  display:'inline', border:'1px solid black', 
  alignContent:'center', backgroundColor:rgb 
})

/**
 * 
 * @param source - the name of the field to render
 * @returns 
 */
export const ColorField = ({ source }: { source: string }) => {
  const record = useRecordContext()
  if (!record) return null
  const rgb = record[source]
  // use regex to test if the string is a valid rgb color
  if (htmlRegEx.test(rgb)) {
    return <div><div style={divParams(rgb)}>&nbsp;</div>{rgb}</div>
  } else {
    return 'invalid ' + '(' + rgb + ')'
  }
}