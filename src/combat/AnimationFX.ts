import Phaser from 'phaser';

export class AnimationFX {
  static playSuperCutIn(scene: Phaser.Scene, heroId: string, title: string, vfxHex: string): void {
    const color = Phaser.Display.Color.HexStringToColor(vfxHex).color;
    const container = scene.add.container(0, 0).setDepth(8900);
    const band = scene.add.rectangle(640, 310, 1400, 190, 0x090b12, 0.92).setAngle(-4);
    const topLine = scene.add.rectangle(640, 214, 1400, 6, color).setAngle(-4);
    const botLine = scene.add.rectangle(640, 406, 1400, 6, color).setAngle(-4);
    container.add([band, topLine, botLine]);

    for (let i = 0; i < 16; i++) {
      const ly = 224 + i * 11;
      const line = scene.add.rectangle(640, ly, 1280, 2, color, 0.25 + (i % 3) * 0.12).setAngle(-4);
      container.add(line);
      scene.tweens.add({ targets: line, x: i % 2 === 0 ? 790 : 490, duration: 420, ease: 'Sine.easeOut' });
    }

    const pKey = `portrait_${heroId}`;
    if (scene.textures.exists(pKey)) {
      const portrait = scene.add.image(-180, 310, pKey).setDisplaySize(230, 260);
      container.add(portrait);
      scene.tweens.add({ targets: portrait, x: 340, duration: 180, ease: 'Back.easeOut' });
    }

    const label = scene.add.text(1420, 310, title, {
      fontFamily: 'Impact, system-ui, sans-serif', fontSize: '52px', color: vfxHex, stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5);
    container.add(label);
    scene.tweens.add({ targets: label, x: 785, duration: 190, ease: 'Cubic.easeOut' });

    if (heroId === 'gojo') {
      const ring = scene.add.circle(640, 360, 40, 0x38bdf8, 0.1).setStrokeStyle(6, 0xa855f7, 0.95);
      container.add(ring);
      scene.tweens.add({ targets: ring, scale: 16, alpha: 0, duration: 520, ease: 'Cubic.easeOut' });
    } else if (heroId === 'zoro') {
      for (let s = 0; s < 6; s++) {
        const slash = scene.add.rectangle(640, 210 + s * 56, 1300, 8, s % 2 === 0 ? 0x34d399 : 0xc084fc, 0.9).setAngle(-14 + s * 6);
        container.add(slash);
        scene.tweens.add({ targets: slash, scaleY: 0.1, alpha: 0, duration: 360, delay: s * 32 });
      }
    }

    scene.time.delayedCall(540, () => {
      scene.tweens.add({ targets: container, alpha: 0, duration: 160, onComplete: () => container.destroy() });
    });
  }

  static playMultiSlashBurst(scene: Phaser.Scene, x: number, y: number, facing: 1 | -1, hits: number, colorHex: string): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    for (let i = 0; i < hits; i++) {
      scene.time.delayedCall(i * 28, () => {
        const sx = x + facing * (40 + (i * 22) % 240) + (Math.random() - 0.5) * 40;
        const sy = y - 35 - Math.random() * 65;
        const ang = (Math.random() - 0.5) * 1.9;
        const slash = scene.add.rectangle(sx, sy, 92, 5, i % 2 === 0 ? 0xffffff : color, 0.95)
          .setRotation(ang).setBlendMode(Phaser.BlendModes.ADD).setDepth(8750);
        scene.tweens.add({ targets: slash, scaleX: 1.55, scaleY: 0.15, alpha: 0, duration: 180, ease: 'Cubic.easeOut', onComplete: () => slash.destroy() });
      });
    }
  }

