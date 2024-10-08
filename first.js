    // 1

    const config = {};
const fps = 60;

(() => {

    // common

    const plane = (callback=false) => {
        const o = {
            w: 70,
            h: 70,
            x: 0,
            y: 0,
            img : 'player',
            speed: 4,
            bulletCooldown : 5 * fps,
        }

        if (!callback) {
            return o;
        }

        const data = callback(o);
        for (let key of Object.keys(data)){
            o[key] = data[key]
        }

        return o;
    }

    const planeAnimation = ()=>{
        return {
            loop : true,
            col : 1,
            row : 4,
            cooldown : 0.1 * fps,
        }
    }

    const bullet = (() => {
        return {
            w: 20,
            h: 10,
            x: 0,
            y: 0,
            speed : 4,
        };
    })

    const batchAdd = (url, name, count,ext) => {
        let images = {};
        for (let i = 1; i <= count; i++){
            images[name + i] = url + name + i +'.'+ ext;
        }
        return images;
    }


    const batchImport = (name, count) => {
        let images = [];
        for (let i = 1; i <= count; i++){
            images.push(name + i);
        }
        return images;
    };

    // config

    config.game = {
        w: 960,
        h: 480,
        fontSize : {
            min : 12,
            max : 30,
            val : 16,
        },

        // random cooldown index 0 - index 1

        appendEnemyCooldown: [2 * fps, 5 * fps],
        appendFriendCooldown : [2*fps,5*fps],
        appendFuelCooldown : [2*fps,5*fps],
        appendStarCooldown : [1*fps,2*fps],
    }

    config.fuelConfig = {
        fuelLoseSpeed: -1,
        fuelRaiseSpeed: 15,
        fuelMax: 30,
        beingHit : -15,
    }
    
    config.scoreConfig = {
        shootEnemy: 5,
        shootMeteorite: 10,
        shootFriend: -10,
    }

    config.data = ()=>{
        return {
            fuel: 15,
            score: 0,
            shoot: 0,
            time : 0,
            name : '',
        }
    }
    
    config.player = (() => {

        const { h } = config.game;

        const o = plane(o => {
            return {
                y: h / 2 - o.h / 2,
                bulletCooldown: 0.5 * fps,
                animation : planeAnimation(),
            }
        });

        return o;

    })();

    config.enemy = (() => {

        const { w } = config.game;

        const o = plane(o => {
            return {
                x: w + o.w,
                speed: -3,
                img : 'enemy',
                animation : planeAnimation(),
            }
        })

        return o;

    })();

    config.meteorite = (() => {

        const { w } = config.game;

        const o = plane(o => {
            return {
                w: 85,
                h : 85,
                x: w + o.w,
                speed: -3,
                img : batchImport('meteorites_', 4),
                life : 2,
            }
        })

        return o;

    })();

    config.friend = (() => {

        const { w } = config.game;

        const o = plane(o => {
            return {
                x: w + o.w,
                speed: -3,
                img : 'friend',
                animation : planeAnimation(),
            }
        })

        return o;

    })();

    config.fuel = (() => {

        const o = {
            w: 40,
            h: 40,
        };
        o.x = 0;
        o.y = -o.h;

        o.speed = -1;

        o.img = 'fuel';

        return o;

    })();

    config.star = (() => {

        const o = {};

        o.img = batchImport('star_', 12);

        return o;

    })();


    config.playerBullet = (() => {
        
        let o = bullet();
        o.img = 'playerBullet';

        return o;

    })();

    config.enemyBullet = (() => {
        
        let o = bullet();
        o.speed = -o.speed;
        o.img = 'enemyBullet';

        return o;

    })();

    config.planeDeathAnimation = {
        img: 'boom',
        loop : false,
        row: 4,
        col: 4,
        cooldown: 0.05 * fps,
    }

    config.bulletDeathAnimation = {
        img: 'boom',
        loop : false,
        row: 4,
        col: 4,
        cooldown: 0.01 * fps,
    }

    config.images = (() => {

        const path = './img/';

        let images = {
            boom: path + 'boom.png',
            player: path + 'plane/player.png',
            friend: path + 'plane/friend.png',
            enemy: path + 'plane/enemy.png',
            playerBullet: path + 'playerBullet.png',
            enemyBullet: path + 'enemyBullet.png',
            fuel: path + 'fuel2.png',
        };

        return Object.assign(
            batchAdd(path+'/star/','star_',12,'png'),
            batchAdd(path+'/meteorites/','meteorites_',4,'png'),
            images,
        )

    })();

    config.audios = (()=>{
        const path = './sound/';
        return {
            bg : path + 'background.mp3',
            destroyed : path + 'destroyed.mp3',
            shoot : path + 'shoot.mp3',
        }
    })();

})();

