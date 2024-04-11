//import { Boot } from './scenes/Boot';
//import { Game } from './scenes/Game';
//import { GameOver } from './scenes/GameOver';
//import { MainMenu } from './scenes/MainMenu';
//import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
var config = {
    type: Phaser.AUTO,
    width: 800, // 1024
    height: 600, // 768
    parent: "game-div",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver
    ],
};

var game = new Phaser.Game(config);