  static spawnShockwaveRing(scene: Phaser.Scene, x: number, y: number, colorHex: string, maxScale = 4.2): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const ring = scene.add.circle(x, y, 22, color, 0.16).setStrokeStyle(5, color, 0.95).setBlendMode(Phaser.BlendModes.ADD).setDepth(8650);
    scene.tweens.add({ targets: ring, scale: maxScale, alpha: 0, duration: 280, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  }

  static spawnWetRoadGlow(scene: Phaser.Scene, x: number, groundY: number, colorHex: string, radius = 68): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const glow = scene.add.ellipse(x, groundY + 4, radius * 2, radius * 0.45, color, 0.24).setBlendMode(Phaser.BlendModes.ADD).setDepth(groundY - 4);
    scene.tweens.add({ targets: glow, alpha: 0, scaleX: 1.3, duration: 210, ease: 'Quad.easeOut', onComplete: () => glow.destroy() });
  }

  static spawnHitSpark(scene: Phaser.Scene, x: number, y: number, colorHex: string, heavy = false): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const ring = scene.add.circle(x, y, heavy ? 16 : 10, color, 0.35).setStrokeStyle(heavy ? 4 : 2.5, 0xffffff, 0.95).setBlendMode(Phaser.BlendModes.ADD).setDepth(8600);
    scene.tweens.add({ targets: ring, scale: heavy ? 3.4 : 2.1, alpha: 0, duration: heavy ? 220 : 150, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    const rayCount = heavy ? 8 : 5;
    for (let i = 0; i < rayCount; i++) {
      const ang = (Math.PI * 2 * i) / rayCount + Math.random() * 0.4;
      const dist = (heavy ? 52 : 30) + Math.random() * 20;
      const spark = scene.add.rectangle(x, y, heavy ? 14 : 9, 3, i % 2 === 0 ? 0xffffff : color).setRotation(ang).setBlendMode(Phaser.BlendModes.ADD).setDepth(8601);
      scene.tweens.add({ targets: spark, x: x + Math.cos(ang) * dist, y: y + Math.sin(ang) * dist, alpha: 0, scaleX: 0.2, duration: 180 + Math.random() * 80, ease: 'Quad.easeOut', onComplete: () => spark.destroy() });
    }
  }

  static spawnDustPuff(scene: Phaser.Scene, x: number, groundY: number, dir = 0): void {
    for (let i = 0; i < 4; i++) {
      const puff = scene.add.circle(x + (Math.random() - 0.5) * 20, groundY - 4, 6 + Math.random() * 6, 0xcbd5e1, 0.48).setDepth(groundY + 1);
      scene.tweens.add({ targets: puff, x: puff.x - dir * 24 + (Math.random() - 0.5) * 26, y: groundY - 14 - Math.random() * 14, scale: 1.9, alpha: 0, duration: 280, ease: 'Quad.easeOut', onComplete: () => puff.destroy() });
    }
  }

  static playTeamUltimateCutIn(scene: Phaser.Scene, heroA: string, heroB: string, title: string): void {
    const container = scene.add.container(0, 0).setDepth(8950);
    const band = scene.add.rectangle(640, 320, 1400, 220, 0x070910, 0.94);
    const topL = scene.add.rectangle(640, 210, 1400, 6, 0xff5733);
    const botL = scene.add.rectangle(640, 430, 1400, 6, 0x22d3ee);
    container.add([band, topL, botL]);
    if (scene.textures.exists(`portrait_${heroA}`)) {
      const pA = scene.add.image(-200, 320, `portrait_${heroA}`).setDisplaySize(220, 250);
      container.add(pA);
      scene.tweens.add({ targets: pA, x: 240, duration: 180, ease: 'Back.easeOut' });
    }
    if (scene.textures.exists(`portrait_${heroB}`)) {
      const pB = scene.add.image(1480, 320, `portrait_${heroB}`).setDisplaySize(220, 250).setFlipX(true);
      container.add(pB);
      scene.tweens.add({ targets: pB, x: 1040, duration: 180, ease: 'Back.easeOut' });
    }
    const txt = scene.add.text(640, 320, title, { fontFamily: 'Impact, system-ui, sans-serif', fontSize: '46px', color: '#facc15', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5);
    container.add(txt);
    scene.time.delayedCall(620, () => {
      scene.tweens.add({ targets: container, alpha: 0, duration: 160, onComplete: () => container.destroy() });
    });
  }
}
