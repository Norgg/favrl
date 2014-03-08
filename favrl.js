/**** Sprites ****/
var human_sprite = [
    9,9,9,
    0,9,0,
    9,0,9
];

var wall_sprite = [
    5,5,5,
    5,5,5,
    5,5,5
];

var beast_sprite = [
    0,0,7,
    7,7,7,
    7,0,7
];

var door_sprite = [
    0,9,0,
    9,0,9,
    9,0,9
];

var stair_up_sprite = [
    0,0,5,
    0,7,6,
    9,8,0
];

var stair_down_sprite = [
    9,0,0,
    8,7,0,
    0,6,5
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
}
Thing.prototype = {
    move: function(xdir, ydir) {
        if (this.dead) return;
        
        var move_result = this.test_move(this.x+xdir, this.y+ydir);
        if (move_result == "moved") {
            this.level.remove(this);
            this.x += xdir;
            this.y += ydir;
            this.level.add(this);
            return true;
        } else if (move_result == "down") {
            this.level.remove(this);
            this.x += xdir;
            this.y += ydir;
            this.level = levels[this.level.depth+1];
            this.level.add(this);
            return true;
        } else if (move_result == "up") {
            this.level.remove(this);
            this.x += xdir;
            this.y += ydir;
            this.level = levels[this.level.depth-1];
            this.level.add(this);
            return true;
        } else if (move_result == "acted") {
            return true;
        } else {
            return false;
        }
    },

    test_move: function(x, y) {
        if (x >= 0 && x < 5 && y >= 0 && y < 5) {
            for (var i in this.level.map[x][y]) {
                var thing = this.level.map[x][y][i];
                if (thing.wall) {
                    return "blocked";
                } else if (this.player && thing.enemy) {
                    thing.damage();
                    return "acted";
                } else if (this.enemy && thing.player) {
                    player.damage();
                    return "acted";
                } else if (this.enemy && thing.enemy) {
                    return "blocked";
                } else if (this.player && thing == this.level.stair_down) {
                    return "down";
                } else if (this.player && thing == this.level.stair_up) {
                    return "up";
                }
            }
            return "moved";
        } else {
            return "blocked";
        }
    },

    damage: function() {
        this.hp--;
        if (this.hp == 0) {
            this.dead = true;
            this.level.remove(this);
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

    if (depth > 0) {
        this.stair_up = new Thing(levels[depth-1].stair_down.x, levels[depth-1].stair_down.y, stair_up_sprite);
        this.add(this.stair_up);
    }
    
    if (depth < numlevels - 1) {
        while (!this.stair_down) {
            var x = Math.floor(Math.random()*5);
            var y = Math.floor(Math.random()*5);
            if (this.map[x][y].indexOf(this.stair_up) < 0) {
                this.stair_down = new Thing(x, y, stair_down_sprite);
            }
        }
        this.add(this.stair_down);
    }

    if (depth == 0) {
        this.add(player);
    }

    for (var i = 0; i < depth+1; i++) {
        var x = Math.floor(Math.random()*5);
        var y = Math.floor(Math.random()*5);
        this.add(this.beast(x, y));
    }
}

Level.prototype = {
    wall: function(x, y) {
        var wall = new Thing(x, y, wall_sprite);
        wall.wall = true;
        return wall;
    },

    beast: function(x, y) {
        var beast = new Thing(3, 2, beast_sprite);
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
}


/**** Setup ****/
var small_canvas = document.createElement('canvas');
small_canvas.width = small_canvas.height = 16;

var small_ctx = small_canvas.getContext("2d");

var canvas = document.createElement('canvas');
canvas.width = canvas.height = 128;

var ctx = canvas.getContext("2d");
ctx.scale(canvas.width/small_canvas.width, canvas.height/small_canvas.height);

var bmp = null

var player = new Thing(0, 0, human_sprite);
player.player = true;
player.hp = 10;
player.mp = 10;

var numlevels = 10;
var levels = [];
for (var i = 0; i < numlevels; i++) {
    levels.push(new Level(i));
}

/**** Rendering ****/
function draw_sprite(sprite, x, y) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var idx = ((x*3+i) + (y*3+j) * 16) * 4;
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = sprite[i+j*3]*25;
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

    for (var i in player.level.map) {
        for (var j in player.level.map[i]) {
            if (player.level.map[i][j].length > 0) {
                draw_sprite(player.level.map[i][j][player.level.map[i][j].length-1].sprite, i, j);
            }
        }
    }
    
    draw_health();

    small_ctx.putImageData(bmp, 0, 0);
    
    ctx.drawImage(small_canvas, 0, 0);   

    var fav = $('<link rel="shortcut icon" type="image/png">');
    fav.attr('href', small_canvas.toDataURL('image/png'));
    $('head').append(fav);
}

$(window).keydown(function(evt) {
    var moved = true;
    if (evt.keyCode == 87) { // W
        moved = player.move(0, -1);
    } else if (evt.keyCode == 83) { // S
        moved = player.move(0, 1);
    } else if (evt.keyCode == 65) { // A
        movded = player.move(-1, 0);
    } else if (evt.keyCode == 68) { // D
        moved = player.move(1, 0);
    } else {
        moved = false;
    }
    if (moved) {
        for (var i in player.level.map) {
            for (var j in player.level.map[i]) {
                for (var t in player.level.map[i][j]) {
                    var thing = player.level.map[i][j][t];
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
    render();
});
