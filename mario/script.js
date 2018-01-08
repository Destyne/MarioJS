var Cell = function (y, x, image) {
    this.x = x;
    this.y = y;
    this.climb = false;
    this.peach = false;
    this.image = image;
    this.html = document.createElement('img');
    this.html.src = this.image;
    this.html.style.position = 'absolute';
    this.html.style.width = scale + 'px';
    document.body.appendChild(this.html);

    this.update = function () {
        // met Ã  jour la position de la cellule dans le DOM
    this.html.style.left = this.x * scale +'px';
    this.html.style.top = this.y * scale +'px';
    };
    this.checkCollision = function (cell)
    {
        if(!cell)
        { 
            return false;
        }
        if(this.x === cell.x && this.y === cell.y && this != cell)
        {
            return true;
        }
        return false;
    };
    this.die = function () {
        
        // dÃ©truit l'objet et le remove de la map
    };
    this.update();
};

var Mario = function (y, x, image) {
    // Mario hÃ©rite de Cell
    var mario = this;
    Cell.call(this, y, x, image);
    this.falling = false;
    this.input = new Input(['ArrowLeft', 'ArrowRight', 'Space']);
    this.jump = {
        power: 0, // hauteur du saut en nombre de cellules
        interval: null // identifiant de l'intervalle de temps entre chaque animations du saut
    };
    this.makeJump = function () {
        mario.y--;
        mario.jump.power--;
        
        var check = map.checkCollision(mario);
        if(mario.jump.power === 0 || (check instanceof Cell && !check.climb)){
            clearInterval(mario.jump.interval);
            mario.jump.interval = null;
            mario.falling = true;
        }
        // mario monte d'une case s'il le peut et s'il lui reste du power
        // s'il ne le peut pas, il met fin Ã  l'intervalle de temps entre chaque animation du saut
        // mario met Ã  jour le dom Ã  chaque animation de saut
        // si mario saute dans un koopa, il meurt
    };
    this.fall = function () {
        if(mario.jump.interval){
            return;
        }
        old_y = mario.y;
        mario.y++;
        mario.falling = true;
        var check = map.checkCollision(mario)
         if(check){
            if(check instanceof Koopa){
                check.die();
            } else {
                mario.y = old_y;
                mario.falling = false;
            }

        }

    };

    this.die = function () {
        var zic = new Audio("asset/mort.wav");
        zic.play();
        clearInterval(this.interval);
        map.delete(this);
        alert("defaite");
        location.reload();
        // mario met fin Ã  son intervalle d'animations
        // mario est retirÃ© de la map
    };
    this.move = function () {
        var hold_x = mario.x;
        var musique = new Audio("asset/jump.wav");

        if(mario.input.keys.ArrowLeft.isPressed || mario.input.keys.ArrowLeft.pressed ){
            mario.x--;
            mario.input.keys.ArrowLeft.pressed = false;
        }

        if(mario.input.keys.ArrowRight.isPressed || mario.input.keys.ArrowRight.pressed ){
            mario.x++;
            mario.input.keys.ArrowRight.pressed = false;
        }

        if(mario.input.keys.Space.isPressed || mario.input.keys.Space.pressed ){       
            if(mario.falling == false){
                mario.jump.power = 3;
                mario.falling = true;
                mario.jump.interval =  setInterval(mario.makeJump, 100);
                musique.play();
            }
            mario.input.keys.Space.pressed = false;
        }

        check = map.checkCollision(mario);
        if(check instanceof Cell && check.peach){
            var zic = new Audio("asset/clear.wav");
            zic.play();
            alert("victoire");
            location.reload();

        }

        if(check){
            mario.x = hold_x;
        }
        // si l'Input est flÃ¨che de gauche, mario se dÃ©place Ã  gauche s'il le peut
        // si l'Input est flÃ¨che de droite, mario se dÃ©place Ã  droite s'il le peut
        // si l'Input est espace, mario commence un saut
        // si mario rencontre un koopa aprÃ¨s son dÃ©placement, il meurt
    };

    this.interval = setInterval(function () {
        mario.fall();
        mario.move();
        mario.update();
    }, 100);
};

