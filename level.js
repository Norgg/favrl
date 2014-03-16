/**** Level class ****/
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
