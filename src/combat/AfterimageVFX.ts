import Phaser from 'phaser';

export class AfterimageVFX {
  static spawnGhost(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tintColor: number): void {
    const ghost = scene.add.sprite(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name)
      .setOrigin(sprite.originX, sprite.originY)
      .setFlipX(sprite.flipX)
      .setScale(sprite.scaleX, sprite.scaleY)
      .setDepth(sprite.depth - 1)
      .setTint(tintColor)
      .setAlpha(0.55);

    scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 210,
      onComplete: () => ghost.destroy(),
    });
  }

  static spawnExplosion(scene: Phaser.Scene, x: number, y: number, color = 0xff5733): void {
    const ring = scene.add.circle(x, y - 30, 18, color, 0.55).setStrokeStyle(4, 0xfacc15).setDepth(8200);
    scene.tweens.add({
      targets: ring,
      scale: 4.5,
      alpha: 0,
      duration: 320,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    scene.cameras.main.shake(160, 0.009);
  }
}
