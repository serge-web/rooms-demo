const defaultData = {
  states: [
    {id: 1, description: 'Learn about Blue vs Red in context of Napoleonic maritime engagements', 
      turn: 0, gameDate: '1805-10-21T09:00:00', turnTime: '0000-00-00T12:00:00', planningAllowance:
      '0000-00-00T00:10:00'},
  ],
  forces:[
    {id: 'umpire', name: 'Umpire', color: '#fff', objective: 'N/A'},
    {id: 'red', name: 'Red', color: '#f00', objective: 'Defend against Blue Forces'},
    {id: 'blue', name: 'Blue', color: '#00f', objective: 'Destroy Red Forces'},
  ],
  users:[
    {id: 1, name: 'Game Control', username: 'admin', password: 'password', forces_id: 'umpire', isGameControl: true, isFeebackViewer: true},
    {id: 2, name: 'Blue CO', username: 'blue-co', password: 'password', forces_id: 'blue', isGameControl: false, isFeebackViewer: false},
    {id: 3, name: 'Red CO', username: 'red-co', password: 'password', forces_id: 'red', isGameControl: false, isFeebackViewer: false},
  ],
  templates: [
    {id:1, name: 'Orders', template: 'some-json'},
    {id:2, name: 'Weather', template: 'some-json'},
    {id:3, name: 'Media', template: 'some-json'},
    {id:4, name: 'Mechanical Failure', template: 'some-json'},
  ],
  rooms: [
    {id: 1, name: 'Blue HQ', type: 'custom'},
    {id: 2, name: 'Blue Media', type: 'chat'},
  ],
  roomParticipations: [
    {id:1, rooms_id: 1, forces_id: 'blue', users_id: undefined},
    {id:2, rooms_id: 1, forces_id: undefined, users_id: 2, templates_id: 1},
    {id:3, rooms_id: 2, forces_id: 'blue', users_id: undefined},
  ]
}
export default defaultData;