# Easings

Easings control the acceleration and deceleration of animations over time.

## Built-in Eases

anime.js includes a comprehensive set of built-in easing functions.

### Linear

```javascript
import anime from 'animejs';

anime({
  targets: '.element',
  translateX: 250,
  easing: 'linear'
});
```

Constant speed throughout the animation.

---

### Ease Functions

Each ease type has three variants: `In`, `Out`, and `InOut`.

| Ease | In | Out | InOut |
|------|-----|------|-------|
| Quad | `easeInQuad` | `easeOutQuad` | `easeInOutQuad` |
| Cubic | `easeInCubic` | `easeOutCubic` | `easeInOutCubic` |
| Quart | `easeInQuart` | `easeOutQuart` | `easeInOutQuart` |
| Quint | `easeInQuint` | `easeOutQuint` | `easeInOutQuint` |
| Sine | `easeInSine` | `easeOutSine` | `easeInOutSine` |
| Expo | `easeInExpo` | `easeOutExpo` | `easeInOutExpo` |
| Circ | `easeInCirc` | `easeOutCirc` | `easeInOutCirc` |
| Back | `easeInBack` | `easeOutBack` | `easeInOutBack` |
| Elastic | `easeInElastic` | `easeOutElastic` | `easeInOutElastic` |
| Bounce | `easeInBounce` | `easeOutBounce` | `easeInOutBounce` |

### Ease Variants Explained

- **In**: Starts slow, accelerates
- **Out**: Starts fast, decelerates
- **InOut**: Slow at both ends, fast in middle

```javascript
// Slow start, fast end
anime({ targets: '.el', translateX: 250, easing: 'easeInQuad' });

// Fast start, slow end
anime({ targets: '.el', translateX: 250, easing: 'easeOutQuad' });

// Smooth start and end
anime({ targets: '.el', translateX: 250, easing: 'easeInOutQuad' });
```

---

### Quad

Quadratic easing (power of 2).

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutQuad' });
```

---

### Cubic

Cubic easing (power of 3).

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutCubic' });
```

---

### Quart

Quartic easing (power of 4).

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutQuart' });
```

---

### Quint

Quintic easing (power of 5).

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutQuint' });
```

---

### Sine

Sinusoidal easing.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutSine' });
```

---

### Expo

Exponential easing.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutExpo' });
```

---

### Circ

Circular easing.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutCirc' });
```

---

### Back

Overshoots the end value then returns.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutBack' });

// Custom overshoot amount
anime({ targets: '.el', translateX: 250, easing: 'easeOutBack(2)' });
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `overshoot` | `number` | `1.70158` | Amount of overshoot |

---

### Elastic

Elastic/springy effect.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutElastic' });

// Custom parameters
anime({ targets: '.el', translateX: 250, easing: 'easeOutElastic(1, 0.5)' });
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `amplitude` | `number` | `1` | Oscillation amplitude |
| `period` | `number` | `0.5` | Oscillation period |

---

### Bounce

Bouncing effect.

```javascript
anime({ targets: '.el', translateX: 250, easing: 'easeOutBounce' });
```

---

## Cubic Bézier

Create custom easing curves using cubic bézier.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  easing: 'cubicBezier(0.25, 0.1, 0.25, 1)'
});

// Common cubic bezier curves
'cubicBezier(0.4, 0, 0.2, 1)'     // Material Design standard
'cubicBezier(0.4, 0, 1, 1)'       // Material accelerate
'cubicBezier(0, 0, 0.2, 1)'       // Material decelerate
'cubicBezier(0.68, -0.55, 0.27, 1.55)'  // Back-like effect
```

### Parameters

```javascript
'cubicBezier(x1, y1, x2, y2)'
```

| Parameter | Range | Description |
|-----------|-------|-------------|
| `x1` | `0-1` | First control point x |
| `y1` | `any` | First control point y |
| `x2` | `0-1` | Second control point x |
| `y2` | `any` | Second control point y |

---

## Linear Easing

Create piecewise linear easing with keyframes.

```javascript
// Simple linear segments
anime({
  targets: '.element',
  translateX: 250,
  easing: 'linear(0, 0.5 25%, 0.2 50%, 1)'
});
```

### Format

```javascript
'linear(value1, value2 position%, value3 position%, ...)'
```

Each point defines a value and optional position.

### Examples

```javascript
// Pause in the middle
'linear(0, 1 40%, 1 60%, 0)'

// Step-like effect
'linear(0, 0 25%, 0.5 25%, 0.5 50%, 0.75 50%, 0.75 75%, 1 75%, 1)'

// Ease-out approximation
'linear(0, 0.25 10%, 0.5 25%, 0.75 50%, 1)'
```

---

## Steps

Create stepped easing.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  easing: 'steps(5)'
});
```

### Parameters

```javascript
// Basic steps
'steps(count)'

