/// <reference path="../../typings/index.d.ts"/>

module MadnessGame {
    'use strict';

    class HomeController {
        game: any;
        gameState: any;
        ship: any;
        physics: any;
        controls: any;
        bullet: any;
        bullets: any;
        bulletTime: number;
        enemy: any;
        explosion: any;
        explosions: any;

        constructor($scope, $window) {
            this.gameState = { 
                preload: this.preload, 
                create: this.create, 
                update: this.update,
                screenWrap: this.screenWrap,
                fireBullet: this.fireBullet,
                collisionHandler: this.collisionHandler,
                setupEnemy: this.setupEnemy
            };
            this.game = new Phaser.Game($window.innerWidth, $window.innerHeight, Phaser.AUTO, 'enjin-game', this.gameState);
        }

        preload() {
            this.game.load.image('space', 'img/space.jpg');
            this.game.load.image('ship', 'img/ship.png');
            this.game.load.image('bullet', 'img/bullets.png');
            this.game.load.image('enemy', 'img/enemy.png');
            this.game.load.spritesheet('kaboom', 'img/explode.png', 128, 128);
        }
        
        create() {
            // Setup Game
            this.game.renderer.clearBeforeRender = false;
            this.game.renderer.roundPixels = true;
            this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            this.physics.startSystem(Phaser.Physics.ARCADE);

            // Set Background
            this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'space');

            // Create Bullets
            this.bulletTime = 0;
            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(10, 'bullet');
            this.bullets.setAll('anchor.x', 0.5);
            this.bullets.setAll('anchor.y', 0.5);
            this.bullets.setAll('outOfBoundsKill', true);
            this.bullets.setAll('checkWorldBounds', true);

            // Spawn Spaceship
            this.ship = this.game.add.sprite(400, 200, 'ship');
            this.ship.anchor.set(0.5);
            this.physics.arcade.enable(this.ship);
            this.ship.body.drag.set(100);
            this.ship.body.maxVelocity.set(200);

            // Spawn Enemy
            this.enemy = this.game.add.sprite(300, 200, 'enemy');
            this.enemy.enableBody = true;
            this.enemy.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
            
            // Prepare explosions
            this.explosions = this.game.add.group();
            this.explosions.createMultiple(30, 'kaboom');
            this.explosions.forEach(this.setupEnemy, this);

            // Bind Keyboard Controls
            this.controls = {
                up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
                down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
                left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
                right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
                w: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
                s: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
                a: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
                d: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
                spacebar: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
                shift: this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
            };
        }

        setupEnemy (enemy) {
            enemy.anchor.x = 0.5;
            enemy.anchor.y = 0.5;
            enemy.animations.add('kaboom');
        }
        
        update() {
            if (this.controls.up.isDown || this.controls.w.isDown) {
                this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, 200, this.ship.body.acceleration);
            } else {
                this.ship.body.acceleration.set(0);
            }

            if (this.controls.left.isDown || this.controls.a.isDown) {
                this.ship.body.angularVelocity = -300;
            } else if (this.controls.right.isDown || this.controls.d.isDown) {
                this.ship.body.angularVelocity = 300;
            } else {
                this.ship.body.angularVelocity = 0;
            }

            if (this.controls.spacebar.isDown) {
                this.fireBullet();
            }

            if (this.controls.shift.isDown) {
                this.ship.body.maxVelocity.set(1000);
            } else {
                this.ship.body.maxVelocity.set(200);
            }

            this.game.physics.arcade.overlap(this.bullets, this.enemy, this.collisionHandler, null, this);
            this.game.physics.arcade.collide(this.ship, this.enemy, this.collisionHandler, null, this);

            this.screenWrap(this.ship);

            //this.bullets.forEachExists(this.screenWrap, this);
        }

        screenWrap (sprite) {
            if (sprite.x < 0) {
                sprite.x = this.game.width;
            } else if (sprite.x > this.game.width) {
                sprite.x = 0;
            }

            if (sprite.y < 0) {
                sprite.y = this.game.height;
            } else if (sprite.y > this.game.height) {
                sprite.y = 0;
            }
        }

        fireBullet() {
            if (this.game.time.now > this.bulletTime) {
                this.bullet = this.bullets.getFirstExists(false);

                if (this.bullet) {
                    this.bullet.reset(this.ship.body.x + 16, this.ship.body.y + 16);
                    this.bullet.lifespan = 2000;
                    this.bullet.raotation = this.ship.rotation;
                    this.game.physics.arcade.velocityFromRotation(this.ship.rotation, 400, this.bullet.body.velocity);
                    this.bulletTime = this.game.time.now + 50;
                }
            }
        }

        collisionHandler (bullet, enemy) {
            //  When a bullet hits an aalien we kill them both
            if (bullet.key === 'bullet') {
                bullet.kill();
            }
            this.enemy.kill();

            //  Increase the score
            // score += 20;
            // scoreText.text = scoreString + score;

            //  And create an explow sion :)
            this.explosion = this.explosions.getFirstExists(false);
            this.explosion.reset(enemy.body.x, enemy.body.y);
            this.explosion.play('kaboom', 30, false, true);
            setTimeout(() => {
                this.enemy.reset(this.game.world.centerX, this.game.world.centerY);    
            }, 5000);
        }
    }

    angular.module('MadnessGame')
           .controller('MadnessGame.HomeController', HomeController);
}