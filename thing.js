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
            if (this.hp < this.maxhp) {
                this.hp++;
                used = true;
            }
        } else if (thing.mp_pot) {
            if (this.mp < this.maxmp) {
                this.mp++;
                used = true;
            }
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
