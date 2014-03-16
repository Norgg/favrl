/**** Sprites ****/
var m = [0,0,9]; // magic
var _ = [9,0,0]; // health

var floor_sprite = [
    9,9,9,
    9,9,9,
    9,9,9
];

var dark_floor_sprite = [
    5,5,5,
    5,5,5,
    5,5,5
];

var unseen_sprite = [
    0,0,0,
    0,0,0,
    0,0,0
];

var human_sprite = [
    2,4,2,
    $,2,$,
    2,$,2
];

var badman_sprite = [
    4,2,4,
    $,4,$,
    4,$,4
];

var wall_sprite = [
    3,3,3,
    3,3,3,
    3,3,3
];

var beast_sprite = [
    $,$,5,
    3,3,3,
    3,$,3
];

var blob_sprite = [
    $,2,$,
    2,1,2,
    0,0,0
];

var treasure_sprite = [
    7,8,7,
    7,$,7,
    7,7,7
];

var mp_pot_sprite = [
    7,m,7,
    7,m,7,
    7,7,7
];

var hp_pot_sprite = [
    7,_,7,
    7,_,7,
    7,7,7
];

var portal_sprite = [
    $,5,$,
    5,1,5,
    5,1,5
];

var stair_up_sprite = [
    $,$,1,
    $,3,3,
    5,5,5
];

var stair_down_sprite = [
    8,2,2,
    5,5,2,
    3,3,3
];

