$app = null;
$map = null;
$terrain = null;
$entities = null;
MOVE_AMOUNT = 1;
BLOCK_WIDTH = 55;
BLOCK_HEIGHT = 55;
MAP_WIDTH = 0;
MAP_HEIGHT = 0;

Sprite = function(starting_block_x, starting_block_y) {
  this.block_x = starting_block_x;
  this.block_y = starting_block_y;


};

World = function(map_name) {
  this.map_data = WORLDS.find(o => o.name === map_name);
  this.terrain_map_name = '../assets/mapfiles/' + this.map_data.map_terrain_id + '.txt'
  this.entity_map_name = '../assets/mapfiles/' + this.map_data.map_entity_id + '.txt'
  this.top_x = 0;
  this.top_y = 0;

  this.init = function() {
    $app = $('app');
    $map = $('<div class="map"></div>').appendTo($app);
    $.get(this.terrain_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      MAP_HEIGHT = rows.length * BLOCK_HEIGHT;
      MAP_WIDTH = rows[0].length * BLOCK_WIDTH;
      $terrain = $('<div class="terrain"></div>').appendTo($map);
      $map.css({ width: MAP_WIDTH, height: MAP_HEIGHT });
      $terrain.css({ width: MAP_WIDTH, height: MAP_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            var block = OBJ[rows[y][x]];
            if (block) {
              $terrain.append('<div class="block ' + '_' + block.name + '" style="background: ' + block.background_color + ';"></div>');
            }
          }
        }
      }
    });
    $.get(this.entity_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      MAP_HEIGHT = rows.length * BLOCK_HEIGHT;
      MAP_WIDTH = rows[0].length * BLOCK_WIDTH;
      $entities = $('<div class="entities"></div>').appendTo($map);
      $map.css({ width: MAP_WIDTH, height: MAP_HEIGHT });
      $entities.css({ width: MAP_WIDTH, height: MAP_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            var block = OBJ[rows[y][x]];
            if (block) {
              $entities.append('<div class="block ' + '_' + block.name + '" style="background: ' + block.background_color + ';"></div>');
            }
          }
        }
      }
    });
  };

  this.move = function(top_x, top_y) {
    this.top_x += top_x;
    this.top_y += top_y;
    $map.css({ left: this.top_x, top: this.top_y });
  };
};

Basalt = function() {
  var self = this;
  this.player = new Sprite(5,5);
  this.world = new World('starting_area');
  this.keys = $.extend(KEYS, { pressed: [] });

  this.actions = {
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

  this.register_keypress = function(key_code) {
    return ($.inArray(key_code, this.keys.pressed) < 0) ? this.keys.pressed.push(key_code) : false;
  };

  this.unregister_keypress = function(key_code) {
    while (this.keys.pressed.indexOf(key_code) >= 0) {
      this.keys.pressed.splice(this.keys.pressed.indexOf(key_code), 1);
    }
  };

  this.world.init();

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
  $.ajaxSetup({ cache: false })
  app = new Basalt();
});
