/**** Sprites ****/
var floor_sprite = [
    0,0,0,
    0,0,0,
    0,0,0
];

var human_sprite = [
    9,5,9,
    $,9,$,
    9,$,9
];

var wall_sprite = [
    3,3,3,
    3,3,3,
    3,3,3
];

var beast_sprite = [
    $,$,5,
    7,7,7,
    7,$,7
];

var door_sprite = [
    $,9,$,
    9,0,9,
    9,0,9
];

var stair_up_sprite = [
    0,0,5,
    0,7,7,
    9,9,9
];

var stair_down_sprite = [
    9,0,0,
    7,7,0,
    5,5,5
];

var skull_sprite = [
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,9,9,9,0,0,9,9,9,0,0,0,0,
    0,0,0,9,9,9,9,0,0,9,9,9,9,0,0,0,
    0,0,0,9,9,9,0,0,0,0,9,9,9,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,
    0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0,
    0,0,0,0,0,0,9,9,9,9,0,0,0,0,0,0,
    0,0,0,0,0,0,9,0,0,9,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0,
    0,0,0,9,9,9,9,9,9,9,9,9,9,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

/**** Thing class ****/

function Thing(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.wall = false;
    this.player = false;
    this.enemy = false;
    this.hp = 3;
    this.maxhp = 3;
    this.maxmp = 16;
}
Thing.prototype = {
    move: function(xdir, ydir) {
        if (this.dead) return false;
        var move_result = this.test_move(this.x+xdir, this.y+ydir);
        if (move_result == "moved") {
            this.level.remove(this);
            this.x += xdir;
            this.y += ydir;
            this.level.add(this);
            return true;
        } else if (move_result == "acted") {
            return true;
        } else {
            return false;
        }
    },

    test_move: function(x, y) {
        if (x >= 0 && x < W && y >= 0 && y < H) {
            for (var i = this.level.map[x][y].length-1; i >= 0; i--) {
                var thing = this.level.map[x][y][i];
                if (thing.wall) {
                    return "blocked";
                } else if (this.player && thing.enemy) {
                    thing.damage(this);
                    return "acted";
                } else if (this.enemy && thing.player) {
                    player.damage(this);
                    return "acted";
                } else if (this.enemy && thing.enemy) {
                    return "blocked";
                }
            }
            return "moved";
        } else {
            return "blocked";
        }
    },
    
    act: function() {
        var cell = this.level.map[this.x][this.y];
        for (var i = cell.length-1; i >= 0; i--) {
            var thing = cell[i];
            if (thing == this.level.stair_down) {
                this.level.remove(this);
                this.level = levels[this.level.depth+1];
                this.level.add(this);
            } else if (thing == this.level.stair_up) {
                this.level.remove(this);
                this.level = levels[this.level.depth-1];
                this.level.add(this);
            }
        }
        return true;
    },

    magic: function() {
        if (this.mp >= 1) {
            if (this.mp >= 5 && this.maxhp < 16) {
                this.maxhp++;
            }
            
            this.hp += Math.floor(this.mp/2);
            if (this.hp > this.maxhp) {
                this.hp = this.maxhp;
            }

            if (this.mp >= 10) { // Destroy everything adjacent.
                for (var i = this.x - 1; i <= this.x + 1; i++) {
                    for (var j = this.y - 1; j <= this.y + 1; j++) {
                        if (i >= 0 && i < W && j >= 0 && j < H) {
                            for (var t in this.level.map[i][j]) {
                                var thing = this.level.map[i][j][t];
                                if (thing.enemy || thing.wall) {
                                    this.level.remove(thing);
                                }
                            }
                        }
                    }
                }
            }

            if (this.mp >= 3) {
                var cell = this.level.free_cells.random();
                this.level.remove(this);
                this.x = cell[0];
                this.y = cell[1];
                this.level.add(this);
            }

            this.mp = 0;
            return true;
        } else {
            return false;
        }
    },

    damage: function(by) {
        this.hp--;
        if (this.hp == 0) {
            this.dead = true;
            this.level.remove(this);

            if (by && by.mp < by.maxmp) {
                by.mp++;
            }
        }
    },
}

Level = function(depth) {
    this.depth = depth;
    this.map = [
        [[],[],[],[],[]],
        [[],[],[],[],[]],
        [[],[],[],[],[]],
        [[],[],[],[],[]],
        [[],[],[],[],[]]
    ];
    this.free_cells = [];

    var maze_gen = new ROT.Map.EllerMaze(7, 7);
    maze_gen.create(this.make_wall.bind(this));

    if (depth > 0) {
        var x = levels[depth-1].stair_down.x;
        var y = levels[depth-1].stair_down.y;
        var cell = $.grep(this.free_cells, function(i) {return i[0] == x && i[1] == y})[0];
        if (this.free_cells.indexOf(cell) >= 0) {
            this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        }
        this.map[x][y].length = 0; // Make sure this cell is free of walls.
        this.stair_up = new Thing(x, y, stair_up_sprite);
        this.add(this.stair_up);
    }
    
    if (depth < numlevels - 1) {
        while (!this.stair_down) {
            var cell = this.free_cells.random();
            var x = cell[0];
            var y = cell[1];
            if (this.map[x][y].indexOf(this.stair_up) < 0) {
                this.stair_down = new Thing(x, y, stair_down_sprite);
                this.free_cells.splice(this.free_cells.indexOf(cell), 1);
            }
        }
        this.add(this.stair_down);
    }

    if (depth == 0) {
        this.add(player);
        var cell = $.grep(this.free_cells, function(i) {return i[0] == player.x && i[1] == player.y})[0];
        if (this.free_cells.indexOf(cell) >= 0) {
            this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        }
    }

    for (var i = 0; i < depth+1; i++) {
        var cell = this.free_cells.random();
        var x = cell[0];
        var y = cell[1];
        this.add(this.beast(x, y));
        this.free_cells.splice(this.free_cells.indexOf(cell), 1);
    }
}

Level.prototype = {
    make_wall: function(x, y, value) {
        if (x > 0 && y > 0 && x <= W && y <= H) {
            if (value != 0) {
                var wall = new Thing(x-1, y-1, wall_sprite);
                wall.wall = true;
                this.add(wall);
            } else {
                this.free_cells.push([x-1,y-1]);
            }
        }
    },

    beast: function(x, y) {
        var beast = new Thing(x, y, beast_sprite);
        beast.enemy = true;
        return beast;
    },

    add: function(thing) {
        this.map[thing.x][thing.y].push(thing);
        thing.level = this;
    },
    
    remove: function(thing) {
        this.map[thing.x][thing.y].splice(this.map[thing.x][thing.y].indexOf(thing), 1);
    },

    update: function() {
        this.free_cells = [];
        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                if (this.map[i][j].length == 0) {
                    this.free_cells.push([i,j]);
                }
                for (var t in this.map[i][j]) {
                    var thing = this.map[i][j][t];
                    if (thing.enemy) {
                        if (Math.random() > 0.5) {
                            thing.move(Math.floor((Math.random() - 1/3.0) * 3), 0);
                        } else {
                            thing.move(0, Math.floor((Math.random() - 1/3.0) * 3));
                        }
                    }
                }
            }
        }
    },
}