// 2


const log = console.log.bind(console);

const $ = elem => document.querySelector(elem);

const $s = elem => document.querySelectorAll(elem);

const style = (el, styleObj) => {
    for (let i in styleObj) {
        el.style[i] = styleObj[i];
    }
}

const on = (el, type, callback) => {
    el.addEventListener(type, callback);
}

const numberFormat = (num) => {
    const isPlus = num >= 0;
    const n = Math.abs(num);
    const res = n > 9 ? n : '0' + n;
    return isPlus ? res : `-${res}`;
};

const random = (end, start) => {
    return Math.floor(Math.random() * (end - start)) + start;
};

const randomArrayItem = (array) => {
    return array[random(0, array.length)];
};

const isArray = (array) => {
    return array instanceof Array;
}

const isImage = (img) => {
    return img instanceof Image;
}

const raf = (() => {

    let events = {};

    const reg = (id, callback) => {
        if (events[id]) {
            return console.error('id existed');
        }
        events[id] = callback;
    };

    const remove = (id) => {
        if (!events[id]) return;
        delete events[id];
    };

    const clearAll = () => {
        events = {};
    };

    const update = () => {
        for (const fn of Object.values(events)) {
            fn();
        }
        requestAnimationFrame(update);
    }

    update();

    return {
        reg: reg,
        remove: remove,
        clearAll: clearAll,
    }

})();

const hotkey = (() => {

    let data = {};

    const regKeyCode = (keyCode) => {
        data[keyCode] = {
            active: false,
            events: [],
        }
    }

    const loop = () => {
        for (let key of Object.keys(data)) {
            let event = data[key];
            if (!event.active) {
                continue;
            }
            event.events.forEach(el => {
                if (el.enable) {
                    el.callback();
                }
                if (el.once) {
                    el.enable = false;
                }
            });
        }
    };

    raf.reg('HotKey_loop', loop);

    on(window, 'keydown', e => {
        let keyCode = e.key.toLocaleUpperCase();
        if (!data[keyCode]) {
            return;
        }
        e.preventDefault();
        data[keyCode].active = true;
    });
    on(window, 'keyup', e => {
        let keyCode = e.key.toLocaleUpperCase();
        if (!data[keyCode]) {
            return;
        }
        data[keyCode].active = false;
        data[keyCode].events
            .filter((el) => el.once)
            .forEach(el => el.enable = true);
    });


    loop();


    return {
        reg: (keyCode, callback, once = false) => {
            keyCode = "" + keyCode;
            keyCode = keyCode.toLocaleUpperCase();
            if (!data[keyCode]) {
                regKeyCode(keyCode);
            }
            data[keyCode].events.push({
                once,
                callback,
                enable: true,
            })
        },
        clearAll: () => {
            data = {};
        }
    }

})();


const loadResource = (list, Obj, callback) => {
    const keys = Object.keys(list);
    const result = {};
    const len = keys.length;

    // Obj Type is Image or Audio
    
    const load = Obj === Image ? 'onload' : 'onloadedmetadata';
    let count = 0;
    const call = (obj, key) => {
        count++;
        result[key] = obj;
        if (len === count) {
            callback(result);
        }
    };
    keys.map((key) => {
        const obj = new Obj();
        obj.src = list[key];
        obj[load] = () => {
            call(obj, key)
        };
    });
}

const loadImages = (images, callback) => {
    return loadResource(images, Image, callback);
};

const loadAudios = (audios, callback) => {
    return loadResource(audios, Audio, callback);
};

const incrementAnimation = (start, end, callback) => {
    let current = start;
    const status = start < end;
    const time = setInterval(() => {
        status ? current++ : current--;
        callback(current);
        if (current === end) {
            clearInterval(time);
        }
    }, 30)
}

