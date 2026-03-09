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

function detectLayoutLabel(id = '') {
  const lower = id.toLowerCase();
  if (lower.includes('xbox')) return 'Xbox pad';
  if (lower.includes('dualshock') || lower.includes('dualsense') || lower.includes('wireless controller')) return 'PlayStation pad';
  if (lower.includes('switch') || lower.includes('nintendo')) return 'Switch pad';
  return 'Controller';
}

function firstSupportedButton(buttonCount, preferred, fallback = 0) {
  for (const candidate of preferred) {
    if (candidate >= 0 && candidate < buttonCount) return candidate;
  }
  return fallback;
}

function createAutoRemap(pad) {
  const buttonCount = pad.buttons.length;
  if (pad.mapping === 'standard') {
    return {
      flap: firstSupportedButton(buttonCount, [0, 1, 2, 3], 0),
      boost: firstSupportedButton(buttonCount, [5, 4, 7, 6], 5),
      shoot: firstSupportedButton(buttonCount, [7, 6, 5, 4], 7),
      pause: firstSupportedButton(buttonCount, [9, 10, 11, 8], 9),
      pulse: firstSupportedButton(buttonCount, [4, 6, 5, 7], 4),
    };
  }

  return {
    flap: firstSupportedButton(buttonCount, [0, 1, 2, 3], 0),
    boost: firstSupportedButton(buttonCount, [4, 5, 6, 7], 4),
    shoot: firstSupportedButton(buttonCount, [6, 7, 5, 4], 6),
    pause: firstSupportedButton(buttonCount, [9, 7, 10, 11, 8], 9),
    pulse: firstSupportedButton(buttonCount, [5, 4, 6, 7], 5),
  };
}

function clampButtonIndex(value, buttonCount, fallback) {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric < buttonCount) return numeric;
  return fallback;
}

function sanitizeRemap(remap, buttonCount) {
  return {
    flap: clampButtonIndex(remap.flap, buttonCount, 0),
    boost: clampButtonIndex(remap.boost, buttonCount, 5),
    shoot: clampButtonIndex(remap.shoot, buttonCount, 7),
    pause: clampButtonIndex(remap.pause, buttonCount, 9),
    pulse: clampButtonIndex(remap.pulse, buttonCount, 4),
  };
}

export function createGamepadState() {
  return {
    connected: false,
    id: '',
    layoutLabel: 'Controller',
    mapping: '',
    signature: '',
    profileSource: 'default',
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
      game.gamepad.profileSource = 'saved';
    }
  } catch {
    // Local storage is optional here; ignore malformed data.
  }
}

export function saveGamepadRemap(game) {
  try {
    game.gamepad.profileSource = 'saved';
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
    game.gamepad.layoutLabel = 'Controller';
    game.gamepad.mapping = '';
    game.gamepad.signature = '';
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
  game.gamepad.layoutLabel = detectLayoutLabel(pad.id);
  game.gamepad.mapping = pad.mapping || 'custom';
  const signature = `${pad.id}::${game.gamepad.mapping}::${pad.axes.length}::${pad.buttons.length}`;
  if (game.gamepad.signature !== signature) {
    game.gamepad.signature = signature;
    if (game.gamepad.profileSource !== 'saved') {
      game.gamepad.remap = createAutoRemap(pad);
      game.gamepad.profileSource = 'auto';
    }
  }
  game.gamepad.remap = sanitizeRemap(game.gamepad.remap, pad.buttons.length);
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

  const hasDualStick = pad.axes.length >= 4;
  const remap = game.gamepad.remap;
  game.gamepad.inputState = {
    moveX: game.gamepad.axes[0],
    moveY: game.gamepad.axes[1],
    aimX: hasDualStick ? game.gamepad.axes[2] : game.gamepad.axes[0],
    aimY: hasDualStick ? game.gamepad.axes[3] : game.gamepad.axes[1],
    flap: getButtonValue(pad.buttons[remap.flap]) > 0.4,
    boost: getButtonValue(pad.buttons[remap.boost]) > 0.3,
    shoot: getButtonValue(pad.buttons[remap.shoot]) > 0.3,
    pause: Boolean(pad.buttons[remap.pause]?.pressed),
    pulse: Boolean(pad.buttons[remap.pulse]?.pressed),
  };

  return game.gamepad.inputState;
}
