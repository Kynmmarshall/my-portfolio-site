/**
 * PCB top face: dark solder mask with glowing copper traces, vias and a
 * microcontroller, all drawn in a fragment shader. No texture, no download.
 * `position.xz` is the board coordinate in key pitches.
 */
export const PCB_VERTEX = /* glsl */ `
varying vec2 vBoard;
void main() {
  vBoard = position.xz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const PCB_FRAGMENT = /* glsl */ `
varying vec2 vBoard;
uniform float uTime;
uniform float uGlow;
uniform vec3 uBoard;
uniform vec3 uTrace;
uniform vec3 uWarm;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 p = vBoard;
  vec3 color = uBoard * (0.85 + 0.15 * hash(floor(p * 22.0)));

  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;
  float rowOffset = (hash(vec2(cell.y, 3.0)) - 0.5) * 0.5;
  float columnOffset = (hash(vec2(cell.x, 9.0)) - 0.5) * 0.5;
  float width = 0.028;

  float showH = step(0.35, hash(cell));
  float showV = step(0.45, hash(cell + 17.0));
  float horizontal = showH * (1.0 - smoothstep(width, width + 0.018, abs(local.y - rowOffset)));
  float vertical = showV * (1.0 - smoothstep(width, width + 0.018, abs(local.x - columnOffset)));

  // Bright dashes travel along the traces.
  float speed = 1.2 + hash(cell + 5.0);
  float pulseH = 0.45 + 0.55 * smoothstep(0.55, 1.0, sin(p.x * 2.4 - uTime * speed + hash(cell) * 6.2832));
  float pulseV = 0.45 + 0.55 * smoothstep(0.55, 1.0, sin(p.y * 2.4 - uTime * speed + hash(cell + 3.0) * 6.2832));
  vec3 trace = uTrace * uGlow;
  color = mix(color, trace * pulseH, horizontal * 0.9);
  color = mix(color, trace * pulseV, vertical * 0.9);

  // Vias where a horizontal and a vertical trace meet.
  vec2 via = vec2(columnOffset, rowOffset);
  float ring = smoothstep(0.075, 0.06, distance(local, via)) - smoothstep(0.036, 0.028, distance(local, via));
  color = mix(color, uWarm * uGlow, ring * showH * showV);

  // Microcontroller near the back edge, with pins on two sides.
  vec2 chip = p - vec2(-0.5, -2.3);
  float body = step(abs(chip.x), 0.85) * step(abs(chip.y), 0.55);
  float pins = step(0.85, abs(chip.x)) * step(abs(chip.x), 1.0) * step(abs(chip.y), 0.55) *
    step(0.5, fract(chip.y * 5.0));
  color = mix(color, uBoard * 0.3, body);
  color = mix(color, uWarm * uGlow * 0.9, pins);
  color += uTrace * uGlow * 0.08 * body * step(0.9, hash(floor(chip * 8.0)));

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;
