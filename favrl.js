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

var empty_sprite = [
    0,0,0,
    0,0,0,
    0,0,0
];

var beast_sprite = [
    0,0,9,
    9,9,9,
    9,0,9
];

var door_sprite = [
    0,9,0,
    9,0,9,
    9,0,9
];

var stair_up_sprite = [
    0,0,9,
    0,9,9,
    9,9,0
];

var stair_down_sprite = [
    9,0,0,
    9,9,0,
    0,9,9
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
            this.remove();
            this.x += xdir;
            this.y += ydir;
            this.add();
            return true;
        } else if (move_result == "acted") {
            return true;
        } else {
            return false;
        }
    },

    test_move: function(x, y) {
        if (x >= 0 && x < 5 && y >= 0 && y < 5) {
            for (var i in map[x][y]) {
                var thing = map[x][y][i];
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
            this.remove();
        }
    },

    remove: function() {
        map[this.x][this.y].splice(map[this.x][this.y].indexOf(this), 1);
    },

    add: function() {
        map[this.x][this.y].push(this);
    },
}

function wall(x, y) {
    var wall = new Thing(x, y, wall_sprite);
    wall.wall = true;
    return wall;
}

/**** Setup ****/
var canvas = document.createElement('canvas');
canvas.width = canvas.height = 16;
$(function() {
    //document.body.appendChild(canvas);
    render();
});

var ctx = canvas.getContext("2d");
var bmp = ctx.getImageData(0, 0, canvas.width, canvas.height);

var player = new Thing(0, 0, human_sprite);
player.player = true;
player.hp = 10;
player.mp = 10;
var stair_down = new Thing(2, 2, stair_down_sprite);
var beast = new Thing(3, 2, beast_sprite);
beast.enemy = true;
var things = [
    player, stair_down, beast, wall(1, 0), wall(1, 1), wall(1, 2), wall(1, 3), wall(2, 3), wall(3, 3), wall(3, 1)
];

var map = [
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]],
    [[],[],[],[],[]]
]

for (var i in things) {
    var t = things[i];
    map[t.x][t.y].push(t);
}

/**** Rendering ****/
function draw_sprite(sprite, x, y) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var idx = ((x*3+i) + (y*3+j) * canvas.width) * 4;
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = sprite[i+j*3]*25;
            bmp.data[idx+3] = 255;
        }
    }
}

function draw_health() {
    for (var i = 0; i < player.hp; i++) {
        var idx = (15 + i * canvas.width) * 4;
        bmp.data[idx] = 255;
        bmp.data[idx+1] = bmp.data[idx+2] = 0;
        bmp.data[idx+3] = 255;
    }

    for (var i = 0; i < player.mp; i++) {
        var idx = (i + 15 * canvas.width) * 4;
        bmp.data[idx] = bmp.data[idx+1] = 0;
        bmp.data[idx+2] = 255;
        bmp.data[idx+3] = 255;
    }
}

function render() {
    canvas.width = canvas.width;
    bmp = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (var i in map) {
        for (var j in map[i]) {
            if (map[i][j].length == 0) {
                draw_sprite(empty_sprite, i, j);
            } else {
                draw_sprite(map[i][j][map[i][j].length-1].sprite, i, j);
            }
        }
    }
    
    draw_health();

    ctx.putImageData(bmp, 0, 0);

    var fav = $('<link rel="shortcut icon" type="image/png">');
    fav.attr('href', canvas.toDataURL('image/png'));
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
        beast.move(Math.floor((Math.random() - 1/3.0) * 3), Math.floor((Math.random() - 1/3.0) * 3));
    }
    render();
});

