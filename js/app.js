Sprite = function(starting_block_x, starting_block_y) {
  this.block_x = starting_block_x;
  this.block_y = starting_block_y;
};

World = function(map_name) {
  this.map_name = map_name;
};

Actions = function() {
  this.move = function(direction) {
    console.log(direction);
  }
}

KEYS = {
  '38': {
    human_friendly_name: 'up arrow',
    action: 'move',
    opts: { direction: 'n' }
   },
  '39': {
    human_friendly_name: 'right arrow',
    action: 'move',
    opts: { direction: 'e' }
   },
  '40': {
    human_friendly_name: 'down arrow',
    action: 'move',
    opts: { direction: 's' }
   },
  '37': {
    human_friendly_name: 'left arrow',
    action: 'move',
    opts: { direction: 'w' }
   },
};

Basalt = function() {
  var self = this;
  this.player = new Sprite(5,5);
  this.world = new World('starting_area');
  this.actions = new Actions();
  this.keys = $.extend(KEYS, { pressed: [] });

  this.register_keypress = function(key_code) {
    return ($.inArray(key_code, self.keys.pressed) < 0) ? self.keys.pressed.push(key_code) : false;
  };

  this.unregister_keypress = function(key_code) {
    while (self.keys.pressed.indexOf(key_code) >= 0) {
      self.keys.pressed.splice(self.keys.pressed.indexOf(key_code), 1);
    }
  };

  // GAME LOOP
  setInterval(function() {
    var pressed_key_index = self.keys.pressed.length;
    while(pressed_key_index--) {
      if (KEYS[self.keys.pressed[pressed_key_index]]) {
        f = 'self.actions.' + KEYS[self.keys.pressed[pressed_key_index]].action;
        opts = KEYS[self.keys.pressed[pressed_key_index]].opts;
        eval(f)(opts);
      }
    }
  }, 1);

  // DOM events
  $(document).on('keydown', function(e) { self.register_keypress(e.keyCode) });
  $(document).on('keyup', function(e) { self.unregister_keypress(e.keyCode) });

};

$(function() {
  app = new Basalt();
});
