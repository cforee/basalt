Sprite = function(starting_block_x, starting_block_y) {
  this.block_x = starting_block_x;
  this.block_y = starting_block_y;
};

World = function(map_name) {
  this.map_name = map_name;
};

Basalt = function() {
  var self = this;
  self.player = new Sprite(5,5);
  self.world = new World('starting_area');
  self.actions = {
    move: function(opts) {
      console.log('moving ', opts.direction);
    },
  };

  self.keys = $.extend(KEYS, { pressed: [] });

  self.register_keypress = function(key_code) {
    return ($.inArray(key_code, self.keys.pressed) < 0) ? self.keys.pressed.push(key_code) : false;
  };

  self.unregister_keypress = function(key_code) {
    while (self.keys.pressed.indexOf(key_code) >= 0) {
      self.keys.pressed.splice(self.keys.pressed.indexOf(key_code), 1);
    }
  };

  // GAME LOOP
  setInterval(function() {
    var pressed_key_index = self.keys.pressed.length;
    while(pressed_key_index--) {
      if (self.keys[self.keys.pressed[pressed_key_index]]) {
        action = 'self.actions.' + self.keys[self.keys.pressed[pressed_key_index]].action;
        opts = self.keys[self.keys.pressed[pressed_key_index]].opts;
        eval(action)(opts);
      }
    }
  }, 0);

  // DOM events
  $(document).on('keydown', function(e) { self.register_keypress(e.keyCode) });
  $(document).on('keyup', function(e) { self.unregister_keypress(e.keyCode) });
  $(document).on('mouseleave', function(e) { self.keys.pressed = [] });

};

$(function() {
  app = new Basalt();
});
