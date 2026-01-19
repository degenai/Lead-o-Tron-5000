# Animation

Animations are the core of anime.js. They extend the Timer with the ability to animate properties on target elements or objects.

## Targets

Targets define what elements or objects to animate.

### CSS Selector

Use any valid CSS selector string.

```javascript
import anime from 'animejs';

// Class selector
anime({
  targets: '.box',
  translateX: 250
});

// ID selector
anime({
  targets: '#myElement',
  opacity: 0.5
});

// Complex selectors
anime({
  targets: 'div.container > .item:nth-child(odd)',
  scale: 1.5
});
```

---

### DOM Elements

Target DOM elements directly.

```javascript
const element = document.querySelector('.box');

anime({
  targets: element,
  translateX: 250
});

// NodeList
const elements = document.querySelectorAll('.box');

anime({
  targets: elements,
  rotate: '1turn'
});
```

---

### JavaScript Objects

Animate properties on plain JavaScript objects.

```javascript
const myObject = {
  x: 0,
  y: 0,
  progress: 0
};

anime({
  targets: myObject,
  x: 100,
  y: 200,
  progress: 1,
  duration: 1000,
  easing: 'linear',
  onUpdate: () => {
    console.log(myObject.x, myObject.y, myObject.progress);
  }
});
```

---

### Array of Targets

Mix different target types in an array.

```javascript
const el = document.querySelector('.box');
const obj = { value: 0 };

anime({
  targets: [el, '.other-boxes', obj],
  translateX: 250,
  value: 100
});
```

---

## Animatable Properties

### CSS Properties

Animate any CSS property using camelCase.

```javascript
anime({
  targets: '.element',
  opacity: 0.5,
  backgroundColor: '#FF0000',
  borderRadius: '50%',
  width: '200px',
  padding: '20px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
});
```

**Common CSS Properties:**

| Property | Example |
|----------|---------|
| `opacity` | `0` to `1` |
| `backgroundColor` | `'#FFF'`, `'rgb(255,0,0)'` |
| `width`, `height` | `'100px'`, `'50%'` |
| `margin`, `padding` | `'10px'`, `'1rem'` |
| `borderRadius` | `'50%'`, `'10px'` |
| `boxShadow` | `'0 0 10px #000'` |

---

### CSS Transforms

Animate individual transform properties without conflicts.

```javascript
anime({
  targets: '.element',
  translateX: 250,      // Pixels by default
  translateY: '2rem',   // With unit
  translateZ: 0,
  rotate: '1turn',      // Or degrees: 360
  rotateX: '45deg',
  rotateY: '45deg',
  rotateZ: '45deg',
  scale: 2,
  scaleX: 1.5,
  scaleY: 1.5,
  scaleZ: 1,
  skew: '10deg',
  skewX: '10deg',
  skewY: '10deg',
  perspective: 1000
});
```

**Transform Properties:**

| Property | Default Unit |
|----------|--------------|
| `translateX`, `translateY`, `translateZ` | `px` |
| `rotate`, `rotateX`, `rotateY`, `rotateZ` | `deg` |
| `scale`, `scaleX`, `scaleY`, `scaleZ` | none |
| `skew`, `skewX`, `skewY` | `deg` |
| `perspective` | `px` |

---

### CSS Variables

Animate CSS custom properties.

```javascript
// CSS: :root { --progress: 0; }

anime({
  targets: document.documentElement,
  '--progress': 1,
  duration: 2000
});
```

```css
.progress-bar {
  width: calc(var(--progress) * 100%);
}
```

---

### JS Object Properties

Animate numeric properties on JavaScript objects.

```javascript
const camera = {
  x: 0,
  y: 0,
  zoom: 1
};

anime({
  targets: camera,
  x: 100,
  y: 50,
  zoom: 2,
  duration: 1000,
  onUpdate: () => {
    updateCamera(camera);
  }
});
```

---

### HTML Attributes

Animate HTML attributes.

```javascript
anime({
  targets: 'input[type="range"]',
  value: 100,
  duration: 2000
});

anime({
  targets: 'progress',
  value: [0, 100],
  duration: 3000
});
```

---

### SVG Attributes

Animate SVG-specific attributes.

```javascript
anime({
  targets: 'circle',
  cx: 100,
  cy: 100,
  r: 50,
  fill: '#FF0000',
  strokeWidth: 5,
  strokeDashoffset: [anime.setDashoffset, 0]
});

anime({
  targets: 'polygon',
  points: '64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96'
});
```

---

## Tween Value Types

### Numerical

Simple number values.

```javascript
anime({
  targets: '.element',
  opacity: 0.5,        // Unitless
  translateX: 250,     // Default unit (px) applied
  rotate: 360          // Default unit (deg) applied
});
```

---

### Unit Conversion

Animate between different units.

```javascript
anime({
  targets: '.element',
  width: ['0%', '100%'],
  height: ['0vh', '50vh'],
  translateX: ['0rem', '10rem']
});
```

---

### Relative Values

Use relative operators for incremental animations.

```javascript
anime({
  targets: '.element',
  translateX: '+=100',   // Add 100px to current value
  translateY: '-=50',    // Subtract 50px from current value
  rotate: '*=2'          // Multiply current rotation by 2
});
```

| Operator | Description |
|----------|-------------|
| `+=` | Add to current value |
| `-=` | Subtract from current value |
| `*=` | Multiply current value |

---

### Color

Animate colors in various formats.

```javascript
anime({
  targets: '.element',
  backgroundColor: '#FF0000',           // Hex
  color: 'rgb(255, 0, 0)',              // RGB
  borderColor: 'rgba(255, 0, 0, 0.5)',  // RGBA
  fill: 'hsl(0, 100%, 50%)'             // HSL
});

// From-to colors
anime({
  targets: '.element',
  backgroundColor: ['#FFF', '#000']
});
```