const localStorageData = (() => {

    const add = (key, obj) => {
        const item = get(key);
        item.data.push(obj);
        localStorage.setItem(key, JSON.stringify(item));
    }

    const get = (key) => {
        return JSON.parse(localStorage.getItem(key)) || {
            data: [],
        };
    }

    update = (key, data) => {
        localStorage.setItem(key, JSON.stringify({
            data,
        }));
    }

    return {
        add: add,
        get: get,
        update: update,
    }

})();


// 3

const res = (() => {
    
    let o = {};

    let _images = null;
    let _audios = null;


    let call = (callback) => {
        if (_images && _audios) {
            callback();
            o.loop('bg');
        }
    };

    o.imageBy = (key) => {
        return _images[key];
    }

    o.play = (key)=>{
        setTimeout(()=>{
            _audios[key].play();
        },50);
    }

    o.loop = (key)=>{
        _audios[key].loop = true;
    }
    
    o.pause = (key)=>{
        _audios[key].pause();  
    };

    o.end = (key)=>{
        _audios[key].currentTime = 0;
        _audios[key].pause();  
    };

    o.replay = (key)=>{
        o.end(key);
        o.play(key);
    }

    o.mute = ()=>{
        for (const el of Object.values(_audios)){
            el.muted = true;
        }
    }

    o.speak = ()=>{
        for (const el of Object.values(_audios)){
            el.muted = false;
        }
    }

    o.loadAssets = callback => {
        loadImages(config.images, images => {
            _images = images;
            call(callback);
        });
        loadAudios(config.audios, audios => {
            _audios = audios;
            call(callback);
        });
    };

    return o;

})();

// 4

class Scene{
    constructor(el,game) {
        this.el = $(el);
        this.game = game;
    }
    
    created(){
        
    }

    setup() {
        
    }

    uninstall(){
        
    }

    show() {
        this.el.classList.add('action');
    }

    hidden() {
        this.el.classList.remove('action');
    }
}

// 5 

class Cooldown{
    constructor(cooldown,notImmediately=false) {
        this.cooldown = notImmediately ? this.getCooldown(cooldown) : 0;
        this.initCooldown = cooldown;
    }

    getCooldown(cooldown) {
        if (isArray(this.initCooldown)) {
            return random.apply(null, this.initCooldown);
        }
        return cooldown;
    }

    update() {
        this.cooldown--;
        return this;
    }
    
    active(callback) {
        if (this.cooldown <= 0) {
            this.reset();
            callback();
        }
    }

    reset() {
        this.cooldown = this.getCooldown(this.initCooldown);
    }
}

// 6

class Element{
    constructor(scene) {
        this.scene = scene;
        this.run = true;
        this.enter = false;
        this.isDeath = false;
        this.life = 1;
        this.deg = 0;
        this.rotateState = false;
        this.rotateSpeed = 2;
        this.textRise = 15;
        this.text = "text";
    }

    setup(obj) {
        const _obj = config[obj];
        Object.keys(_obj).map((key) => {
            if (key === 'img') {
                if (isArray(_obj[key])) {
                    this.img = res.imageBy(randomArrayItem(_obj[key]));
                    return;
                }
                this.img = res.imageBy(_obj[key]);
                return;
            }
            this[key] = _obj[key]; 
        });
        if (this.animation){

            this.animation = Object.assign({
                img : this.img,
            },this.animation);

            this.runAnimation = new Animation(this.animation,this.scene,true);
        }
    }

    update() {
        this.run ? this.draw() : this._deathing();
        this.limitDetection();
    }

    limitDetection() {
        if (this.isEnter()) {
            this.enter = true;
        }
        if (this.enter) {
            if (this.isOut()) {
                this.isDeath = true; 
            } 
        }
    }

    getDrawInfo(isRotate=false) {
        return [
            this.img,
            isRotate ? -this.w/2 :this.x,
            isRotate ? -this.h/2 :this.y,
            this.w,
            this.h,
        ]
    }

    draw() {
        if (this.rotateState) {
            return this.rotate();
        }
        if (this.runAnimation){
            return this.runAnimation.play({
                x: this.x,
                y: this.y,
                w: this.w,
                h : this.h,
            });
        }
        this.scene.draw(this.getDrawInfo());
    } 

