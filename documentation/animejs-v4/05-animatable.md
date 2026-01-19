# Animatable

Animatable creates reactive bindings between properties and elements, enabling smooth value interpolation on demand.

## Creating an Animatable

```javascript
import { createAnimatable } from 'animejs';

const animatable = createAnimatable('.element', {
  x: 0,
  y: 0,
  rotate: 0
});
```

---

## Settings

### unit

Define default units for properties.

```javascript
const animatable = createAnimatable('.element', {
  x: { value: 0, unit: 'rem' },
  y: { value: 0, unit: '%' },
  rotate: { value: 0, unit: 'deg' }
});
```

---

### duration

Set default animation duration for value changes.

```javascript
const animatable = createAnimatable('.element', {
  x: { value: 0, duration: 500 },
  y: { value: 0, duration: 1000 }
});

// Or global duration
const animatable2 = createAnimatable('.element', {
  x: 0,
  y: 0
}, {
  duration: 800
});
```

---

### ease

Set default easing for interpolation.

```javascript
const animatable = createAnimatable('.element', {
  x: { value: 0, ease: 'easeOutElastic(1, .5)' },
  y: { value: 0, ease: 'easeInOutQuad' }
});

// Or global easing
const animatable2 = createAnimatable('.element', {
  x: 0,
  y: 0
}, {
  ease: 'easeOutExpo'
});
```

---

### modifier

Transform values before applying.

```javascript
const animatable = createAnimatable('.element', {
  x: {
    value: 0,
    modifier: (value) => Math.round(value)
  }
});

// Snap to grid
const gridAnimatable = createAnimatable('.element', {
  x: {
    value: 0,
    modifier: (v) => Math.round(v / 20) * 20
  }
});
```

---

## Methods

### Getters

Get current property values.

```javascript
const animatable = createAnimatable('.element', {
  x: 100,
  y: 50,
  rotate: 45
});

// Get individual values
console.log(animatable.x());      // 100
console.log(animatable.y());      // 50
console.log(animatable.rotate()); // 45

// Get all values
console.log(animatable()); // { x: 100, y: 50, rotate: 45 }
```

---

### Setters

Set property values with automatic animation.

```javascript
const animatable = createAnimatable('.element', {
  x: 0,
  y: 0
}, {
  duration: 500,
  ease: 'easeOutQuad'
});

// Set individual values (animates to new value)
animatable.x(100);
animatable.y(200);

// Set multiple values at once
animatable({
  x: 300,
  y: 150
});
```

#### Instant Updates

Skip animation with the second parameter.

```javascript
// Animate to 100
animatable.x(100);

// Instantly set to 100 (no animation)
animatable.x(100, true);

// Instant multi-property update
animatable({ x: 300, y: 150 }, true);
```

---

### revert()

Revert to original values and remove bindings.

```javascript
const animatable = createAnimatable('.element', {
  x: 0,
  y: 0
});

animatable.x(100);
animatable.y(200);

// Revert to original state
animatable.revert();
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `targets` | `Array` | Bound target elements |
| `animations` | `Object` | Active property animations |

---

## Practical Examples

### Mouse Following

```javascript
const follower = createAnimatable('.cursor-follower', {
  x: 0,
  y: 0
}, {
  duration: 300,
  ease: 'easeOutQuad'
});

document.addEventListener('mousemove', (e) => {
  follower({
    x: e.clientX,
    y: e.clientY
  });
});
```

### Scroll Progress

```javascript
const progress = createAnimatable('.progress-bar', {
  scaleX: 0
}, {
  duration: 100,
  ease: 'linear'
});

window.addEventListener('scroll', () => {
  const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progress.scaleX(scrollProgress);
});
```

### Interactive Controls

```javascript
const panel = createAnimatable('.side-panel', {
  x: -300  // Initially hidden
}, {
  duration: 400,
  ease: 'easeOutCubic'
});

document.querySelector('.open-btn').addEventListener('click', () => {
  panel.x(0);  // Slide in
});

document.querySelector('.close-btn').addEventListener('click', () => {
  panel.x(-300);  // Slide out
});
```

### Value Binding

```javascript
const gameState = createAnimatable({
  health: 100,
  score: 0,
  level: 1
}, {
  duration: 500
});

// Update health (animates the value)
gameState.health(75);

// Read current animated value
console.log(gameState.health());

// Update in game loop
function takeDamage(amount) {
  const current = gameState.health();
  gameState.health(Math.max(0, current - amount));
}
```

---

## Next Steps

- Learn about [Draggable](./06-draggable.md) for drag interactions
- Explore [Events](./08-events.md) for scroll-linked animations
- Check out [Utilities](./11-utilities.md) for helper functions