// With direction
'steps(count, direction)'
```

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `count` | `number` | `1+` | Number of steps |
| `direction` | `string` | `'start'`, `'end'` | When step occurs |

### Examples

```javascript
'steps(10)'           // 10 steps, end (default)
'steps(5, start)'     // 5 steps, at start of each interval
'steps(5, end)'       // 5 steps, at end of each interval
```

Useful for:
- Sprite animations
- Clock ticking effects
- Typewriter animations

```javascript
// Sprite animation
anime({
  targets: '.sprite',
  backgroundPositionX: '-500px',
  easing: 'steps(10)',
  duration: 1000,
  loop: true
});
```

---

## Irregular

Create custom irregular easing patterns.

```javascript
import { eases } from 'animejs';

// Create custom ease
const customEase = eases.irregular(0.5, 1, 0.8, 0.2, 1);

anime({
  targets: '.element',
  translateX: 250,
  easing: customEase
});
```

---

## Spring

Physics-based spring easing.

```javascript
import { spring } from 'animejs';

anime({
  targets: '.element',
  translateX: 250,
  easing: spring({ mass: 1, stiffness: 100, damping: 10 })
});
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mass` | `number` | `1` | Object mass |
| `stiffness` | `number` | `100` | Spring stiffness |
| `damping` | `number` | `10` | Friction/damping |
| `velocity` | `number` | `0` | Initial velocity |

### Common Presets

```javascript
// Bouncy
spring({ mass: 1, stiffness: 100, damping: 10 })

// Snappy
spring({ mass: 1, stiffness: 200, damping: 20 })

// Gentle
spring({ mass: 1, stiffness: 50, damping: 15 })

// No bounce
spring({ mass: 1, stiffness: 100, damping: 26 })
```

### Duration

Springs have natural duration based on physics. Override with explicit duration:

```javascript
anime({
  targets: '.element',
  translateX: 250,
  easing: spring({ stiffness: 100, damping: 10 }),
  duration: 1000  // Force 1 second duration
});
```

---

## Custom Easing Functions

Create completely custom easing functions.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  easing: (t) => {
    // t is progress from 0 to 1
    // return eased value from 0 to 1
    return t * t;  // Same as easeInQuad
  }
});
```

### Examples

```javascript
// Reverse ease
const reverseEase = (t) => 1 - t;

// Wave ease
const waveEase = (t) => Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

// Snap ease (sudden jump at 50%)
const snapEase = (t) => t < 0.5 ? 0 : 1;

// Custom curve
const customCurve = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
```

---

## Per-Property Easing

Apply different easings to different properties.

```javascript
anime({
  targets: '.element',
  translateX: {
    value: 250,
    easing: 'easeOutExpo'
  },
  rotate: {
    value: '1turn',
    easing: 'easeInOutElastic(1, 0.5)'
  },
  opacity: {
    value: 0.5,
    easing: 'linear'
  }
});
```

---

## Playback Easing

Apply easing to overall animation progress.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  duration: 1000,
  playbackEase: 'easeInOutQuad'  // Eases the entire animation
});
```

---

## Easing Visualizer

Understand easing by visualizing:

```javascript
// Log easing values
function visualizeEase(easingName, steps = 10) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const value = anime.easing(easingName)(t);
    console.log(`${t.toFixed(2)}: ${value.toFixed(3)}`);
  }
}

visualizeEase('easeOutQuad');
```

---

## Practical Examples

### UI Transitions

```javascript
// Modal open - overshoot for playful feel
anime({
  targets: '.modal',
  scale: [0, 1],
  opacity: [0, 1],
  easing: 'easeOutBack(1.2)',
  duration: 400
});

// Modal close - quick out
anime({
  targets: '.modal',
  scale: 0.95,
  opacity: 0,
  easing: 'easeInQuad',
  duration: 200
});
```

### Menu Items

```javascript
// Staggered menu with spring
anime({
  targets: '.menu-item',
  translateX: [-50, 0],
  opacity: [0, 1],
  delay: stagger(50),
  easing: spring({ stiffness: 200, damping: 15 })
});
```

### Notification

```javascript
// Slide in with bounce
anime({
  targets: '.notification',
  translateY: [-100, 0],
  easing: 'easeOutBounce',
  duration: 800
});
```

### Loading Spinner

```javascript
anime({
  targets: '.spinner',
  rotate: 360,
  easing: 'linear',
  duration: 1000,
  loop: true
});
```

---

## Choosing the Right Easing

| Use Case | Recommended Easing |
|----------|-------------------|
| UI elements appearing | `easeOutQuad`, `easeOutCubic` |
| UI elements disappearing | `easeInQuad`, `easeInCubic` |
| Moving objects | `easeInOutQuad`, `easeInOutCubic` |
| Attention/emphasis | `easeOutElastic`, `easeOutBack` |
| Bouncing objects | `easeOutBounce` |
| Natural motion | `spring()` |
| Continuous rotation | `linear` |
| Snappy interactions | `easeOutExpo` |
| Dramatic reveals | `easeOutExpo`, `easeOutQuart` |

---

## Next Steps

- Explore the [Easings Visualizer](https://animejs.com/documentation/easings) on the official site
- Learn about [Animation](./03-animation.md) for applying easings
- Check out [Spring](./12-easings.md#spring) for physics-based motion
