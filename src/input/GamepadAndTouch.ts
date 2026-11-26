export interface VirtualPadState {
  dx: number;
  dy: number;
  pressed: Set<string>;
}

export class GamepadPoller {
  private prevButtons: boolean[] = [];

  poll(): VirtualPadState {
    const state: VirtualPadState = { dx: 0, dy: 0, pressed: new Set() };
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[0];
    if (!pad) return state;

    const ax = pad.axes[0] ?? 0;
    const ay = pad.axes[1] ?? 0;
    if (Math.abs(ax) > 0.25) state.dx = Math.sign(ax);
    if (Math.abs(ay) > 0.25) state.dy = Math.sign(ay);

    if (pad.buttons[14]?.pressed) state.dx = -1;
    if (pad.buttons[15]?.pressed) state.dx = 1;
    if (pad.buttons[12]?.pressed) state.dy = -1;
    if (pad.buttons[13]?.pressed) state.dy = 1;

    const mapping: [number, string][] = [
      [2, 'attack'],
      [0, 'jump'],
      [4, 'parry'],
      [1, 'skill_u'],
      [3, 'skill_i'],
      [5, 'skill_su'],
      [7, 'ultimate_o'],
    ];

    for (const [idx, action] of mapping) {
      const nowDown = Boolean(pad.buttons[idx]?.pressed);
      if (nowDown && !this.prevButtons[idx]) state.pressed.add(action);
      this.prevButtons[idx] = nowDown;
    }

    return state;
  }
}
