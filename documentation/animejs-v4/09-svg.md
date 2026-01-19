# SVG

anime.js provides specialized utilities for SVG animations including morphing, path drawing, and motion paths.

## morphTo()

Morph one SVG shape into another.

```javascript
import { svg, animate } from 'animejs';

// Basic morphing
animate('.shape', {
  d: svg.morphTo('.target-shape')
});
```

### Basic Usage

```javascript
// Morph between two paths
animate('#path1', {
  d: svg.morphTo('#path2'),
  duration: 1000,
  easing: 'easeInOutQuad'
});
```

### Multiple States

```javascript
// Morph through multiple shapes
animate('#shape', {
  d: [
    svg.morphTo('#state1'),
    svg.morphTo('#state2'),
    svg.morphTo('#state3')
  ],
  duration: 3000,
  loop: true
});
```

### From Path Data

```javascript
// Morph using path data strings
animate('#path', {
  d: svg.morphTo('M10 80 Q 95 10 180 80 T 350 80'),
  duration: 1000
});
```

### Morph Options

```javascript
animate('#shape', {
  d: svg.morphTo('#target', {
    precision: 0.5  // Higher = more points, smoother morph
  }),
  duration: 1000
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `precision` | `number` | `0.25` | Path sampling precision |

---

## createDrawable()

Create line drawing animations on SVG paths.

```javascript
import { svg } from 'animejs';

const drawable = svg.createDrawable('.path');
```

### Basic Line Drawing

```javascript
const drawable = svg.createDrawable('#line-path');

animate(drawable, {
  draw: [0, 1],  // Draw from 0% to 100%
  duration: 2000,
  easing: 'easeInOutQuad'
});
```

### Draw In and Out

```javascript
const drawable = svg.createDrawable('#path');

// Draw in
animate(drawable, {
  draw: [0, 1],
  duration: 1000
}).then(() => {
  // Erase
  animate(drawable, {
    draw: [1, 0],
    duration: 1000
  });
});
```

### Partial Drawing

```javascript
const drawable = svg.createDrawable('#path');

// Draw only middle 50%
animate(drawable, {
  draw: [0.25, 0.75],
  duration: 1000
});
```

### Multiple Paths

```javascript
document.querySelectorAll('.draw-path').forEach((path, i) => {
  const drawable = svg.createDrawable(path);
  
  animate(drawable, {
    draw: [0, 1],
    duration: 1500,
    delay: i * 200,  // Stagger the drawing
    easing: 'easeOutQuad'
  });
});
```

### With Stroke Animation

```javascript
const drawable = svg.createDrawable('#path');

animate(drawable, {
  draw: [0, 1],
  strokeWidth: [1, 3, 1],
  duration: 2000
});
```

### Drawable Properties

| Property | Type | Description |
|----------|------|-------------|
| `el` | `SVGElement` | The SVG path element |
| `length` | `number` | Total path length |
| `draw` | `[number, number]` | Current draw range |

---

## createMotionPath()

Animate elements along SVG paths.

```javascript
import { svg, animate } from 'animejs';

const motionPath = svg.createMotionPath('#path');
```

### Basic Motion Path

```javascript
const path = svg.createMotionPath('#curve-path');

animate('.element', {
  ...path(),  // Spreads x, y, and rotate properties
  duration: 2000,
  easing: 'linear'
});
```

### Without Rotation

```javascript
const path = svg.createMotionPath('#path');

animate('.element', {
  ...path({ rotate: false }),  // Only x and y
  duration: 2000
});
```

### Partial Path

```javascript
const path = svg.createMotionPath('#path');

// Move along 50% of the path
animate('.element', {
  ...path({ start: 0, end: 0.5 }),
  duration: 1000
});
```

### Offset Rotation

```javascript
const path = svg.createMotionPath('#path');

animate('.element', {
  ...path({ rotateOffset: 90 }),  // Add 90deg to auto-rotation
  duration: 2000
});
```

### Multiple Elements on Path

```javascript
const path = svg.createMotionPath('#circuit-path');

