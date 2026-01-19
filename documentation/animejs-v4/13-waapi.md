# WAAPI

anime.js v4 provides seamless integration with the Web Animations API (WAAPI) for hardware-accelerated animations.

## When to Use

Use WAAPI mode when you need:

- **Hardware acceleration**: GPU-accelerated transforms and opacity
- **Better performance**: Runs on the compositor thread
- **Smoother animations**: Especially on mobile devices
- **Main thread freedom**: Animations continue during JavaScript execution

### Best For

- Transform animations (`translate`, `rotate`, `scale`)
- Opacity animations
- Simple property animations
- Performance-critical animations
- Mobile experiences

### Not Ideal For

- Complex JavaScript-based animations
- Animating JS object properties
- SVG attribute animations
- Animations requiring frame-by-frame control
- Complex easing (spring, custom functions)

---

## Hardware-acceleration

WAAPI automatically hardware-accelerates supported properties.

```javascript
import anime from 'animejs';

// Hardware-accelerated animation
anime({
  targets: '.element',
  translateX: 250,
  rotate: 360,
  opacity: 0.5,
  duration: 1000,
  // WAAPI is used automatically for these properties
});
```

### Hardware-accelerated Properties

| Property | Accelerated |
|----------|-------------|
| `translateX`, `translateY`, `translateZ` | ✓ |
| `rotate`, `rotateX`, `rotateY`, `rotateZ` | ✓ |
| `scale`, `scaleX`, `scaleY`, `scaleZ` | ✓ |
| `opacity` | ✓ |
| `width`, `height` | ✗ |
| `backgroundColor` | ✗ |
| `margin`, `padding` | ✗ |

---

## Improvements to WAAPI

anime.js extends WAAPI with additional features and conveniences.

### Sensible Defaults

```javascript
// Native WAAPI
element.animate(
  [{ transform: 'translateX(0)' }, { transform: 'translateX(250px)' }],
  { duration: 1000, fill: 'forwards', easing: 'ease-out' }
);

// anime.js WAAPI
anime({
  targets: '.element',
  translateX: 250,
  duration: 1000,
  easing: 'easeOutQuad'
});
```

---

### Multi-targets Animation

Animate multiple targets with a single call.

```javascript
// Native WAAPI - need to loop
document.querySelectorAll('.element').forEach(el => {
  el.animate([/* ... */], { duration: 1000 });
});

// anime.js - handles multiple targets
anime({
  targets: '.element',
  translateX: 250
});
```

---

### Default Units

Units are automatically applied.

```javascript
// Native WAAPI - units required
element.animate(
  [{ transform: 'translateX(250px)' }],
  { duration: 1000 }
);

// anime.js - default units applied
anime({
  targets: '.element',
  translateX: 250  // 'px' added automatically
});
```

---

### Function Based Values

Dynamic values per target.

```javascript
anime({
  targets: '.element',
  translateX: (el, i) => i * 50,
  delay: (el, i) => i * 100,
  duration: 1000
});
```

---

### Individual Transforms

Animate transforms independently without overwriting.

```javascript
// Animate translateX
anime({
  targets: '.element',
  translateX: 250
});

// Simultaneously animate rotate (doesn't override translateX)
anime({
  targets: '.element',
  rotate: 360
});
```

---

### Individual Property Params

Different settings per property.

```javascript
anime({
  targets: '.element',
  translateX: {
    value: 250,
    duration: 500,
    easing: 'easeOutExpo'
  },
  rotate: {
    value: 360,
    duration: 1000,
    easing: 'easeInOutQuad'
  }
});
```

---

### Spring and Custom Easings

Use spring physics and custom easing functions.

```javascript
import { spring } from 'animejs';

anime({
  targets: '.element',
  translateX: 250,
  easing: spring({ stiffness: 200, damping: 15 })
});

// Custom easing function
anime({
  targets: '.element',
  translateX: 250,
  easing: (t) => t * t * t
});
```

---

## API Differences

### iterations

WAAPI uses `iterations` instead of `loop`.

```javascript
// anime.js
anime({
  targets: '.element',
  translateX: 250,
  loop: 3  // Internally converted to iterations
});

// Native WAAPI equivalent
element.animate([/* ... */], { iterations: 3 });
```

| anime.js | WAAPI |
|----------|-------|
| `loop: true` | `iterations: Infinity` |
| `loop: 3` | `iterations: 3` |
| `loop: false` | `iterations: 1` |

---

### direction

WAAPI uses different direction values.

```javascript
// anime.js
anime({
  targets: '.element',
  translateX: 250,
  alternate: true
});

// Native WAAPI equivalent
element.animate([/* ... */], { direction: 'alternate' });
```

| anime.js | WAAPI direction |
|----------|-----------------|
| `alternate: true` | `'alternate'` |
| `reversed: true` | `'reverse'` |
| `alternate: true, reversed: true` | `'alternate-reverse'` |

