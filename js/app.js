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
MAX_AUTONAV_TRIES = 1000;
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
      self.player.resetFrames();
    },

    navigateToTap: function() {
      var p = { x: self.player.relative_pixel_x, y: self.player.relative_pixel_y };
      var tap = { x: self.mouse.click.right.x - (BLOCK_WIDTH / 2), y: self.mouse.click.right.y - (BLOCK_HEIGHT / 2) };

      var at_target_x = (p.x > (tap.x - MOVE_AMOUNT)) && (p.x < (tap.x + MOVE_AMOUNT));
      var at_target_y = (p.y > (tap.y - MOVE_AMOUNT)) && (p.y < (tap.y + MOVE_AMOUNT));

      // base-case: xy target reached
      if (at_target_x && at_target_y) { return self.flushInput(); };

      if (!at_target_x) {
        // get in alignment with x-axis
        (p.x <= tap.x) ? self.registerKeypress(K.right) : self.registerKeypress(K.left);
      }

      if (!at_target_y) {
        // get in alignment with y-axis
        (p.y >= tap.y) ? self.registerKeypress(K.up) : self.registerKeypress(K.down);
      }

    },

    move: function(opts) {
      switch(opts.direction) {
        case 'n':
          self.player.setDirection('n');
          if (!self.player.isCollision(0, -MOVE_AMOUNT)) {
            self.world.move(0, MOVE_AMOUNT);
            self.player.move(0, -MOVE_AMOUNT);
            self.player_step_count++;
          } else { self.flushInput(); }
          break;
        case 'e':
          self.player.setDirection('e');
          if (!self.player.isCollision(MOVE_AMOUNT, 0)) {
            self.world.move(-MOVE_AMOUNT, 0);
            self.player.move(MOVE_AMOUNT, 0);
            self.player_step_count++;
          } else { self.flushInput(); }
          break;
        case 's':
          self.player.setDirection('s');
          if (!self.player.isCollision(0, MOVE_AMOUNT)) {
            self.world.move(0, -MOVE_AMOUNT);
            self.player.move(0, MOVE_AMOUNT);
            self.player_step_count++;
          } else { self.flushInput(); }
          break;
        case 'w':
          self.player.setDirection('w');
          if (!self.player.isCollision(-MOVE_AMOUNT, 0)) {
            self.world.move(MOVE_AMOUNT, 0);
            self.player.move(-MOVE_AMOUNT, 0);
            self.player_step_count++;
          } else { self.flushInput(); }
          break;
      }
      if (self.player_step_count >= SPRITE_FRAME_CYCLE_RATE) {
        self.player.cycleFrames();
        self.player_step_count = 0;
      }
    },
  };

  this.registerKeypress = function(key_code) {
    for (var i = 0; i < ILLEGAL_COMBOS_LEN; i++) {
      this_combo = ILLEGAL_COMBOS[i];
      if (this.keys.pressed.indexOf(this_combo[0]) && (target_index = this.keys.pressed.indexOf(this_combo[1]))) {
        this.keys.pressed.splice(target_index, 1);
      }
    }
    return ($.inArray(key_code, this.keys.pressed) < 0) ? this.keys.pressed.push(key_code) : false;
  };

  this.unregisterKeypress = function(key_code) {
    while (this.keys.pressed.indexOf(key_code) >= 0) {
      this.keys.pressed.splice(this.keys.pressed.indexOf(key_code), 1);
    }
    if (this.keys.pressed.length == 0) { this.actions.nothing(); }
  };

  this.flushInput = function() {
    this.keys.pressed = [];
    this.unregisterClick();
    this.actions.nothing();
    return true;
  }

  this.registerClick = function(e) {
    self.mouse.click.present = false;
    self.mouse.click.right.x = parseInt(e.pageX - VIEWPORT_OFFSET.x - self.world.pixel_x)
    self.mouse.click.right.y = parseInt(e.pageY - VIEWPORT_OFFSET.y - self.world.pixel_y)
    self.mouse.click.right.x = (self.mouse.click.right.x < 0) ? 0 : self.mouse.click.right.x;
    self.mouse.click.right.y = (self.mouse.click.right.y < 0) ? 0 : self.mouse.click.right.y;
    self.mouse.click.present = true;
  };

  this.unregisterClick = function() {
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
      if (self.keys[self.keys.pressed[pressed_key_index]]) {
        action = 'self.actions.' + self.keys[self.keys.pressed[pressed_key_index]].action;
        opts = self.keys[self.keys.pressed[pressed_key_index]].opts;
        eval(action)(opts);
      }
    }
    if (self.mouse.click.present) {
      self.actions.navigateToTap();
    }
  }, 0);

  // DOM events
  $(document).on('keydown', function(e) { self.registerKeypress(e.keyCode) });
  $(document).on('keyup', function(e) { self.unregisterKeypress(e.keyCode) });
  $(document).on('mouseleave', function(e) { self.keys.pressed = [] });
  $(document).on('mousedown', function(e) { self.registerClick(e) });

};

$(function() {
  $.ajaxSetup({ cache: false, async: false })
  app = new Basalt();
});