document.querySelectorAll('.particle').forEach((el, i, all) => {
  const offset = i / all.length;  // Distribute along path
  
  animate(el, {
    ...path({ start: offset, end: offset + 1 }),
    duration: 5000,
    loop: true,
    easing: 'linear'
  });
});
```

### Motion Path Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `start` | `number` | `0` | Start position (0-1) |
| `end` | `number` | `1` | End position (0-1) |
| `rotate` | `boolean` | `true` | Auto-rotate along path |
| `rotateOffset` | `number` | `0` | Additional rotation offset |

---

## Practical Examples

### Logo Reveal

```javascript
// Draw logo paths sequentially
const logoPaths = document.querySelectorAll('.logo-path');

logoPaths.forEach((path, i) => {
  const drawable = svg.createDrawable(path);
  
  animate(drawable, {
    draw: [0, 1],
    duration: 800,
    delay: i * 150,
    easing: 'easeOutQuad'
  });
});
```

### Shape Morphing Button

```javascript
const button = document.querySelector('.morph-button');
const icon = button.querySelector('.icon-path');

button.addEventListener('mouseenter', () => {
  animate(icon, {
    d: svg.morphTo('.hover-state'),
    duration: 300,
    easing: 'easeOutQuad'
  });
});

button.addEventListener('mouseleave', () => {
  animate(icon, {
    d: svg.morphTo('.default-state'),
    duration: 300,
    easing: 'easeOutQuad'
  });
});
```

### Animated Infographic

```javascript
// Morph between chart states
const chartPath = document.querySelector('.chart-path');
const states = ['#chart-2020', '#chart-2021', '#chart-2022', '#chart-2023'];
let currentState = 0;

setInterval(() => {
  currentState = (currentState + 1) % states.length;
  
  animate(chartPath, {
    d: svg.morphTo(states[currentState]),
    duration: 800,
    easing: 'easeInOutQuad'
  });
}, 3000);
```

### Orbiting Elements

```javascript
const orbit = svg.createMotionPath('.orbit-path');
const planets = document.querySelectorAll('.planet');

planets.forEach((planet, i) => {
  const offset = i / planets.length;
  
  animate(planet, {
    ...orbit({ 
      start: offset, 
      end: offset + 1,
      rotate: false  // Planets don't rotate along path
    }),
    duration: 10000 * (i + 1),  // Outer planets slower
    loop: true,
    easing: 'linear'
  });
});
```

### Handwriting Effect

```javascript
const textPaths = document.querySelectorAll('.handwriting path');
let totalDelay = 0;

textPaths.forEach((path) => {
  const drawable = svg.createDrawable(path);
  const duration = drawable.length * 5;  // Speed based on length
  
  animate(drawable, {
    draw: [0, 1],
    duration: duration,
    delay: totalDelay,
    easing: 'linear'
  });
  
  totalDelay += duration * 0.8;  // Slight overlap
});
```

### Interactive Path

```javascript
const path = document.querySelector('.interactive-path');
const drawable = svg.createDrawable(path);

// Sync with mouse position
document.addEventListener('mousemove', (e) => {
  const progress = e.clientX / window.innerWidth;
  
  animate(drawable, {
    draw: [0, progress],
    duration: 100,
    easing: 'linear'
  });
});
```

---

## Tips

1. **Path Compatibility**: For smooth morphing, source and target paths should have similar complexity and point counts.

2. **Performance**: Complex paths with many points can impact performance. Use the `precision` option to balance quality and speed.

3. **Hidden Target Shapes**: Keep morph target shapes hidden in your SVG with `display: none` or `visibility: hidden`.

4. **Path Direction**: Ensure paths are drawn in the same direction for predictable morphing.

5. **Stroke Properties**: For line drawing, ensure paths have `stroke` set and `fill: none`.

---

## Next Steps

- Learn about [Text](./10-text.md) for text animations
- Explore [Timeline](./04-timeline.md) for sequencing SVG animations
- Check out [Easings](./12-easings.md) for timing functions
