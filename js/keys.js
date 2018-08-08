KEYS = {
  '38': {
    human_friendly_name: 'up arrow',
    action: 'move',
    opts: { direction: 'n' }
  },
  '87': {
    human_friendly_name: 'W key',
    action: 'move',
    opts: { direction: 'n' }
  },
  '39': {
    human_friendly_name: 'right arrow',
    action: 'move',
    opts: { direction: 'e' }
   },
  '68': {
    human_friendly_name: 'D key',
    action: 'move',
    opts: { direction: 'e' }
  },
  '40': {
    human_friendly_name: 'down arrow',
    action: 'move',
    opts: { direction: 's' }
   },
  '83': {
    human_friendly_name: 'S key',
    action: 'move',
    opts: { direction: 's' }
  },
  '37': {
    human_friendly_name: 'left arrow',
    action: 'move',
    opts: { direction: 'w' }
   },
  '65': {
    human_friendly_name: 'A key',
    action: 'move',
    opts: { direction: 'w' }
  },
};

K = {
  up: 87,
  right: 68,
  down: 83,
  left: 65
}

ILLEGAL_COMBOS = [
  [40, 37],
  [40, 39],
  [38, 39],
  [38, 37],
  [65, 83],
  [68, 83],
  [68, 87],
  [65, 87]
]