    drawText(callback) {
        this.setInitY();
        this.scene.setFontStyle();
        this.y--;
        this.scene.drawText({
            text: this.text,
            x: this.x,
            y : this.y,
        })
        if (this.initY - this.y > this.textRise) {
            callback && callback();
        }
    }

    rotate() {
        this.deg+=this.rotateSpeed;
        this.scene.rotateDraw({
            deg: this.deg,
            x: this.x + this.w / 2,
            y: this.y + this.h / 2,
            data: this.getDrawInfo(true),
        })
    }

    reduceLife() {
        this.life--;
        if (this.life <= 0) {
            this.death();
        }
    }

    death() {
        this.run = false; 
    }

    _deathing() {
        if (this.deathing) {
            this.deathing();
            return;
        }
        this.isDeath = true;
    }

    setInitY() {
        if (this.initY) {
            return;
        }
        this.initY = this.y;
    }

    isEnter() {
        const { w, h } = config.game;
        return (
            this.x > 0 &&
            this.y > 0 &&
            this.x < w &&
            this.y < h
        );
    }

    isOut() {
        const { w, h } = config.game;
        return (
            this.x < -this.w ||
            this.y < -this.h ||
            this.x > w ||
            this.y > h
        );
    }
    
}

// 7


class Animation{
    constructor(data,scene,debug) {
        this.img = isImage(data.img) ? data.img : res.imageBy(data.img);
        this.cooldown = new Cooldown(data.cooldown);
        this.col = data.col;
        this.row = data.row;
        this.loop = data.loop;
        this.w = this.img.width / this.row;
        this.h = this.img.height / this.col;
        this.index = 0;
        this.len = this.row * this.col;
        this.isEnd = false;
        this.scene = scene;
    }

    play(info) {
        if (this.isEnd) return this;
        this.draw(info);
        this.cooldown.update().active(() => {
            this.index++;
        });
        if (this.loop){
            if (this.index === this.len){
                this.index = 0;
            }
        }else{
            return this;
        }
    }

    getPos() {
        return {
            x: this.index % this.row,
            y : Math.floor(this.index / this.row),
        }
    }

    draw(info) {
        var pos = this.getPos();
        var x = pos.x * this.w;
        var y = pos.y * this.h;
        this.scene.draw([
            this.img,
            x,y,this.w,this.h,info.x,info.y,info.w,info.h,
        ]);
    }

    end(callback) {
        if (this.index === this.len) {
            this.isEnd = true;
            callback();
        }
    }
}

// 8

class Plane extends Element{ 
    constructor(scene) {
        super(scene);
    }

    setup(obj) {
        super.setup(obj);
        this.bulletCooldown = new Cooldown(config[obj].bulletCooldown);
        this.deathAnimation = new Animation(config.planeDeathAnimation,this.scene);
        this.canFire = true;
    }

    initBullet(bulletType,bulletArray) {
        this.bullet = class bullet extends Bullet{
            setup() {
                super.setup(bulletType);
            }
        }
        this.bullets = bulletArray;
    }

    update() {
        super.update();
        this.bulletCooldown.update().active(() => {
            this.canFire = true;
        });
    }

    move() {
        this.x += this.speed;
    }

    fire() {
        if (!this.canFire) {
            return;
        }
        this.canFire = false;
        const bullet = this.scene.factory(this.bullet);
        const isPlayer = this instanceof Player;
        bullet.x = isPlayer ? this.x + this.w : this.x;
        bullet.y = this.y + this.h/2 - bullet.h/2;
        this.bullets.push(bullet);
    }

    deathing() {
        this.deathAnimation.play({
            x: this.x,
            y: this.y,
            w: this.w,
            h : this.h,
        }).end(() => {
            this.isDeath = true;
        });
    }
}

// 9
class Bullet extends Element{
    setup(bulletType) {
        super.setup(bulletType);
        this.deathAnimation = new Animation(config.bulletDeathAnimation, this.scene);
    }

    update() {
        if (this.run) {
            this.move();
        }
        super.update();
    }

    move() {
        this.x += this.speed;
    }