---

### Color Function (WAAPI)

Use CSS color functions with WAAPI mode.

```javascript
anime({
  targets: '.element',
  backgroundColor: 'color-mix(in srgb, red, blue 50%)'
});
```

---

### CSS Variable Values

Use CSS variables as animation values.

```javascript
anime({
  targets: '.element',
  translateX: 'var(--translate-distance)',
  backgroundColor: 'var(--primary-color)'
});
```

---

### Function Based Values

Generate values dynamically for each target.

```javascript
anime({
  targets: '.element',
  translateX: (el, i, total) => {
    // el: current element
    // i: element index
    // total: total number of elements
    return i * 50;
  },
  rotate: (el, i) => i * 45,
  delay: (el, i) => i * 100
});
```

---

## Tween Parameters

### to

Specify the end value (default behavior).

```javascript
anime({
  targets: '.element',
  translateX: { to: 250 },
  opacity: { to: 0 }
});

// Shorthand (equivalent)
anime({
  targets: '.element',
  translateX: 250,
  opacity: 0
});
```

---

### from

Animate from a specific value to the current value.

```javascript
anime({
  targets: '.element',
  translateX: { from: -100 },  // From -100 to current
  opacity: { from: 0 }         // From 0 to current
});
```

---

### delay

Per-property delay.

```javascript
anime({
  targets: '.element',
  translateX: {
    to: 250,
    delay: 500
  },
  rotate: {
    to: '1turn',
    delay: 1000
  }
});
```

---

### duration

Per-property duration.

```javascript
anime({
  targets: '.element',
  translateX: {
    to: 250,
    duration: 500
  },
  rotate: {
    to: '1turn',
    duration: 1500
  }
});
```

---

### ease

Per-property easing.

```javascript
anime({
  targets: '.element',
  translateX: {
    to: 250,
    ease: 'easeOutElastic(1, .5)'
  },
  rotate: {
    to: '1turn',
    ease: 'easeInOutQuad'
  }
});
```

See [Easings](./12-easings.md) for all available easing functions.

---

### composition

Control how values compose with existing animations.

```javascript
anime({
  targets: '.element',
  translateX: {
    to: 250,
    composition: 'add'  // Add to existing value
  }
});
```

| Value | Description |
|-------|-------------|
| `'replace'` | Replace existing value (default) |
| `'add'` | Add to existing value |
| `'accumulate'` | Accumulate with existing value |

---

### modifier

Transform the animated value before applying.

```javascript
anime({
  targets: '.element',
  translateX: {
    to: 250,
    modifier: (value) => Math.round(value)
  }
});

// Snap to grid
anime({
  targets: '.element',
  translateX: {
    to: 250,
    modifier: (v) => Math.round(v / 10) * 10
  }
});
```

---

## Keyframes

### Tween Values

Array of values creates keyframes.

```javascript
anime({
  targets: '.element',
  translateX: [0, 100, 50, 200],  // 4 keyframes
  rotate: ['0deg', '180deg', '360deg']
});
```

---

### Tween Parameters in Keyframes

Add parameters to individual keyframes.

```javascript
anime({
  targets: '.element',
  translateX: [
    { to: 100, duration: 500, ease: 'easeOutQuad' },
    { to: 50, duration: 300, ease: 'easeInQuad' },
    { to: 200, duration: 800, ease: 'easeOutElastic(1, .5)' }
  ]
});
```

---

### Duration Based Keyframes

Keyframes with explicit durations.

```javascript
anime({
  targets: '.element',
  keyframes: [
    { translateX: 100, duration: 500 },
    { translateY: 100, duration: 500 },
    { translateX: 0, duration: 500 },
    { translateY: 0, duration: 500 }
  ]
});
```

---

### Percentage Based Keyframes

Position keyframes by percentage.

```javascript
anime({
  targets: '.element',
  keyframes: [
    { translateX: 0, offset: 0 },      // 0%
    { translateX: 100, offset: 0.25 }, // 25%
    { translateX: 50, offset: 0.5 },   // 50%
    { translateX: 200, offset: 1 }     // 100%
  ],
  duration: 2000
});
```

---

## Playback Settings

All Timer playback settings apply to animations. See [Timer](./02-timer.md) for details.

Additional animation-specific settings:

### playbackEase

Apply easing to the overall animation progress.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  duration: 1000,
  playbackEase: 'easeInOutQuad'
});
```

---

### persist (WAAPI)

Keep styles after animation completes.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  persist: true  // Styles remain after completion
});
```

---

## Callbacks

All Timer callbacks apply. Additional animation callbacks:

### onBeforeUpdate

Called before each render update.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  onBeforeUpdate: (self) => {
    console.log('About to update');
  }
});
```

---

### onRender

Called after DOM updates.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  onRender: (self) => {
    console.log('DOM updated');
  }
});
```

---

## Methods

All Timer methods apply. Additional animation methods:

### refresh()

Recalculate animation values (useful after DOM changes).

```javascript
const anim = anime({
  targets: '.element',
  translateX: '100%'
});

// After container resize
window.addEventListener('resize', () => {
  anim.refresh();
});
```

---

## Properties

All Timer properties apply, plus:

| Property | Type | Description |
|----------|------|-------------|
| `targets` | `Array` | Array of target elements/objects |
| `animations` | `Array` | Array of tween animations |

---

## Next Steps

- Learn about [Timeline](./04-timeline.md) for sequencing animations
- Explore [Keyframes](./03-animation.md#keyframes) for complex motions
- Check out [Easings](./12-easings.md) for different timing functions
