const defaultData = {
  states: [
    {id: 1, description: 'Learn about Blue vs Red in context of Napoleonic maritime engagements', 
      turn: 0, gameDate: '1805-10-21T09:00:00Z', turnTime: 'PT12H', planningAllowance:
      'PT12M'},
  ],
  forces:[
    {id: 'umpire', name: 'Umpire', color: '#fff', objective: 'N/A'},
    {id: 'red', name: 'Red', color: '#f00', objective: 'Defend against Blue Forces'},
    {id: 'blue', name: 'Blue', color: '#00f', objective: 'Destroy Red Forces'},
  ],
  users:[
    { name: 'Game Control', id: 'admin', password: 'password', forces_id: 'umpire', isGameControl: true, isFeedbackViewer: true},
    { name: 'Blue CO', id: 'blue-co', password: 'password', forces_id: 'blue', isGameControl: false, isFeedbackViewer: false},
    { name: 'Blue Media', id: 'blue-media', password: 'password', forces_id: 'blue', isGameControl: false, isFeedbackViewer: false},
    { name: 'Red CO', id: 'red-co', password: 'password', forces_id: 'red', isGameControl: false, isFeedbackViewer: false},
  ],
  templates: [
    {id:1, name: 'Orders', template: 'some-json'},
    {id:2, name: 'Weather', template: 'some-json'},
    {id:3, name: 'Media', template: 'some-json'},
    {id:4, name: 'Mechanical Failure', template: 'some-json'},
    {id:5, name: 'Media', template: 'some-json'},
  ],
  rooms: [
    {id: 1, name: 'Blue HQ', type: 'custom'},
    {id: 2, name: 'Blue Media', type: 'chat'},
  ],
  roomParticipations: [
    {id:1, rooms_id: 1, forces_id: ['blue'], users_id:[], templates_id: []},
    {id:2, rooms_id: 1, forces_id: [], users_id: ['blue-co'], templates_id: [1, 2]},
    {id:3, rooms_id: 2, forces_id: ['blue', 'red', 'umpire'], users_id: [], templates_id: []},
    {id:4, rooms_id: 2, forces_id: [], users_id: ['blue-media'], templates_id: [3]},
  ]
}
export default defaultData