    deathing() {
        this.deathAnimation.play({
            x: this.x,
            y: this.y,
            w: this.w,
            h : this.h * 1.5,
        }).end(() => {
            this.isDeath = true;
        });
    }
}

// 10

class Player extends Plane{
    
    setup() {
        super.setup('player');
        this.initBullet('playerBullet', this.scene.playerBullets);
        this.event();
    }

    up() {
        if (this.y <= 0) return;
        this.y-=this.speed;
    }
    left() {
        if (this.x <= 0) return;
        this.x-=this.speed;
    }
    right() {
        if (this.x+this.w >= config.game.w) return;
        this.x+=this.speed;
    }
    down() {
        if (this.y+this.h >= config.game.h) return;
        this.y+=this.speed;
    }

    event() {
        const called = callback=>{
            if (!this.run) return;
            if (this.scene.pauseFlag) return;
            if (this.scene.game.data.end) return;
            callback.call(this);
        };
        const keys = {
            'w': this.up,
            'a': this.left,
            's': this.down,
            'd': this.right,
        };
        Object.keys(keys).map((key) => {
            hotkey.reg(key, () => {
               called(keys[key]);
            }); 
        });
        
        hotkey.reg(' ', () => {
            called(()=>{
                res.replay('shoot');
                this.fire();
            });
        }, true);
    }
}

// 11

class Enemy extends Plane{
    
    setup() {
        const { w, h } = config.game;
        super.setup('enemy');
        this.y = random(0, h-this.h);
        this.initBullet('enemyBullet', this.scene.enemyBullets);
    }

    update() {
        if (this.run) {
            this.move();  
            if (this.isEnter()) {
                this.fire();
            }
        }
        super.update();
    }
}

// 12

class Meteorite extends Plane{
    
    setup() {
        const { w, h } = config.game;
        super.setup('meteorite');
        this.y = random(0, h-this.h);
        this.initBullet('enemyBullet', this.scene.enemyBullets);
        this.rotateState = true;
        this.rotateSpeed = -5;
    }

    update() {
        if (this.run) {
            this.move();  
            if (this.isEnter()) {
                this.fire();
            }
        }
        super.update();
    }
}

// 13

class Friend extends Plane{
    
    setup() {
        const { w, h } = config.game;
        super.setup('friend');
        this.y = random(0, h-this.h);
    }

    update() {
        if (this.run) {
            this.move();  
        }
        super.update();
    }
}

//14 

class Star extends Element{
    
    setup() {
        const { w, h } = config.game;
        super.setup('star');
        const size = this.img.width > 100 ? random(10,30)*0.01 : 1;
        this.w = this.img.width * size;
        this.h = this.img.height * size;
        this.speed = -this.w * 0.05;
        this.x = w + this.w;
        this.y = random(0, h - this.h);
        // this.rotateState = true;
        // this.rotateSpeed = -0.4;
    }

    move() {
        this.x += this.speed;
    }

    update() {
        this.move();
        super.update();
    }
}

// 15

class Fuel extends Plane{
    
    setup() {
        const { w, h } = config.game;
        super.setup('fuel');
        this.x = random(0, w / 2);
        this.rotateState = true;
        this.rotateSpeed = 0.5;
        this.textRise = 20;
        this.text = "+15";
    }

    move() {
        this.y -= this.speed;
    }

    update() {
        if (this.run) {
            this.move();
        }
        super.update();
    }  

    deathing() {
        this.drawText(() => {
            this.isDeath = true;
        }); 
    }
}

// 16

class Start extends Scene {
    setup() {
        super.setup();
        this.game.initData();
        this.event();
    }

    event() {
        const btn = $('#start-btn');
        on(
            btn,
            'click',
            () => {
                btn.setAttribute('disabled', 'disabled');
                res.loadAssets(() => {
                    this.game.play();
                    btn.removeAttribute('disabled');
                })
            }
        )
    }
}

// 17

class Play extends Scene {
    constructor(el,game){
        super(el,game);
        this.created();
    }
    created(){
        this.raf_id = 'play_update';
        this.initCanvas();
    }
    setup() {
        this.muteFlag = false;
        this.initData();
        this.initPlayer();
        this.updateTime();
        this.updateFuel();
        this.updateScore();
        this.updateFontSize();
        $("#logo").classList.add('play-status');
        this.event();
        this.start();
    }

