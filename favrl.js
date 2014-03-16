// favRL by Norgg, MIT licensed, but would love a shout on Twitter @Norgg if you use this for whatever reason.
// Jam code, sorry for lack of comments.

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

/**** Input ****/
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

/**** Onload ****/
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