var Koopa = function (y, x, image) {
    // Koopa hÃ©rite de Cell
    var koopa = this;
    Cell.call(this, y, x, image);
    this.direction = 'left';

    this.die = function() {
        var musique = new Audio("asset/killmob.wav");
        musique.play();
        clearInterval(this.interval);
        map.delete(this);
        // koopa met fin Ã  son intervalle d'animations
        // koopa est retirÃ© de la map
    };
    this.move = function () {
        old_x = this.x;

        if(this.direction === 'left'){
            this.x--;
        }
        if(this.direction === 'right'){
            this.x++;
        }
            check = map.checkCollision(this);
            if(check instanceof Mario){
                check.die();
            }
        if(check){
            this.x = old_x;
            if(this.direction === 'left'){
                this.direction = 'right'
            }
            else{
                this.direction = 'left'
            }   
        }
        check = map.checkCollision(koopa);
        if(check){
            koopa.x = old_x;
        }
// koopa se dÃ©place en direction de direction s'il le peut
        // sinon il change de direction
        // si koopa recontre mario, mario meurt
    };
    this.fall = function () {
        old_y = this.y;
        this.y++;
        check = map.checkCollision(koopa);
        if(check){
            this.y = old_y;
        }
        // koopa se dÃ©place d'une cellule vers le bas s'il le peut
    };
    this.interval = setInterval(function () {
        koopa.fall();
        koopa.move();
        koopa.update();
    }, 200);
}

var Input = function (keys) {
    this.keys = {};
    for(i = 0; i < keys.length; i++){
        this.keys[keys[i]] = {};
        this.keys[keys[i]].isPressed =false;
        this.keys[keys[i]].pressed =false;
    }
    var input = this;
    window.addEventListener("keydown", function(e){
        e = e || window.event;
        if(typeof input.keys[e.code] !== 'undefined'){
            input.keys[e.code].isPressed = true;
            input.keys[e.code].pressed = true;
        }
    });
    window.addEventListener("keyup", function(e){
        e = e || window.event;
        if(typeof input.keys[e.code] !== 'undefined'){
            input.keys[e.code].isPressed = false;
    // Input rÃ©cupÃ¨re les touches actives du clavier
        }
    });
}
var Map = function (model) {
    this.map = [];
    this.generateMap = function () {
        for( var y = 0; y < model.length ; y++){
            for(var x = 0; x < model[y].length; x++){
                var letter = model[y][x];
                if(letter == 'c'){
                    var climb = new Cell(y, x, "asset/echelle.png");
                    climb.climb = true;
                    this.map.push(climb);
                }
                if(letter == 'b'){
                    this.map.push(new Cell(y, x, "asset/mur.gif"));
                }
                if(letter == 'w'){
                 this.map.push(new Cell(y, x, "asset/glaceblok.gif"));
                }
                else if(letter == 'k'){
                    this.map.push(new Koopa(y, x, "asset/kuppa.png"));
                }
                else if(letter == 'm'){
                    this.map.push(new Mario(y, x, "asset/mario.png"));
                }
                else if(letter == 'p'){
                    var peach = new Cell(y, x, "asset/peach.png");
                    peach.peach = true;
                    this.map.push(peach);
                }
            }
        }
        // instancie les classes correspondants au schema
        // avec :
        //      w => Cell
        //      k => Koopa
        //      m => Mario
    };
    this.checkCollision = function (cell) {
        for(var i = 0; i < this.map.length; i++) {
            if(cell.checkCollision(this.map[i])){
                return this.map[i];
            }
        }
        return false;
        // parcourt la map et renvoie la cellule aux mÃªmes coordonnÃ©es que cell
    };
    this.delete = function (cell) {
        this.map.splice(this.map.indexOf(cell),1);
        document.body.removeChild(cell.html);
        delete cell;
    };
};

var schema = [
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
'b                                      b',
'bp               w                k   cb',
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww   cb',
'b                                     cb',
'b                                     cb',
'b                                     cb',
'b                                     cb',
'b                                     cb',
'b          k    w                     cb',
'wwwwwwwwwwwwwwwww                     cb',
'b                   w           k      b',
'b             wwww  wwwwwwwwwwwwwwwwwwww',
'b            ww                        b',
'b           ww                         b',
'b          www                         b',
'b         wwww                         b',
'bm       wwwww k     w      k          b',
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'
];
var scale = 20;
var map = new Map(schema);
map.generateMap();
