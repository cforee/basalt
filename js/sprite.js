Sprite = function(name) {
  this.name = name;
  this.relative_pixel_x = null;
  this.relative_pixel_y = null;
  this.block_x = null;
  this.block_y = null;
  this.$elem = null;

  this.init = function() {
    this.$elem = $('<div class="sprite _' + name + '"></div>').appendTo($app);
    this.center_to_viewport();
  }

  this.redraw = function() {

  }

  this.cycle_frames = function() {
  }

  this.center_to_viewport = function() {
    var pixel_x = ($(window).innerWidth() / 2) - (BLOCK_WIDTH / 2);
    var pixel_y = ($(window).innerHeight() / 2) - (BLOCK_HEIGHT / 2);
    var relative_position = $('.map').position();
    this.relative_pixel_x = pixel_x - parseInt(relative_position.left);
    this.relative_pixel_y = pixel_y - parseInt(relative_position.top);
    this.$elem.css({ left: pixel_x, top: pixel_y });
  }

  this.set_block = function() {
    this.block_x = parseInt(this.relative_pixel_x / BLOCK_WIDTH);
    this.block_y = parseInt(this.relative_pixel_y / BLOCK_HEIGHT);
  }

  this.is_collision = function(distance_x, distance_y) {
    var temp_pixel_x = this.relative_pixel_x + distance_x;
    var temp_pixel_y = this.relative_pixel_y + distance_y;
    var block_x1 = parseInt((temp_pixel_x + MOVE_AMOUNT) / BLOCK_WIDTH);
    var block_y1 = parseInt((temp_pixel_y + MOVE_AMOUNT) / BLOCK_HEIGHT);
    var block_x2 = parseInt(((temp_pixel_x - (MOVE_AMOUNT / 2)) + BLOCK_WIDTH) / BLOCK_WIDTH);
    var block_y2 = parseInt(((temp_pixel_y - (MOVE_AMOUNT / 2)) + BLOCK_HEIGHT) / BLOCK_HEIGHT);

    // handle bounds
    if ((block_x2 < 1) || (block_y2 < 1)) { return true; }
    if ((block_x2 >= BOUNDS_BLOCK_X) || (block_y1 >= BOUNDS_BLOCK_Y)) { return true; }

    // handle non-traversable entities
    return (
      (ENTITY_MAP[block_y1][block_x1].walkable) &&
      (ENTITY_MAP[block_y2][block_x2].walkable) &&
      (ENTITY_MAP[block_y1][block_x2].walkable) &&
      (ENTITY_MAP[block_y2][block_x1].walkable)
    ) ? false : true;

  }

  this.move = function(distance_x, distance_y) {
    this.relative_pixel_x += distance_x;
    this.relative_pixel_y += distance_y;
    this.set_block();
  }

};
