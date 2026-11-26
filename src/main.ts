import Phaser from 'phaser';
import { StudioLauncher } from './launcher/StudioLauncher';
import { BattleScene } from './scenes/BattleScene';
import { BootScene } from './scenes/BootScene';
import { HudScene } from './scenes/HudScene';
import { TitleSelectScene } from './scenes/TitleSelectScene';

new StudioLauncher(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-root',
    width: 1280,
    height: 720,
    backgroundColor: '#08090c',
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, TitleSelectScene, BattleScene, HudScene],
  };

  new Phaser.Game(config);
});
