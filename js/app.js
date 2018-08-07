$app = null;
$map = null;
$terrain = null;
$entities = null;
MOVE_AMOUNT = 6;
console.log(MOVE_AMOUNT);
BLOCK_WIDTH = 55;
BLOCK_HEIGHT = 55;
ENTITY_MAP = [];
BOUNDS_BLOCK_X = null;
BOUNDS_BLOCK_Y = null
SPRITE_FRAME_CYCLE_RATE = 7;

Basalt = function() {
  var self = this;
  this.player = new Sprite('player', '/assets/entities/bunny/', 6);
  this.world = new World('starting_area');
  this.keys = $.extend(KEYS, { pressed: [] });
  this.player_step_count = 0;

  this.actions = {
    move: function(opts) {
      switch(opts.direction) {
        case 'n':
          if (!self.player.is_collision(0, -MOVE_AMOUNT)) {
            self.world.move(0, MOVE_AMOUNT);
            self.player.move(0, -MOVE_AMOUNT);
            self.player.set_direction('n');
            self.player_step_count++;
          }
          break;
        case 'e':
          if (!self.player.is_collision(MOVE_AMOUNT, 0)) {
            self.world.move(-MOVE_AMOUNT, 0);
            self.player.move(MOVE_AMOUNT, 0);
            self.player.set_direction('e');
            self.player_step_count++;
          }
          break;
        case 's':
          if (!self.player.is_collision(0, MOVE_AMOUNT)) {
            self.world.move(0, -MOVE_AMOUNT);
            self.player.move(0, MOVE_AMOUNT);
            self.player.set_direction('s');
            self.player_step_count++;
          }
          break;
        case 'w':
          if (!self.player.is_collision(-MOVE_AMOUNT, 0)) {
            self.world.move(MOVE_AMOUNT, 0);
            self.player.move(-MOVE_AMOUNT, 0);
            self.player.set_direction('w');
            self.player_step_count++;
          }
          break;
      }
      if (self.player_step_count >= SPRITE_FRAME_CYCLE_RATE) {
        self.player.cycle_frames();
        self.player_step_count = 0;
      }
    },
  };

  this.register_keypress = function(key_code) {
    return ($.inArray(key_code, this.keys.pressed) < 0) ? this.keys.pressed.push(key_code) : false;
  };

  this.unregister_keypress = function(key_code) {
    while (this.keys.pressed.indexOf(key_code) >= 0) {
      this.keys.pressed.splice(this.keys.pressed.indexOf(key_code), 1);
    }
  };

  this.world.init();
  this.player.init();
  this.player.block_x = parseInt((this.world.MAP_PIXEL_WIDTH / 2) / BLOCK_WIDTH);
  this.player.block_y = parseInt((this.world.MAP_PIXEL_HEIGHT / 2) / BLOCK_HEIGHT);

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
  $.ajaxSetup({ cache: false, async: false })
  app = new Basalt();
});