/**** Setup ****/
function setup() {
    window.W = 5;
    window.H = 5;
    window.small_canvas = document.createElement('canvas');
    small_canvas.width = small_canvas.height = 16;

    window.small_ctx = small_canvas.getContext("2d");

    window.canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;

    window.ctx = canvas.getContext("2d");
    ctx.scale(canvas.width/small_canvas.width, canvas.height/small_canvas.height);

    window.bmp = null
    restart();
}


function restart() {
    window.player = new Thing(0, 0, human_sprite);
    player.player = true;
    player.hp = 5;
    player.maxhp = 5;
    player.mp = 10;
    player.maxmp = 16;

    window.numlevels = 10;
    window.levels = [];
    for (var i = 0; i < numlevels; i++) {
        levels.push(new Level(i));
    }
    render();
}

/**** Rendering ****/
function draw_sprite(sprite, x, y, filter) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var idx = ((x*3+i) + (y*3+j) * 16) * 4;
            var c = sprite[i+j*3];
            if (c != $) {
                bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = c*25;
                bmp.data[idx+3] = 255;
            }
        }
    }
}

function draw_bigsprite(sprite) {
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            var idx = (i + j*16) * 4;
            console.log(i+j*16);
            //console.log(sprite[i+j*W]);
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = sprite[i+j*16]*25;
            bmp.data[idx+3] = 255;
        }
    }
}

