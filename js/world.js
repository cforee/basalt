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
  this.MAP_PIXEL_WIDTH = 0;
  this.MAP_PIXEL_HEIGHT = 0;
  this.MAP_BLOCK_WIDTH = 0;
  this.MAP_BLOCK_HEIGHT = 0;
  this.$elem = null;

  this.init = function() {
    w = self;
    self.$elem = $('<div class="map"></div>').appendTo($app);
    $.get(this.terrain_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      self.MAP_BLOCK_HEIGHT = rows.length;
      self.MAP_BLOCK_WIDTH = rows[0].length;
      self.MAP_PIXEL_HEIGHT = rows.length * BLOCK_HEIGHT;
      self.MAP_PIXEL_WIDTH = rows[0].length * BLOCK_WIDTH;
      $terrain = $('<div class="terrain"></div>').appendTo(self.$elem);
      self.$elem.css({ width: self.MAP_PIXEL_WIDTH, height: self.MAP_PIXEL_HEIGHT });
      $terrain.css({ width: self.MAP_PIXEL_WIDTH, height: self.MAP_PIXEL_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          for (var x = 0; x < rows[y].length; x++) {
            var block = OBJ[rows[y][x]];
            if (block) {
              $terrain.append('<div class="block ' + '_' + block.name + '" style="background-image: url(/assets/terrain/' + block.background_image + ');"></div>');
            }
          }
        }
      }
    });
    $.get(this.entity_map_name, function(data) {
      rows = $.map(data.split("\n"), function(datum) { if (datum.length > 0) return datum });
      $entities = $('<div class="entities"></div>').appendTo(self.$elem);
      self.$elem.css({ width: self.MAP_PIXEL_WIDTH, height: self.MAP_PIXEL_HEIGHT });
      $entities.css({ width: self.MAP_PIXEL_WIDTH, height: self.MAP_PIXEL_HEIGHT });
      for (var y = 0; y < rows.length; y++) {
        if (rows[y].length > 1) {
          m_row = []
          for (var x = 0; x < rows[y].length; x++) {
            var block = OBJ[rows[y][x]];
            m_row.push(block);
            if (block) {
              $entities.append('<div class="block ' + '_' + block.name + '" style="background-image: url(/assets/entities/' + block.background_image + '); background-color: ' + block.background_color + ';"></div>');
            }
          }
          BOUNDS_BLOCK_X = m_row.length;
          ENTITY_MAP.push(m_row);
        }
      }
    });
    BOUNDS_BLOCK_Y = ENTITY_MAP.length - 1;
    self.centerToViewport();
  };

  this.redraw = function() {
    self.$elem.css({
      left: this.pixel_x,
      top: this.pixel_y,
    });
  }

  this.centerToViewport = function() {
    this.pixel_x = ($(window).innerWidth() / 2) - (self.MAP_PIXEL_WIDTH / 2) - (BLOCK_WIDTH / 2);
    this.pixel_y = ($(window).innerHeight() / 2) - (self.MAP_PIXEL_HEIGHT / 2);
    this.redraw();
  }

  this.move = function(x, y) {
    this.pixel_x += x;
    this.pixel_y += y;
    self.$elem.css({ left: this.pixel_x, top: this.pixel_y });
  };

};
