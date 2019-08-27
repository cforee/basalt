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
  this.mouse = {
    click: {
      present: false,
      type: '',
      left: {
        x: null,
        y: null
      },
      right: {
        x: null,
        y: null
      }
    }
  };
  this.player_step_count = 0;
  this.dialog_visible = false;

  this.actions = {
    none: function() {
      // no action key is depressed
      self.player.resetFrames();

    },

    navigateToTap: function(x, y) {
      nav_path = self.findPath(
        self.player.block_x,
        self.player.block_y,
        parseInt(x / BLOCK_WIDTH),
        parseInt(y / BLOCK_HEIGHT)
      );




      // DEPRECATED BUT KEEP FOR NOW
      var p = {
        x: self.player.relative_pixel_x,
        y: self.player.relative_pixel_y
      };
      var tap = {

        x: x - (BLOCK_WIDTH / 2),
        y: y - (BLOCK_HEIGHT / 2)
      };

      var at_target_x = (p.x > (tap.x - MOVE_AMOUNT)) && (p.x < (tap.x + MOVE_AMOUNT));
      var at_target_y = (p.y > (tap.y - MOVE_AMOUNT)) && (p.y < (tap.y + MOVE_AMOUNT));

      // base-case: xy target reached
      if (at_target_x && at_target_y) { return self.flushInput(); };

      // move to get into alignment with target x and y axes
      if (!at_target_x) { (p.x <= tap.x) ?
        self.registerKeypress(K.right) : self.registerKeypress(K.left); }
      if (!at_target_y) { (p.y >= tap.y) ?
        self.registerKeypress(K.up) : self.registerKeypress(K.down); }

      self.flushInput();
      self.unregisterClick();

    },

    showEntityDialog: function() {
      self.$overlay_container = $('<div class="overlay_container"></div>')
        .appendTo($app);
      self.$overlay_buttons = $('<div class="buttons"></div>')
        .appendTo(self.$overlay_container);
      self.$close_button = $('<div class="close"></div>')
        .appendTo(self.$overlay_buttons);
      self.dialog_visible = true;
      self.unregisterClick();
      self.flushInput();

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
  }

  this.findPath = function(x1, y1, x2, y2) {
    // console.log(x1, y1);
    // console.log(x2, y2);
    let unvisited_nodes = [];
    let visited_nodes = [];
    let PAD = 5;

    // construct bounding box which encompasses
    // x,y locations for both player and target
    bounding_box = {
      x1: (x1 < x2) ? x1 - PAD : x2 - PAD,
      y1: (y1 < y2) ? y1 - PAD : y2 - PAD,
      x2: (x1 < x2) ? x2 + PAD : x1 + PAD,
      y2: (y1 < y2) ? y2 + PAD : y1 + PAD
    };
    bounding_box.x1 = (bounding_box.x1 < 0) ? 0 : bounding_box.x1;
    bounding_box.y1 = (bounding_box.y1 < 0) ? 0 : bounding_box.y1;
    bounding_box.x2 = (bounding_box.x2 > BOUNDS_BLOCK_X) ?
      BOUNDS_BLOCK_X : bounding_box.x2;
    bounding_box.y2 = (bounding_box.y2 > BOUNDS_BLOCK_Y) ?
      BOUNDS_BLOCK_Y : bounding_box.y2;

    // calculate total x + y distance
    // from target node
    for (var row = bounding_box.y1; row < bounding_box.y2; row++) {
      for (var col = bounding_box.x1; col < bounding_box.x2; col++) {
        unvisited_nodes.push({
          name: col + '_' + row,
          block_x: col,
          block_y: row,
          distance_score: Math.abs(col - x2) + Math.abs(row - y2)
        })
      }
    }

    // sort nodes by total x + y
    // distance from target node
    unvisited_nodes = unvisited_nodes
      .sort((a, b) => (a.distance_score > b.distance_score) ? 1 : -1);

    console.log(unvisited_nodes);

  }

  this.registerKeypress = function(key_code) {
    for (var i = 0; i < ILLEGAL_COMBOS_LEN; i++) {
      this_combo = ILLEGAL_COMBOS[i];
      if (this.keys.pressed.indexOf(this_combo[0]) &&
        (target_index = this.keys.pressed.indexOf(this_combo[1]))) {
        this.keys.pressed.splice(target_index, 1);
      }
    }
    return ($.inArray(key_code, this.keys.pressed) < 0) ?
      this.keys.pressed.push(key_code) : false;

  }

  this.unregisterKeypress = function(key_code) {
    while (this.keys.pressed.indexOf(key_code) >= 0) {
      this.keys.pressed.splice(this.keys.pressed.indexOf(key_code), 1);
    }
    if (this.keys.pressed.length == 0) { this.actions.none(); }

  }

  this.flushInput = function() {
    this.keys.pressed = [];
    this.unregisterClick();
    this.actions.none();
    return true;
  }

  this.registerClick = function(e) {
    e.preventDefault();
    ct = self.mouse.click.type = (e.which === 1) ? 'left' : 'right';
    self.mouse.click.present = false;
    self.mouse.click[ct].x = parseInt(e.pageX - VIEWPORT_OFFSET.x - self.world.pixel_x)
    self.mouse.click[ct].y = parseInt(e.pageY - VIEWPORT_OFFSET.y - self.world.pixel_y)
    self.mouse.click[ct].x = (self.mouse.click[ct].x < 0) ? 0 : self.mouse.click[ct].x;
    self.mouse.click[ct].y = (self.mouse.click[ct].y < 0) ? 0 : self.mouse.click[ct].y;
    self.mouse.click.present = true;
  }

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
        action = 'self.actions.' + self.keys[self.keys.pressed[pressed_key_index]]
          .action;
        opts = self.keys[self.keys.pressed[pressed_key_index]].opts;
        eval(action)(opts);
      }
    }
    if (self.mouse.click.present) {
      if (self.mouse.click.type === 'left') {
        if (self.dialog_visible) {
          console.log("dialog click");
        } else {
          self.actions.navigateToTap(
            self.mouse.click.left.x,
            self.mouse.click.left.y
          );
        }
      } else {
        self.actions.showEntityDialog();
      }
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