function draw_health() {
    for (var i = 0; i < player.hp; i++) {
        var idx = (15 + i * 16) * 4;
        bmp.data[idx] = 255;
        bmp.data[idx+1] = bmp.data[idx+2] = 0;
        bmp.data[idx+3] = 255;
    }

    for (var i = 0; i < player.mp; i++) {
        var idx = (i + 15 * 16) * 4;
        bmp.data[idx] = bmp.data[idx+1] = 0;
        bmp.data[idx+2] = 255;
        bmp.data[idx+3] = 255;
    }
}

function clear_screen() {
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            var idx = (i + j * 16) * 4;
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = 0;
            bmp.data[idx+3] = 255;
        }
    }
}

function render() {
    small_ctx.webkitImageSmoothingEnabled = small_ctx.mozImageSmoothingEnabled = small_ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
    bmp = small_ctx.createImageData(16, 16);

    clear_screen();

    if (player.dead) {
        draw_bigsprite(skull_sprite);
    } else {
        for (var i = 0; i < W; i++) {
            for (var j = 0; j < H; j++) {
                draw_sprite(floor_sprite, i, j);
                if (player.level.map[i][j].length > 0) {
                    var thing = player.level.map[i][j][player.level.map[i][j].length-1];
                    draw_sprite(thing.sprite, i, j);
                }
            }
        }
        
        draw_health();
    }

    small_ctx.putImageData(bmp, 0, 0);
    
    ctx.drawImage(small_canvas, 0, 0);   

    var fav = $('<link rel="shortcut icon" type="image/png">');
    fav.attr('href', small_canvas.toDataURL('image/png'));
    $('head').append(fav);
}

$(window).keydown(function(evt) {
    //evt.preventDefault();
    var moved = false;
    if (evt.keyCode == 87 || evt.keyCode == 75 || evt.keyCode == 38) { // W|K|Up
        moved = player.move(0, -1);
    } else if (evt.keyCode == 83 || evt.keyCode == 74 || evt.keyCode == 40) { // S|J|Down
        moved = player.move(0, 1);
    } else if (evt.keyCode == 65 || evt.keyCode == 72 || evt.keyCode == 37) { // A|H|Left
        movded = player.move(-1, 0);
    } else if (evt.keyCode == 68 || evt.keyCode == 76 || evt.keyCode == 39) { // D|L|Right
        moved = player.move(1, 0);
    } else if (evt.keyCode == 82) { // R
        restart();
        return;
    } else if (evt.keyCode == 32) { // Space
        moved = player.act();
    } else if (evt.keyCode == 77) { // M
        moved = player.magic();
    } else {
        console.log(evt.keyCode);
    }
     
    if (moved) {
        player.level.update();
    }
    render();
});

$(function() {
    $('#toosmall').click(function(evt) {
        evt.preventDefault();
        if (!$('canvas').length) {
            $('#toosmall').after("<p>FINE.</p>");
            $('body').append(canvas);
        }
    });
    setup();
});