    start() {
        this.pauseFlag = false;
        raf.reg(this.raf_id, this.update.bind(this));
        res.play('bg');
        $('#game-pause-btn').classList.add('active');
    }
    pause() {
        this.pauseFlag = true;
        raf.remove(this.raf_id);
        res.pause('bg');
        $('#game-pause-btn').classList.remove('active');
    }

    mute(){
        this.muteFlag = true;
        res.mute();
        $('#game-mute-btn').classList.add('active');
    }

    speak(){
        this.muteFlag = false;
        res.speak();
        $('#game-mute-btn').classList.remove('active');
    }

    uninstall() {
        raf.remove(this.raf_id);
        res.end('bg');
        $("#logo").classList.remove('play-status');
        hotkey.clearAll();
    }

    initData() {

        this.pauseFlag = false;

        this.timeCooldown = new Cooldown(fps, true);


        this.playerBullets = [];
        this.enemyBullets = [];
        this.allEnemys = [];
        this.enemys = {
            arr: this.allEnemys,
            elem: Enemy,
            cooldown: new Cooldown(config.game.appendEnemyCooldown),
        };
        this.meteorites = {
            arr: this.allEnemys,
            elem: Meteorite,
            cooldown: new Cooldown(config.game.appendEnemyCooldown),
        };
        this.friends = {
            arr: [],
            elem: Friend,
            cooldown: new Cooldown(config.game.appendFriendCooldown),
        };
        this.fuels = {
            arr: [],
            elem: Fuel,
            cooldown: new Cooldown(config.game.appendFriendCooldown),
        };
        this.stars = {
            arr: [],
            elem: Star,
            cooldown: new Cooldown(config.game.appendStarCooldown),
        };
    }

    collision(a, b, callback) {
        if (!a.run || !b.run) {
            return;
        }
        var yCoolision = (a, b) => {
            return a.y > b.y && a.y < b.y + b.h;
        };
        var xCoolision = (a, b) => {
            return a.x > b.x && a.x < b.x + b.w;
        };
        if (yCoolision(a, b) || yCoolision(b, a)) {
            if (xCoolision(a, b) || xCoolision(b, a)) {
                callback(a, b);
            }
        }
    }

    bulletCollision(bullet, arr, callback) {
        arr.forEach(el => {
            this.collision(bullet, el, (a, b) => {
                a.reduceLife();
                b.reduceLife();
                if (!b.run) {
                    callback(b);
                }
            });
        });
    }

    playerCollision(el, callback) {
        this.collision(this.player, el, () => {
            el.death();
            callback(el);
        });
    }

    factory(elem) {
        const o = new elem(this);
        o.setup();
        return o;
    }

    append(obj) {
        obj.cooldown.update().active(() => {
            obj.arr.push(
                this.factory(obj.elem)
            )
        });
    }

    appendElement() {
        this.append(this.enemys);
        this.append(this.meteorites);
        this.append(this.friends);
        this.append(this.fuels);
        this.append(this.stars);
    }

    updateing(arr, callback) {
        const len = arr.length;
        for (let i = len - 1; i >= 0; i--) {
            const el = arr[i];
            if (el.isDeath) {
                arr.splice(i, 1);
                continue;
            }
            el.update();
            callback && callback(el);
        }
    }

    updateBullets() {
        const {
            shootEnemy,
            shootMeteorite,
            shootFriend
        } = config.scoreConfig;
        const {
            beingHit
        } = config.fuelConfig;
        this.updateing(this.playerBullets, bullet => {
            this.bulletCollision(bullet, this.enemyBullets, (el) => {
                el.death();
            });
            this.bulletCollision(bullet, this.enemys.arr, (el) => {
                this.updateScore(
                    el instanceof Meteorite ?
                    shootMeteorite : shootEnemy
                );
                this.updateshoot();
                this.shoot();
            });
            this.bulletCollision(bullet, this.friends.arr, (el) => {
                this.updateScore(shootFriend);
                this.shoot();
            });
        });
        this.updateing(this.enemyBullets, bullet => {
            this.playerCollision(bullet, () => {
                this.updateFuel(beingHit);
            })
        });
    }

