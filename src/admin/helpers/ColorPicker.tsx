import React, { useState, CSSProperties } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
// import cx from 'classnames'

/* Import Styles */
import './ColorPickerStyles.css'
import { useInput } from 'react-admin'

export interface PropTypes {
  source: string
  label: string
}


/* Render component */
const ColorPicker: React.FC<PropTypes> = ({ source, label }) => {
  const [active, setActive] = useState(false)
  
  
  const { id, field } = useInput({ source });

  const handleClick = (): void => {
    setActive(!active)
  }

  const handleChange = (color: ColorResult): void => {
    field.onChange(color.hex)
  }

  const colorStyles: CSSProperties = {
    backgroundColor: field.value || '#fff'
  } as CSSProperties

  return (
    <div>
      <div>{label}</div>
      <div className={'swatch'} onClick={handleClick}>
        <div key={id} className={'color'} style={colorStyles} />
      </div>
      {active && <div className={'popover'} >
        <div className={'cover'} onClick={handleClick}/>
        <SketchPicker key={id} color={field.value} onChange={handleChange}/>
      </div>}

    </div>
  )
}

export default ColorPicker