$app = null;
$map = null;
MOVE_AMOUNT = 1;
BLOCK_WIDTH = 55;
BLOCK_HEIGHT = 55;

Sprite = function(starting_block_x, starting_block_y) {
  this.block_x = starting_block_x;
  this.block_y = starting_block_y;
};

World = function(map_name) {
  var self = this;
  self.map_data = WORLDS.find(o => o.name === map_name);
  self.terrain_map_name = '../assets/mapfiles/' + self.map_data.map_terrain_id + '.txt'
  self.entity_map_name = '../assets/mapfiles/' + self.map_data.map_terrain_id + '.txt'
  self.top_x = 0;
  self.top_y = 0;

  this.init = function() {
    $app = $('app');
    $map = $('<div class="map"></div>').appendTo($app);
    $.get(self.terrain_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      $map.css({ width: rows[0].length * BLOCK_WIDTH, height: rows.length * BLOCK_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            this_terrain = OBJ[rows[y][x]];
            $map.append('<div class="terrain ' + '_' + this_terrain.name + '" style="background: ' + this_terrain.background_color + ';"></div>');
          }
        }
      }
    });
    $.get(self.entity_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      $map.css({ width: rows[0].length * BLOCK_WIDTH, height: rows.length * BLOCK_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            this_entity = OBJ[rows[y][x]];
            $map.append('<div class="terrain ' + '_' + this_entity.name + '" style="background: ' + this_entity.background_color + ';"></div>');
          }
        }
      }
    });
  };

  this.move = function(top_x, top_y) {
    this.top_x += top_x;
    this.top_y += top_y;
    $map.css({
      left: this.top_x,
      top: this.top_y
    });
  };
};

Basalt = function() {
  var self = this;
  self.player = new Sprite(5,5);
  self.world = new World('starting_area');
  self.keys = $.extend(KEYS, { pressed: [] });

  self.actions = {
    move: function(opts) {
      switch(opts.direction) {
        case 'n':
          self.world.move(0, MOVE_AMOUNT);
          break;
        case 'e':
          self.world.move(-MOVE_AMOUNT, 0);
          break;
        case 's':
          self.world.move(0, -MOVE_AMOUNT);
          break;
        case 'w':
          self.world.move(MOVE_AMOUNT, 0);
          break;
      }
    },
  };

  self.register_keypress = function(key_code) {
    return ($.inArray(key_code, self.keys.pressed) < 0) ? self.keys.pressed.push(key_code) : false;
  };

  self.unregister_keypress = function(key_code) {
    while (self.keys.pressed.indexOf(key_code) >= 0) {
      self.keys.pressed.splice(self.keys.pressed.indexOf(key_code), 1);
    }
  };

  self.world.init();

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
