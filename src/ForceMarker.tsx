export default interface ForceMarkerProps {
  color: string
  id: string
  name: string
}

export const TextInputDialog: React.FC<ForceMarkerProps> = ({ color, id, name }: ForceMarkerProps) => {
  return (
    <div>{name} {color} {id}</div>
  )
}