var selected_sprite = [
    5,5,5,5,5,
    5,5,5,5,5,
    5,5,5,5,5,
    5,5,5,5,5,
    5,5,5,5,5
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

var win_sprite = [
    0,7,0,0,0,0,8,0,0,0,0,0,0,9,9,9,
    0,0,0,9,0,0,0,0,0,0,9,0,0,9,9,9,
    0,0,0,0,0,0,0,7,0,0,0,0,0,0,9,9,
    0,8,0,7,8,7,0,0,0,0,0,0,7,0,0,0,
    0,0,0,7,0,7,0,5,5,5,0,0,0,0,9,0,
    0,0,0,7,7,7,0,5,5,5,0,0,9,0,0,0,
    9,0,0,0,9,0,0,5,5,5,0,0,9,0,0,0,
    0,0,7,0,9,9,9,9,9,9,9,9,9,0,0,8,
    0,0,0,0,0,0,0,9,9,9,0,0,0,0,0,0,
    0,0,0,9,0,0,0,9,9,9,0,0,0,9,0,0,
    9,0,0,0,0,8,0,9,9,9,0,8,0,0,0,0,
    0,0,8,0,0,0,0,9,0,9,0,0,0,0,7,0,
    0,0,0,0,0,0,9,9,0,9,9,0,0,0,0,0,
    0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,
    0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,
    4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4
];


/**** Thing class ****/
function Thing(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.wall = false;
    this.player = false;
    this.enemy = false;
    this.hp = 1;
    this.maxhp = 1;
    this.maxmp = 16;
    this.inventory = [];
    this.selected = [0, 0];
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
            for (var i = this.level.map[x][y].length-1; i >= 0; i--) { // Check for blocking/acting items
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
                } else if (this.enemy && this.level != player.level && (thing == this.level.stair_up || thing == this.level.stair_down)) {
                    return "blocked"; // Don't let enemies wander onto the stairs while the player isn't there.
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
                this.level.checkfov();
                return false; // Don't update next floor after switching.
            } else if (thing == this.level.stair_up) {
                this.level.remove(this);
                this.level = levels[this.level.depth-1];
                this.level.add(this);
                this.level.checkfov();
                return false; // Don't update next floor after switching.
            } else if (thing.pickup) {
                if (this.inventory.length < INVW*INVH) {
                    this.inventory.push(thing);
                    this.level.remove(thing);
                    if (thing.treasure) {
                        // When the ring is picked up, spawn a bunch of blobs for the trip back up.
                        for (var lvl = 0; lvl < levels.length-1; lvl++) {
                            for (var count = 2; count >= 0; count--) {
                                var level = levels[lvl];
                                var cell = level.free_cells.random();
                                if (cell) {
                                    var blob = level.blob(cell[0], cell[1]);
                                    level.add(blob);
                                    level.free_cells.splice(level.free_cells.indexOf(cell), 1);
                                }
                            }
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else if (thing.portal) {
                for (var inv = 0; inv < this.inventory.length; inv++) {
                    var inv_thing = this.inventory[inv];
                    if (inv_thing.treasure) {
                        player.won = true;
                        return false; // Game finished, don't need to update stuff.
                    }
                }
                this.random_teleport();
            }
        }
        return false;
    },

    magic: function() {
        if (this.mp >= 1) {
            if (this.mp >= 2 && this.maxhp < 16) {
                this.maxhp += Math.max(1, Math.floor(this.mp/3));  // Add at least 1 maxhp, so casting every 2mp is still optimal but saving is more useful.
            }
            
            if (this.mp >= 4) { // Destroy everything adjacent.
                for (var i = this.x - 1; i <= this.x + 1; i++) {
                    for (var j = this.y - 1; j <= this.y + 1; j++) {
                        if (i >= 0 && i < W && j >= 0 && j < H) {
                            for (var t = 0; t < this.level.map[i][j].length; t++) {
                                var thing = this.level.map[i][j][t];
                                if (thing.enemy || thing.wall) {
                                    this.level.remove(thing);
                                }
                            }
                        }
                    }
                }
            }

            if (this.mp >= 1 && this.mp < this.maxmp) { // Teleport after destroying everything and only if we're not dropping down.
                this.random_teleport();
            }
            
            if (this.mp >= 6) { // Full heal.
                this.hp = this.maxhp;
            }
            
            if (this.mp == this.maxmp && this.level.depth < numlevels-1) { // Drop down a level and destroy everything there too.
                this.level.remove(this);
                this.level = levels[this.level.depth+1];
                this.level.add(this);

                for (var i = this.x - 1; i <= this.x + 1; i++) {
                    for (var j = this.y - 1; j <= this.y + 1; j++) {
                        if (i >= 0 && i < W && j >= 0 && j < H) {
                            for (var t = 0; t < this.level.map[i][j].length; t++) {
                                var thing = this.level.map[i][j][t];
                                if (thing.enemy || thing.wall) {
                                    this.level.remove(thing);
                                }
                            }
                        }
                    }
                }

            }

            this.mp = 0;
            return true;
        } else {
            return false;
        }
    },

    random_teleport: function() {
        var cell = this.level.free_cells.random();
        this.level.remove(this);
        this.x = cell[0];
        this.y = cell[1];
        this.level.add(this);
    },

    damage: function(by) {
        this.hurt = true;
        this.hp--;
        if (this.hp == 0) {
            this.dead = true;

            for (var i = 0; i < this.inventory.length; i++) {
                var thing = this.inventory[i];
                thing.x = this.x;
                thing.y = this.y;
                this.level.add(thing);
            }
            
            this.level.remove(this);
        }
    },

    inventory_select: function(xdir, ydir) {
        var selected_idx = (this.selected[0] + xdir) + (this.selected[1] + ydir) * INVH;
        if (selected_idx >= this.inventory.length) return;
        if (this.selected[0] + xdir < 0 || this.selected[0] + xdir >= INVW || this.selected[1] + ydir < 0 || this.selected[1].ydir >= INVH) return;

        this.selected[0] += xdir;
        this.selected[1] += ydir;
    },

    use_selected: function() {
        var selected_idx = this.selected[0] + this.selected[1] * INVH;
        var thing = this.inventory[selected_idx];
        if (!thing) return;

        var used = false;
        if (thing.hp_pot) {
            if (this.hp < this.maxhp) this.hp++;
            used = true;
        } else if (thing.mp_pot) {
            if (this.mp < this.maxmp) this.mp++;
            used = true;
        }
        if (used) {
            this.inventory.splice(selected_idx, 1);
        }

        if (!this.inventory[selected_idx]) {
            if (this.selected[0] > 0) {
                this.selected[0]--;
            } else if (this.selected[1] > 0) {
                this.selected[0] = INVH-1;
                this.selected[1]--;
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

    this.fov = new ROT.FOV.PreciseShadowcasting(this.transparent.bind(this));

    if (depth == 0) { // First level
        this.add(player);
        player.inventory.push(this.mp_pot());

        var cell = $.grep(this.free_cells, function(i) {return i[0] == player.x && i[1] == player.y})[0];
        if (this.free_cells.indexOf(cell) >= 0) {
            this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        }

        var cell = this.free_cells.random();
        this.portal = new Thing(cell[0], cell[1], portal_sprite);
        this.portal.portal = true;
        this.add(this.portal);
        this.free_cells.splice(this.free_cells.indexOf(cell), 1);
    } else { // Not first level
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
    
    if (depth == numlevels - 1) { // Last level
        var cell = this.free_cells.random();
        this.add(this.badman(cell[0], cell[1]));
        this.free_cells.splice(this.free_cells.indexOf(cell), 1);
    } else { // Not last level
        var cell = this.free_cells.random();
        this.stair_down = new Thing(cell[0], cell[1], stair_down_sprite);
        this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        this.add(this.stair_down);
    }

    if (depth > numlevels/2) {
        var cell = this.free_cells.random();
        if (cell) {
            this.add(this.blob(cell[0], cell[1]));
            this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        }
    }
    
    for (var i = 0; i < depth+1; i++) { // Add some enemies
        var cell = this.free_cells.random();
        if (cell) {
            this.add(this.beast(cell[0], cell[1]));
            this.free_cells.splice(this.free_cells.indexOf(cell), 1);
        }
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
        var roll = ROT.RNG.getUniform();
        if (roll < 0.3) {
            beast.inventory.push(this.hp_pot());
        } else if (roll < 0.6) {
            beast.inventory.push(this.mp_pot());
        }
        return beast;
    },

    blob: function(x, y) {
        var blob = new Thing(x, y, blob_sprite);
        blob.enemy = true;
        blob.hp = blob.maxhp = 2;
        var roll = ROT.RNG.getUniform();
        if (roll < 0.8) {
            blob.inventory.push(this.mp_pot());
        }
        return blob;
    },

    badman: function(x, y) {
        var badman = new Thing(x, y, badman_sprite);
        badman.enemy = true;
        badman.inventory.push(this.treasure());
        badman.hp = 4;
        badman.maxhp = 4;
        return badman;
     },

    hp_pot: function(x, y) {
        var pot = new Thing(x, y, hp_pot_sprite);
        pot.hp_pot = true;
        pot.pickup = true;
        return pot;
    },

    mp_pot: function(x, y) {
        var pot = new Thing(x, y, mp_pot_sprite);
        pot.mp_pot = true;
        pot.pickup = true;
        return pot;
    },

    treasure: function(x, y) {
        var treasure = new Thing(x, y, treasure_sprite);
        treasure.pickup = true;
        treasure.treasure = true;
        return treasure;
    },

    add: function(thing) {
        this.map[thing.x][thing.y].push(thing);
        thing.level = this;
    },
    
    remove: function(thing) {
        this.map[thing.x][thing.y].splice(this.map[thing.x][thing.y].indexOf(thing), 1);
    },

    checkfov: function() {
        if (player.level == this) {
            this.fov.compute(player.x, player.y, 5, function(x, y, r, visibility) {
                if (x >= 0 && y >= 0 && x < W && y < H) {
                    this.map[x][y].lit = true;
                    this.map[x][y].seen = true;
                    for (var t in this.map[x][y]) {
                        var thing = this.map[x][y][t];
                        if (thing.enemy) {
                            thing.sees_player = true;
                        }
                    }
                }
            }.bind(this));
        }
    },

    update: function() {
        var pathfind = new ROT.Path.AStar(player.x, player.y, this.passable.bind(this), {topology: 4});

        // Reset moved state of all enemies and lit state of map.
        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                this.map[i][j].lit = false;
                for (var t = 0; t < this.map[i][j].length; t++) {
                    var thing = this.map[i][j][t];
                    if (thing.enemy) thing.moved = false;
                }
            }
        }
        
        this.checkfov();

        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                for (var t = 0; t < this.map[i][j].length; t++) {
                    var thing = this.map[i][j][t];
                    if (thing.enemy) {
                        if (thing.moved) continue; // Make sure we don't double-process an enemy.
                        thing.moved = true;
                        if (thing.sees_player) {
                            var step = 0;
                            pathfind.compute(thing.x, thing.y, function(x, y) {
                                if (step == 1) {
                                    thing.move(x-thing.x, y-thing.y);
                                }
                                step++;
                            });
                        } else {
                            if (ROT.RNG.getUniform() > 0.5) {
                                thing.move(Math.floor((ROT.RNG.getUniform() - 1/3.0) * 3), 0);
                            } else {
                                thing.move(0, Math.floor((ROT.RNG.getUniform() - 1/3.0) * 3));
                            }
                        }
                        thing.sees_player = false;
                    }
                }
            }
        }

        // Update free cells.
        this.free_cells = [];
        for (var i = 0; i < this.map.length; i++) {
            for (var j = 0; j < this.map.length; j++) {
                if (this.map[i][j].length == 0) {
                    this.free_cells.push([i,j]);
                }
            }
        }
    },

    transparent: function(x, y) { // Whether light passes through this cell.
        if (x >= 0 && y >= 0 && x < W && y < H) {
            for (var t = 0; t < this.map[x][y].length; t++) {
                var thing = this.map[x][y][t]
                if (thing.wall) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },

    passable: function(x, y) { // Whether this cell can be traversed.
        if (x >= 0 && y >= 0 && x < W && y < H) {
            for (var t = 0; t < this.map[x][y].length; t++) {
                var thing = this.map[x][y][t]
                if (thing.wall) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },
}

/**** Setup ****/
function setup() {
    //ROT.RNG.setSeed(1341);
    
    window.W = 5;
    window.H = 5;
    window.INVW = 3;
    window.INVH = 3;
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
    player.mp = 3;
    player.maxmp = 8;
    window.tick = 0;

    window.numlevels = 10;
    window.levels = [];
    for (var i = 0; i < numlevels; i++) {
        levels.push(new Level(i));
    }
    levels[0].checkfov();
    render();
}

/**** Rendering ****/
function draw_pixel(idx, c) {
    if (c != $) {
        if (c.length) {
            bmp.data[idx] = c[0]*28;
            bmp.data[idx+1] = c[1]*28;
            bmp.data[idx+2] = c[2]*28;
            bmp.data[idx+3] = 255;
        } else {
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = c*28;
            bmp.data[idx+3] = 255;
        }
    }
}

function draw_sprite(sprite, x, y, filter) {
    if (!filter) {
        filter = function(px) { return px; };
    }
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var idx = ((x*3+i) + (y*3+j) * 16) * 4;
            draw_pixel(idx, filter(sprite[i+j*3]));
        }
    }
}

function draw_inventory_sprite(sprite, x, y, selected) {
    if (selected) {
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var idx = ((x*5+i) + (y*5+j) * 16) * 4;
                draw_pixel(idx, selected_sprite[i+j*5]);
            }
        }
    }
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var idx = ((x*5+i+1) + (y*5+j+1) * 16) * 4;
            draw_pixel(idx, sprite[i+j*3]);
        }
    }
}

function draw_big_sprite(sprite) {
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            var idx = (i + j*16) * 4;
            draw_pixel(idx, sprite[i+j*16]);
        }
    }
}

