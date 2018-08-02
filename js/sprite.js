Sprite = function(name) {
  this.name = name;
  this.pixel_x = null;
  this.pixel_y = null;
  this.block_x = null;
  this.block_y = null;
  this.$elem = null;

  this.init = function() {
    this.$elem = $('<div class="sprite _' + name + '"></div>').appendTo($app);
    this.center_to_viewport();
    elem_coords = this.$elem.position();
    // var map_elem = document.elementFromPoint(
    //   elem_coords.x,
    //   elem_coords.y
    // )
    // console.log(map_elem);

  }

  this.redraw = function() {

  }

  this.cycle_frames = function() {
  }

  this.center_to_viewport = function() {
    this.pixel_x = ($(window).innerWidth() / 2) - (BLOCK_WIDTH / 2);
    this.pixel_y = ($(window).innerHeight() / 2) - (BLOCK_HEIGHT / 2);
    this.$elem.css({ left: this.pixel_x, top: this.pixel_y });
  }

};