---

### easing

anime.js easing names are converted to WAAPI format.

```javascript
// anime.js
anime({
  targets: '.element',
  translateX: 250,
  easing: 'easeOutQuad'
});

// Internally converted to cubic-bezier for WAAPI
// 'easeOutQuad' → 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
```

---

### finished

Promise-based completion handling.

```javascript
// anime.js
const animation = anime({
  targets: '.element',
  translateX: 250
});

animation.then(() => {
  console.log('Complete!');
});

// Or async/await
await animation;

// Native WAAPI
const waAnimation = element.animate([/* ... */], { duration: 1000 });
await waAnimation.finished;
```

---

## convertEase()

Convert anime.js easing to WAAPI-compatible format.

```javascript
import { convertEase } from 'animejs';

const waApiEasing = convertEase('easeOutQuad');
// Returns: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

const waApiEasing2 = convertEase('easeInOutExpo');
// Returns: 'cubic-bezier(0.87, 0, 0.13, 1)'
```

### Using with Native WAAPI

```javascript
import { convertEase } from 'animejs';

element.animate(
  [
    { transform: 'translateX(0)' },
    { transform: 'translateX(250px)' }
  ],
  {
    duration: 1000,
    easing: convertEase('easeOutExpo'),
    fill: 'forwards'
  }
);
```

---

## Persist (WAAPI)

Keep styles after animation completes.

```javascript
anime({
  targets: '.element',
  translateX: 250,
  persist: true  // Maintains final state
});
```

### Without Persist

```javascript
anime({
  targets: '.element',
  translateX: 250,
  persist: false  // Element reverts to original position
});
```

This is equivalent to WAAPI's `fill: 'forwards'` vs `fill: 'none'`.

---

## Practical Examples

### Smooth Page Transitions

```javascript
// Hardware-accelerated page exit
async function exitPage() {
  await anime({
    targets: '.page-content',
    opacity: 0,
    translateY: -20,
    duration: 300,
    easing: 'easeInQuad'
  });
}

// Hardware-accelerated page enter
function enterPage() {
  anime({
    targets: '.page-content',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 500,
    easing: 'easeOutQuad'
  });
}
```

### Mobile-Optimized Animation

```javascript
// Runs smoothly even on lower-end devices
anime({
  targets: '.card',
  translateX: ['-100%', 0],
  opacity: [0, 1],
  duration: 400,
  easing: 'easeOutCubic'
});
```

### Scroll-Triggered with WAAPI

```javascript
import { onScroll, animate } from 'animejs';

document.querySelectorAll('.reveal').forEach(el => {
  onScroll({
    target: el,
    enter: 'top 80%',
    onEnter: () => {
      // Hardware-accelerated reveal
      animate(el, {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 600,
        easing: 'easeOutQuad'
      });
    }
  });
});
```

### Combining with Timeline

```javascript
import { timeline } from 'animejs';

const tl = timeline({
  defaults: {
    duration: 500,
    easing: 'easeOutQuad'
  }
});

tl.add({
  targets: '.hero-title',
  opacity: [0, 1],
  translateY: [30, 0]
})
.add({
  targets: '.hero-subtitle',
  opacity: [0, 1],
  translateY: [20, 0]
}, '-=300')
.add({
  targets: '.hero-cta',
  opacity: [0, 1],
  scale: [0.9, 1]
}, '-=200');
```

---

## Performance Tips

1. **Prefer transforms over layout properties**
   ```javascript
   // Good - hardware accelerated
   anime({ targets: '.el', translateX: 100 });
   
   // Avoid - causes layout recalculation
   anime({ targets: '.el', left: '100px' });
   ```

2. **Use opacity for visibility**
   ```javascript
   // Good
   anime({ targets: '.el', opacity: 0 });
   
   // Avoid - not hardware accelerated
   anime({ targets: '.el', visibility: 'hidden' });
   ```

3. **Batch animations**
   ```javascript
   // Good - single animation
   anime({
     targets: '.elements',
     translateX: 100,
     delay: stagger(50)
   });
   
   // Avoid - multiple separate animations
   document.querySelectorAll('.elements').forEach((el, i) => {
     anime({ targets: el, translateX: 100, delay: i * 50 });
   });
   ```

4. **Use `will-change` sparingly**
   ```css
   /* Only when needed */
   .animating { will-change: transform, opacity; }
   ```

---

## Browser Support

WAAPI is supported in all modern browsers:

- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

anime.js automatically falls back to JavaScript animations when WAAPI is not available.

---

## Next Steps

- Learn about [Engine](./14-engine.md) for global settings
- Explore [Animation](./03-animation.md) for all animation options
- Check out [Timeline](./04-timeline.md) for sequencing