function draw_health() {
    var idx = (15 + (player.maxhp) * 16) * 4;
    draw_pixel(idx, 0);
    
    for (var i = 0; i < player.hp; i++) {
        var idx = (15 + i * 16) * 4;
        draw_pixel(idx, _);
    }

    var idx = (player.maxmp + (15 * 16)) * 4;
    draw_pixel(idx, 0);
    
    for (var i = 0; i < player.mp; i++) {
        var idx = (i + 15 * 16) * 4;
        draw_pixel(idx, m);
    }
}

function clear_screen() {
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            var idx = (i + j * 16) * 4;
            bmp.data[idx] = bmp.data[idx+1] = bmp.data[idx+2] = 255;
            bmp.data[idx+3] = 255;
        }
    }
}

function render() {
    small_ctx.webkitImageSmoothingEnabled = small_ctx.mozImageSmoothingEnabled = small_ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
    bmp = small_ctx.createImageData(16, 16);

    clear_screen();

    if (player.won) {
        draw_big_sprite(win_sprite);
    } else if (player.dead) {
        draw_big_sprite(skull_sprite);
    } else if (player.in_inventory) {
        for (var i = 0; i < player.inventory.length; i++) {
            var thing = player.inventory[i];
            var invx = i%INVW;
            var invy = Math.floor(i/INVW);
            var selected = (player.selected[0] == invx) && (player.selected[1] == invy)
            draw_inventory_sprite(thing.sprite, invx, invy, selected);
        }

        draw_health();
    } else {
        for (var i = 0; i < W; i++) {
            for (var j = 0; j < H; j++) {
                if (player.level.map[i][j].seen) {
                    if (player.level.map[i][j].lit) {
                        draw_sprite(floor_sprite, i, j);
                    } else {
                        draw_sprite(dark_floor_sprite, i, j);
                    }
                    for (var t = 0; t < player.level.map[i][j].length; t++) {
                        var thing = player.level.map[i][j][t];
                        if (player.level.map[i][j].lit || !thing.enemy) {
                            var filter = undefined;
                            if (thing.hurt) {
                                filter = function(px) {
                                    if (px == $) {
                                        return px;
                                    } else if (px.length) {
                                        return [px[0]+2, px[1], px[2]];
                                    } else {
                                        return [6, px, px];
                                    }
                                }
                            }
                            draw_sprite(thing.sprite, i, j, filter);
                        }
                    }
                } else {
                    draw_sprite(unseen_sprite, i, j);
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
    
    if (evt.keyCode == 82) { // R
        restart();
        return;
    }
    if (player.dead || player.won) return;

    var moved = false;
    if (evt.keyCode == 87 || evt.keyCode == 75 || evt.keyCode == 38) { // W|K|Up
        if (player.in_inventory) {
            player.inventory_select(0, -1);
        } else {
            moved = player.move(0, -1);
        }
    } else if (evt.keyCode == 83 || evt.keyCode == 74 || evt.keyCode == 40) { // S|J|Down
        if (player.in_inventory) {
            player.inventory_select(0, 1);
        } else {
            moved = player.move(0, 1);
        }
    } else if (evt.keyCode == 65 || evt.keyCode == 72 || evt.keyCode == 37) { // A|H|Left
        if (player.in_inventory) {
            player.inventory_select(-1, 0);
        } else {
            moved = player.move(-1, 0);
        }
    } else if (evt.keyCode == 68 || evt.keyCode == 76 || evt.keyCode == 39) { // D|L|Right
        if (player.in_inventory) {
            player.inventory_select(1, 0);
        } else {
            moved = player.move(1, 0);
        }
    } else if (evt.keyCode == 32) { // Space
        if (player.in_inventory) {
            moved = player.use_selected();
        } else {
            moved = player.act();
        }
    } else if (evt.keyCode == 77) { // M
        if (!player.in_inventory) {
            moved = player.magic();
        }
    } else if (evt.keyCode == 78) { // N
        if (!player.in_inventory) {
            moved = true;
        }
    } else if (evt.keyCode == 73) { // I
        player.in_inventory = !player.in_inventory;
    } else {
        //console.log(evt.keyCode);
    }
     
    if (moved) {
        player.hurt = false;
        tick++;
        for (var i = 0; i < levels.length; i++) {
            levels[i].update();
        }
    }
    render();

    for (var i = 0; i < player.level.map.length; i++) {
        for (var j = 0; j < player.level.map.length; j++) {
            for (var t = 0; t < player.level.map[i][j].length; t++) {
                var thing = player.level.map[i][j][t];
                if (thing.hurt) thing.hurt = false;
            }
        }
    }
});

$(function() {
    $('#toosmall').click(function(evt) {
        evt.preventDefault();
        if (!$('canvas').length) {
            $('#toosmall').after("<p>FINE.</p>");
            $('#wrap').append(canvas);
        }
    });
    setup();
});