    updateEmenys() {
        const {
            shootEnemy,
            shootMeteorite,
        } = config.scoreConfig;
        const {
            beingHit
        } = config.fuelConfig;
        this.updateing(this.enemys.arr, enemy => {
            this.playerCollision(enemy, () => {
                this.updateScore(
                    enemy instanceof Meteorite ?
                    shootMeteorite : shootEnemy
                );
                this.updateFuel(beingHit);
                this.updateshoot();
                this.shoot();
            })
        });
    }

    updateFriends() {
        const {
            shootFriend
        } = config.scoreConfig;
        this.updateing(this.friends.arr, friend => {
            this.playerCollision(friend, () => {
                this.updateScore(shootFriend);
                this.shoot();
            })
        });
    }

    updateFuels() {
        const {
            fuelRaiseSpeed
        } = config.fuelConfig;
        this.updateing(this.fuels.arr, fuel => {
            this.playerCollision(fuel, () => {
                this.updateFuel(fuelRaiseSpeed);
            })
        });
    }

    updateStars() {
        this.updateing(this.stars.arr);
    }

    updateElements() {
        this.updateStars();
        this.player.update();
        this.updateEmenys();
        this.updateFriends();
        this.updateFuels();
        this.updateBullets();
    }

    update() {
        this.timeCooldown.update().active(() => {
            this.game.data.time++;
            this.updateTime();
            this.updateFuel(config.fuelConfig.fuelLoseSpeed);
        });

        this.ctx.clearRect(0, 0, config.game.w, config.game.h);

        this.appendElement();

        this.updateElements();
    }

    updateTime() {
        const game = this.game;
        $('#time').innerHTML = numberFormat(game.data.time);
    }

    updateFuel(num = 0) {
        const game = this.game;
        const {
            fuelMax,
            fuelLoseSpeed
        } = config.fuelConfig;
        const call = () => {
            $('#fuel').innerHTML = numberFormat(game.data.fuel);
            if (game.data.fuel <= 0) {
                this.game.over();
            }
        }
        if (num === 0) {
            return call();
        }
        if (num !== fuelLoseSpeed) {
            const start = game.data.fuel;
            const end = start + num;
            incrementAnimation(start, end, current => {
                if (current > fuelMax) {
                    current = fuelMax;
                }
                game.data.fuel = current;
                call();
            })
            return;
        }
        game.data.fuel += num;
        call();
    }

    updateScore(num = 0) {
        const game = this.game;
        const call = () => {
            $('#score').innerHTML = numberFormat(game.data.score);
        }
        if (num === 0) {
            return call();
        }
        const start = game.data.score;
        const end = start + num;
        incrementAnimation(start, end, current => {
            game.data.score = current;
            call();
        })
    }

    updateshoot() {
        const game = this.game;
        game.data.shoot++;
        $('#shoot').innerHTML = numberFormat(game.data.shoot);
    }

    updateFontSize(){
        $('.content .header .info').style.fontSize = config.game.fontSize.val + 'px';
    }

    initCanvas() {
        this.canvas = $('#canvas');
        this.canvas.width = config.game.w;
        this.canvas.height = config.game.h;

        this.ctx = this.canvas.getContext('2d');
    }

    initPlayer() {
        this.player = this.factory(Player);
    }

    draw(data) {
        this.ctx.drawImage.apply(this.ctx, data);
    }

    rotateDraw(conf) {
        this.ctx.save();
        this.ctx.translate(conf.x, conf.y);
        this.ctx.rotate(conf.deg * Math.PI / 180);
        this.draw(conf.data);
        this.ctx.restore();
    }

    setFontStyle(font = "20px Arial", yellow = "yellow") {
        this.ctx.font = font;
        this.ctx.fillStyle = yellow;
    }

    drawText(data) {
        this.ctx.fillText(data.text, data.x, data.y);
    }

