Sprite = function(name, sprite_path, num_frames) {
  this.name = name;
  this.relative_pixel_x = null;
  this.relative_pixel_y = null;
  this.block_x = null;
  this.block_y = null;
  this.$elem = null;
  this.SPRITE_PATH = sprite_path || '';
  this.SPRITE_FILE_EXTENSION = 'png';
  this.direction = 's';
  this.FRAMES_START = 1;
  this.FRAMES_END = num_frames || 2;
  this.frame_num = this.FRAMES_START;


  this.init = function(sprite_path, num_frames) {
    this.SPRITE_PATH = this.SPRITE_PATH || sprite_path;
    this.FRAMES_END = this.FRAMES_END || num_frames;
    this.$elem = $('<img class="sprite _' + name + '"/>').appendTo($app);
    this.centerToViewport();
    this.cycleFrames();
  }

  this.getFromPath = function() {
    return (this.SPRITE_PATH + this.direction + '_00' + this.frame_num + '0.' + this.SPRITE_FILE_EXTENSION);
  }

  this.cycleFrames = function() {
    if (this.frame_num > this.FRAMES_END) { this.frame_num = this.FRAMES_START };
    this.$elem.attr('src', this.getFromPath());
    this.frame_num++;
  }

  this.resetFrames = function() {
    this.frame_num = this.FRAMES_START;
    this.$elem.attr('src', this.getFromPath());
  }

  this.centerToViewport = function() {
    var pixel_x = ($app.innerWidth() / 2) - (BLOCK_WIDTH / 2);
    var pixel_y = ($app.innerHeight() / 2) - (BLOCK_HEIGHT / 2);
    var relative_position = $('.map').position();
    this.relative_pixel_x = pixel_x - parseInt(relative_position.left);
    this.relative_pixel_y = pixel_y - parseInt(relative_position.top);
    this.$elem.css({ left: pixel_x, top: pixel_y });
  }

  this.getViewportOffset = function() {
    var eo = this.$elem.offset();
    return { x: parseInt(eo.left - BLOCK_WIDTH), y: parseInt(eo.top - (BLOCK_HEIGHT / 2)) }
  }

  this.setDirection = function(direction) {
    this.direction = direction;
  }

  this.setBlock = function() {
    this.block_x = parseInt(this.relative_pixel_x / BLOCK_WIDTH);
    this.block_y = parseInt(this.relative_pixel_y / BLOCK_HEIGHT);
  }

  this.isCollision = function(distance_x, distance_y) {
    var temp_pixel_x = this.relative_pixel_x + distance_x;
    var temp_pixel_y = this.relative_pixel_y + distance_y;
    var block_x1 = parseInt((temp_pixel_x + (MOVE_AMOUNT / 2)) / BLOCK_WIDTH);
    var block_y1 = parseInt((temp_pixel_y + (MOVE_AMOUNT / 2)) / BLOCK_HEIGHT);
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
    this.setBlock();
  }

};
