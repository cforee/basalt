$app = null;
$map = null;
$terrain = null;
$entities = null;
VIEWPORT_OFFSET = { x: null, y: null };
MOVE_AMOUNT = 6;
BLOCK_WIDTH = 55;
BLOCK_HEIGHT = 55;
ENTITY_MAP = [];
BOUNDS_VIEWPORT_X = null;
BOUNDS_VIEWPORT_Y = null;
BOUNDS_BLOCK_X = null;
BOUNDS_BLOCK_Y = null;
MAX_AUTONAV_TRIES = 100;
SPRITE_FRAME_CYCLE_RATE = 7;
ILLEGAL_COMBOS_LEN = ILLEGAL_COMBOS.length;

Basalt = function() {
  var self = this;
  $app = $('app');
  var vo = $app.offset();
  VIEWPORT_OFFSET = { x: vo.left, y: vo.top }
  BOUNDS_VIEWPORT_X = $app.innerWidth();
  BOUNDS_VIEWPORT_Y = $app.innerHeight();

  this.player = new Sprite('player', '/assets/entities/bunny/', 6);
  this.world = new World('starting_area');
  this.keys = $.extend(KEYS, { pressed: [] });
  this.autonav_try_count = 0;
  this.mouse = { click: { present: false, right: { x: null, y: null } } };
  this.player_step_count = 0;

  this.actions = {
    nothing: function() {
      // default action whewn no
      // action key is depressed
      self.player.reset_frames();
      self.unregister_click();
    },

    navigate_to_tap: function() {
      var player_pos = { x: self.player.relative_pixel_x, y: self.player.relative_pixel_y };
      var tap = { x: self.mouse.click.right.x, y: self.mouse.click.right.y };
      console.log('tap location: ', tap);
      console.log('player location: ', player_pos);
      console.log("\n");
      if (
        (player_pos.x < (tap.x + BLOCK_WIDTH)) && (player_pos.x > (tap.x - BLOCK_WIDTH)) &&
        (player_pos.y < (tap.y + BLOCK_HEIGHT)) && (player_pos.y > (tap.y - BLOCK_HEIGHT))
      ) { console.log("MOVE COMPLETE!"); self.unregister_click(); } else {
        if (tap.x < player_pos.x)      { self.actions.move({ direction: 'w' }); }
        else if (tap.x > player_pos.x) { self.actions.move({ direction: 'e' }); }
        else if (tap.y < player_pos.y) { self.actions.move({ direction: 'n' }); }
        else if (tap.y > player_pos.y) { self.actions.move({ direction: 's' }); }
      }
    },

    move: function(opts) {
      switch(opts.direction) {
        case 'n':
          self.player.set_direction('n');
          if (!self.player.is_collision(0, -MOVE_AMOUNT)) {
            self.world.move(0, MOVE_AMOUNT);
            self.player.move(0, -MOVE_AMOUNT);
            self.player_step_count++;
          } else { self.actions.nothing(); }
          break;
        case 'e':
          self.player.set_direction('e');
          if (!self.player.is_collision(MOVE_AMOUNT, 0)) {
            self.world.move(-MOVE_AMOUNT, 0);
            self.player.move(MOVE_AMOUNT, 0);
            self.player_step_count++;
          } else { self.actions.nothing(); }
          break;
        case 's':
          self.player.set_direction('s');
          if (!self.player.is_collision(0, MOVE_AMOUNT)) {
            self.world.move(0, -MOVE_AMOUNT);
            self.player.move(0, MOVE_AMOUNT);
            self.player_step_count++;
          } else { self.actions.nothing(); }
          break;
        case 'w':
          self.player.set_direction('w');
          if (!self.player.is_collision(-MOVE_AMOUNT, 0)) {
            self.world.move(MOVE_AMOUNT, 0);
            self.player.move(-MOVE_AMOUNT, 0);
            self.player_step_count++;
          } else { self.actions.nothing(); }
          break;
      }
      if (self.player_step_count >= SPRITE_FRAME_CYCLE_RATE) {
        self.player.cycle_frames();
        self.player_step_count = 0;
      }
    },
  };

  this.register_keypress = function(key_code) {
    for (var i = 0; i < ILLEGAL_COMBOS_LEN; i++) {
      this_combo = ILLEGAL_COMBOS[i];
      if (this.keys.pressed.indexOf(this_combo[0]) && (target_index = this.keys.pressed.indexOf(this_combo[1]))) {
        this.keys.pressed.splice(target_index, 1);
      }
    }
    return ($.inArray(key_code, this.keys.pressed) < 0) ? this.keys.pressed.push(key_code) : false;
  };

  this.unregister_keypress = function(key_code) {
    while (this.keys.pressed.indexOf(key_code) >= 0) {
      this.keys.pressed.splice(this.keys.pressed.indexOf(key_code), 1);
    }
    if (this.keys.pressed.length == 0) { this.actions.nothing(); }
  };

  this.register_click = function(e) {
    self.mouse.click.present = false;
    console.log(e.target.parent);
    self.mouse.click.right.x = parseInt(e.pageX - VIEWPORT_OFFSET.x)
    self.mouse.click.right.y = parseInt(e.pageY - VIEWPORT_OFFSET.y)
    self.mouse.click.right.x = (self.mouse.click.right.x < 0) ? 0 : self.mouse.click.right.x;
    self.mouse.click.right.y = (self.mouse.click.right.y < 0) ? 0 : self.mouse.click.right.y;
    self.mouse.click.right.x = (self.mouse.click.right.x > BOUNDS_VIEWPORT_X) ?  BOUNDS_VIEWPORT_X : self.mouse.click.right.x;
    self.mouse.click.right.y = (self.mouse.click.right.y > BOUNDS_VIEWPORT_Y) ?  BOUNDS_VIEWPORT_Y : self.mouse.click.right.y;
    self.mouse.click.present = true;
  };

  this.unregister_click = function() {
    self.mouse.click.present = false;
  }

  this.world.init();
  this.player.init();
  this.player.block_x = parseInt((this.world.MAP_PIXEL_WIDTH / 2) / BLOCK_WIDTH);
  this.player.block_y = parseInt((this.world.MAP_PIXEL_HEIGHT / 2) / BLOCK_HEIGHT);

  // GAME LOOP
  setInterval(function() {
    var pressed_key_index = self.keys.pressed.length;
    while(pressed_key_index--) {
      self.unregister_click();
      if (self.keys[self.keys.pressed[pressed_key_index]]) {
        action = 'self.actions.' + self.keys[self.keys.pressed[pressed_key_index]].action;
        opts = self.keys[self.keys.pressed[pressed_key_index]].opts;
        eval(action)(opts);
      }
    }
    while(self.mouse.click.present) {
      if (self.autonav_try_count < MAX_AUTONAV_TRIES) { self.actions.navigate_to_tap(); } else { self.unregister_click(); self.autonav_try_count = 0; }
      self.autonav_try_count++;
    }
  }, 0);

  // DOM events
  $(document).on('keydown', function(e) { self.register_keypress(e.keyCode) });
  $(document).on('keyup', function(e) { self.unregister_keypress(e.keyCode) });
  $(document).on('mouseleave', function(e) { self.keys.pressed = [] });
  $(document).on('mousedown', function(e) { self.register_click(e) });

};

$(function() {
  $.ajaxSetup({ cache: false, async: false })
  app = new Basalt();
});