    event() {
        const togglePause = ()=>{
            this.pauseFlag ? this.start() : this.pause();
        }
        const toggleMute = ()=>{
            this.muteFlag ? this.speak() : this.mute();
        }
        const fontSize = (status)=>{
            let {
                max,
                min,
                val
            } = config.game.fontSize;
            val += (status ? 1 : -1);
            if (val <= min || val >= max) return;
            config.game.fontSize.val = val;
            this.updateFontSize();
        }
        hotkey.reg('p', () => {
            togglePause();
        }, true);
        hotkey.reg('m', () => {
            toggleMute();
        }, true);
        on(
            $('#game-font-size-add'),
            'click',
            ()=>{
                fontSize(true);
            }
        )
        on(
            $('#game-font-size-reduce'),
            'click',
            ()=>{
                fontSize(false);
            }
        )
        on(
            $('#game-pause-btn'),
            'click',
            ()=>{
                togglePause()
            }
        )
        on(
            $('#game-mute-btn'),
            'click',
            ()=>{
                toggleMute()
            }
        )
    }

    shoot() {
        res.replay('destroyed');
    }
}

// 18

class Over extends Scene{
    setup() {
        
        this.game.data.end = true;

        this.updateView()

        this.event();
    }

    updateView(){
        const {
            time,
            score,
            shoot,
        } = this.game.data;
        $('#over .time').innerHTML = numberFormat(time);
        $('#over .score').innerHTML = numberFormat(score);
        $('#over .shoot').innerHTML = numberFormat(shoot);
    }

    event(){
        const btn = $('#submit-btn');
        const name = $('#name');
        on(
            btn,
            'click',
            ()=>{
                this.game.data.name = name.value;
                this.game.rank();
            }
        );

        on(
            name,
            'input',
            ()=>{
                const empty = name.value === '';
                const attr = empty ? 'setAttribute' : 'removeAttribute';
                btn[attr]('disabled','disabled');
            }
        )
    }
}

// 19

class Rank extends Scene {
    setup() {
        super.setup();
        this.event();
        this.storageDataKey = "gameData";
        this.addData();
        this.rank();
    }

    addData() {
        const key = this.storageDataKey;
        const {
            name,
            score,
            time,
        } = this.game.data;
        localStorageData.add(key, {
            name,
            score,
            time,
        });
    }

    rank() {
        const key = this.storageDataKey;
        let html = "";
        let position = 0;
        let data = [].concat(localStorageData.get(key).data);
        const some = (a, b) => {
            return (
                (a.score === b.score) && (a.time === b.time)
            );
        }
        data.sort((a, b) => {
            if (a.score === b.score) {
                return a.time < b.time ? 1 : -1;
            }
            return a.score < b.score ? 1 : -1;
        });
        setTimeout(() => {
            localStorageData.update(key, data);
            data.map((el, index) => {
                const prev = data[index - 1];
                if (prev) {
                    position += some(prev, el) ? 0 : 1;
                } else {
                    position++;
                }
                html += `
                 <tr>
                     <td>${numberFormat(position)}</td>
                     <td>${el.name}</td>
                     <td>${numberFormat(el.score)}</td>
                     <td>${numberFormat(el.time)}</td>
                 </tr>
             `;
            });
            $('#rank table tbody').innerHTML = html;
        }, 0);
    }

    event() {
        on(
            $('#restart-btn'),
            'click',
            () => {
                this.game.start();
            }
        )
    }
}

// 20

class Game {
    constructor() {
        this.setup();
    }

    setup() {
        this.initSize();
        this.initScenes();
    }

    initData() {
        this.data = config.data();
        this.data.end = false;
    }

    initSize() {
        const el = $('#app');
        style(
            el, {
                width: config.game.w + 'px',
                height: config.game.h + 'px',
            }
        );
    }

    initScenes() {
        this.scenes = {
            start: new Start('#start', this),
            play: new Play('#play', this),
            over: new Over('#over', this),
            rank: new Rank('#rank', this),
        }
    }

    toggleScene(scene) {
        if (this.scene === this.scenes[scene]) {
            return;
        }
        Object.keys(this.scenes).map(key => {
            this.scenes[key].hidden();
        });
        this.scene && this.scene.uninstall();
        this.scene = this.scenes[scene];
        this.scene.show();
        this.scene.setup();
    }

    start() {
        this.toggleScene('start');
    }

    play() {
        this.toggleScene('play');
    }

    over() {
        this.toggleScene('over');
    }

    rank() {
        this.toggleScene('rank');
    }

}

// 21

(() => {
    const game = new Game();
    game.start();
})();

         