WORLDS = [
  {
    name: 'starting_area',
    map_terrain_id: 't_0010',
    map_entity_id: 'e_0010'
  }
]

World = function(map_name) {
  var self = this;
  this.map_data = WORLDS.find(o => o.name === map_name);
  this.terrain_map_name = '../assets/mapfiles/' + this.map_data.map_terrain_id + '.txt'
  this.entity_map_name = '../assets/mapfiles/' + this.map_data.map_entity_id + '.txt'
  this.pixel_x = 0;
  this.pixel_y = 0;
  this.MAP_WIDTH = null;
  this.MAP_HEIGHT = null;
  this.$elem = null;

  this.init = function() {
    $app = $('app');
    self.$elem = $('<div class="map"></div>').appendTo($app);
    $.get(this.terrain_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      self.MAP_HEIGHT = rows.length * BLOCK_HEIGHT;
      self.MAP_WIDTH = rows[0].length * BLOCK_WIDTH;
      $terrain = $('<div class="terrain"></div>').appendTo(self.$elem);
      self.$elem.css({ width: self.MAP_WIDTH, height: self.MAP_HEIGHT });
      $terrain.css({ width: self.MAP_WIDTH, height: self.MAP_HEIGHT });
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
      self.MAP_HEIGHT = rows.length * BLOCK_HEIGHT;
      self.MAP_WIDTH = rows[0].length * BLOCK_WIDTH;
      $entities = $('<div class="entities"></div>').appendTo(self.$elem);
      self.$elem.css({ width: self.MAP_WIDTH, height: self.MAP_HEIGHT });
      $entities.css({ width: self.MAP_WIDTH, height: self.MAP_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            var block = OBJ[rows[y][x]];
            if (block) {
              $entities.append('<div class="block ' + '_' + block.name + '" style="background: ' + block.background_color + ';" data-x="' + x + '" data-y="' + y + '"></div>');
            }
          }
        }
      }
    });
    this.center_to_viewport();
  };

  this.redraw = function() {
    self.$elem.css({
      left: this.pixel_x,
      top: this.pixel_y,
    });
  }

  this.center_to_viewport = function() {
    console.log("GOT HERE");
    console.log(self.MAP_WIDTH);
    this.pixel_x = 0 - (self.MAP_WIDTH / 2);
    this.pixel_y = 0 - (self.MAP_HEIGHT / 2);
    this.redraw();
  }

  this.move = function(x, y) {
    this.pixel_x += x;
    this.pixel_y += y;
    self.$elem.css({ left: this.pixel_x, top: this.pixel_y });
  };

};
