const DEFAULT_DEADZONE = 0.12;

function clampAxis(value, deadzone) {
  if (!Number.isFinite(value)) return 0;
  if (Math.abs(value) < deadzone) return 0;
  return Math.max(-1, Math.min(1, value));
}

function getButtonValue(button) {
  if (!button) return 0;
  if (typeof button === 'number') return button;
  return button.value ?? (button.pressed ? 1 : 0);
}

export function createGamepadState() {
  return {
    connected: false,
    id: '',
    mapping: '',
    axes: [0, 0, 0, 0],
    buttons: [],
    inputState: {
      moveX: 0,
      moveY: 0,
      aimX: 0,
      aimY: 0,
      flap: false,
      boost: false,
      shoot: false,
      pause: false,
      pulse: false,
    },
    remap: {
      flap: 0,
      boost: 5,
      shoot: 7,
      pause: 9,
      pulse: 4,
    },
  };
}

export function loadGamepadRemap(game) {
  try {
    const raw = window.localStorage.getItem('bird-gamepad-remap');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      game.gamepad.remap = {
        ...game.gamepad.remap,
        ...parsed,
      };
    }
  } catch {
    // Local storage is optional here; ignore malformed data.
  }
}

export function saveGamepadRemap(game) {
  try {
    window.localStorage.setItem('bird-gamepad-remap', JSON.stringify(game.gamepad.remap));
  } catch {
    // Ignore storage failures in private / test environments.
  }
}

export function updateGamepadState(game) {
  const pads = navigator.getGamepads?.() ?? [];
  const pad = pads.find(Boolean);
  const deadzone = game.tuning.input.deadzone ?? DEFAULT_DEADZONE;

  if (!pad) {
    game.gamepad.connected = false;
    game.gamepad.id = '';
    game.gamepad.mapping = '';
    game.gamepad.axes = [0, 0, 0, 0];
    game.gamepad.buttons = [];
    game.gamepad.inputState = {
      moveX: 0,
      moveY: 0,
      aimX: 0,
      aimY: 0,
      flap: false,
      boost: false,
      shoot: false,
      pause: false,
      pulse: false,
    };
    return game.gamepad.inputState;
  }

  game.gamepad.connected = true;
  game.gamepad.id = pad.id;
  game.gamepad.mapping = pad.mapping || 'custom';
  game.gamepad.axes = [
    clampAxis(pad.axes[0] ?? 0, deadzone),
    clampAxis(pad.axes[1] ?? 0, deadzone),
    clampAxis(pad.axes[2] ?? 0, deadzone),
    clampAxis(pad.axes[3] ?? 0, deadzone),
  ];
  game.gamepad.buttons = pad.buttons.map((button) => ({
    pressed: Boolean(button.pressed),
    value: Number(getButtonValue(button).toFixed(2)),
  }));

  const remap = game.gamepad.remap;
  game.gamepad.inputState = {
    moveX: game.gamepad.axes[0],
    moveY: game.gamepad.axes[1],
    aimX: game.gamepad.axes[2],
    aimY: game.gamepad.axes[3],
    flap: getButtonValue(pad.buttons[remap.flap]) > 0.4,
    boost: getButtonValue(pad.buttons[remap.boost]) > 0.3,
    shoot: getButtonValue(pad.buttons[remap.shoot]) > 0.3,
    pause: Boolean(pad.buttons[remap.pause]?.pressed),
    pulse: Boolean(pad.buttons[remap.pulse]?.pressed),
  };

  return game.gamepad.inputState;
}
