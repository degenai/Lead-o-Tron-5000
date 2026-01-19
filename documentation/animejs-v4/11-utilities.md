# Utilities

anime.js provides a comprehensive set of utility functions for animation, math operations, and DOM manipulation.

## stagger()

Create staggered delays or values for multiple targets.

### Time Staggering

```javascript
import { animate, stagger } from 'animejs';

// Basic stagger - 100ms between each element
animate('.item', {
  translateX: 250,
  delay: stagger(100)
});

// Start delay + stagger
animate('.item', {
  translateX: 250,
  delay: stagger(100, { start: 500 })  // 500ms initial delay
});
```

---

### Values Staggering

```javascript
// Stagger property values
animate('.item', {
  translateX: stagger(50),      // 0, 50, 100, 150, ...
  rotate: stagger(15),          // 0, 15, 30, 45, ...
  opacity: stagger(0.1, { start: 0.5 })  // 0.5, 0.6, 0.7, ...
});
```

---

### Timeline Staggering

```javascript
import { timeline, stagger } from 'animejs';

const tl = timeline();

document.querySelectorAll('.item').forEach((item, i) => {
  tl.add({
    targets: item,
    translateX: 250
  }, stagger(100)(null, i));  // Stagger time positions
});
```

---

### Value Types

#### Numerical

```javascript
// Fixed increment
animate('.item', {
  delay: stagger(100)  // 0, 100, 200, 300, ...
});
```

#### Range

```javascript
// Distribute values across a range
animate('.item', {
  delay: stagger([0, 1000])  // Spread delays from 0 to 1000ms
});

animate('.item', {
  opacity: stagger([0.2, 1])  // Spread opacity from 0.2 to 1
});
```

---

### Parameters

#### start

Initial value before staggering begins.

```javascript
animate('.item', {
  delay: stagger(100, { start: 500 })  // 500, 600, 700, ...
});
```

---

#### from

Control stagger origin point.

```javascript
// From first element (default)
stagger(100, { from: 'first' })

// From last element
stagger(100, { from: 'last' })

// From center
stagger(100, { from: 'center' })

// From specific index
stagger(100, { from: 3 })

// Random order
stagger(100, { from: 'random' })
```

---

#### reversed

Reverse the stagger order.

```javascript
animate('.item', {
  delay: stagger(100, { reversed: true })  // Last item first
});
```

---

#### ease

Apply easing to stagger distribution.

```javascript
animate('.item', {
  delay: stagger(100, { ease: 'easeInOutQuad' })
});

animate('.item', {
  translateX: stagger([0, 500], { ease: 'easeOutExpo' })
});
```

---

#### grid

Stagger in a 2D grid pattern.

```javascript
animate('.grid-item', {
  delay: stagger(100, { 
    grid: [5, 4],  // 5 columns, 4 rows
    from: 'center'
  })
});
```

---

#### axis

Control grid stagger axis.

```javascript
// Stagger along x-axis only
stagger(100, { grid: [5, 4], axis: 'x' })

// Stagger along y-axis only
stagger(100, { grid: [5, 4], axis: 'y' })
```

---

#### modifier

Transform stagger values.

```javascript
animate('.item', {
  delay: stagger(100, {
    modifier: (value, index) => value + (index * 10)
  })
});
```

---

#### use

Reference which property to use for calculations.

```javascript
stagger(100, { use: 'delay' })
stagger(100, { use: 'duration' })
```

---

#### total

Use total number of elements for calculations.

```javascript
animate('.item', {
  delay: stagger(100, { total: 10 })  // Always treat as 10 items
});
```

---

## $()

Query selector utility.

```javascript
import { $ } from 'animejs';

// Single element
const el = $('.box');

// Multiple elements
const items = $('.item');  // Returns array

// Scoped query
const children = $('.item', containerElement);
```

---

## get()

Get computed property values.

```javascript
import { utils } from 'animejs';

// Get CSS property
const opacity = utils.get('.element', 'opacity');
const transform = utils.get('.element', 'transform');

// Get computed translateX
const translateX = utils.get('.element', 'translateX');
```

---

## set()

Set property values instantly.

```javascript
import { utils } from 'animejs';

// Set CSS property
utils.set('.element', { opacity: 0.5 });

// Set multiple properties
utils.set('.element', {
  translateX: 100,
  rotate: 45,
  opacity: 0.8
});

// Set on multiple targets
utils.set('.item', {
  opacity: 0
});
```

---

## cleanInlineStyles()

Remove inline styles added by animations.

```javascript
import { utils } from 'animejs';

// Clean specific properties
utils.cleanInlineStyles('.element', ['transform', 'opacity']);

// Clean all inline styles
utils.cleanInlineStyles('.element');
```

---

## remove()

Remove animations from targets.

```javascript
import { utils } from 'animejs';

// Remove all animations from element
utils.remove('.element');

// Remove specific animation
utils.remove(animationInstance);
```

---

## sync()

Synchronize animations.

```javascript
import { utils } from 'animejs';

const anim1 = animate('.box-1', { translateX: 100 });
const anim2 = animate('.box-2', { translateX: 100 });

utils.sync(anim1, anim2);
```

---

## keepTime()

Prevent time jumps when tab is hidden.

```javascript
import { utils } from 'animejs';

utils.keepTime();
```

---

## random()

Generate random numbers.

```javascript
import { utils } from 'animejs';

// Random between 0 and 100
const num = utils.random(0, 100);

// Random integer
const int = utils.random(0, 100, true);

// Use in animations
animate('.element', {
  translateX: () => utils.random(-100, 100),
  rotate: () => utils.random(0, 360)
});
```

---

## createSeededRandom()

Create reproducible random number generator.

```javascript
import { utils } from 'animejs';

const seededRandom = utils.createSeededRandom(42);

// Always produces same sequence with same seed
console.log(seededRandom());  // Same value each time with seed 42
console.log(seededRandom());
```

---

## randomPick()

Pick random element from array.

```javascript
import { utils } from 'animejs';

const colors = ['#ff0000', '#00ff00', '#0000ff'];
const randomColor = utils.randomPick(colors);

animate('.element', {
  backgroundColor: () => utils.randomPick(colors)
});
```

---

## shuffle()

Shuffle array in place.

```javascript
import { utils } from 'animejs';

const items = [1, 2, 3, 4, 5];
utils.shuffle(items);
```

---

## round()

Round to decimal places.

```javascript
import { utils } from 'animejs';

utils.round(3.14159, 2);  // 3.14
utils.round(3.14159, 0);  // 3
```

---

## clamp()

Clamp value between min and max.

```javascript
import { utils } from 'animejs';

utils.clamp(150, 0, 100);   // 100
utils.clamp(-50, 0, 100);   // 0
utils.clamp(50, 0, 100);    // 50
```

---

## snap()

Snap value to nearest increment.

```javascript
import { utils } from 'animejs';

utils.snap(47, 10);   // 50
utils.snap(43, 10);   // 40
utils.snap(15, 4);    // 16
```

---

## wrap()

Wrap value within a range.

```javascript
import { utils } from 'animejs';

utils.wrap(370, 0, 360);   // 10
utils.wrap(-30, 0, 360);   // 330
utils.wrap(5, 0, 3);       // 2
```

---

## mapRange()

Map value from one range to another.

```javascript
import { utils } from 'animejs';

// Map 0.5 from [0,1] to [0,100]
utils.mapRange(0.5, 0, 1, 0, 100);  // 50

// Map scroll position to opacity
const scrollProgress = window.scrollY / maxScroll;
const opacity = utils.mapRange(scrollProgress, 0, 1, 0.2, 1);
```

---

## lerp()

Linear interpolation between values.

```javascript
import { utils } from 'animejs';

utils.lerp(0, 100, 0.5);    // 50
utils.lerp(0, 100, 0.25);   // 25
utils.lerp(10, 20, 0.75);   // 17.5
```

---

## damp()

Smooth damping for chase/follow effects.

```javascript
import { utils } from 'animejs';

let current = 0;
let target = 100;

function update() {
  current = utils.damp(current, target, 0.1);
  requestAnimationFrame(update);
}
```

---

## roundPad()

Round and pad number with zeros.

```javascript
import { utils } from 'animejs';

utils.roundPad(5, 3);       // "005"
utils.roundPad(42, 4);      // "0042"
utils.roundPad(123.456, 2); // "123"
```

---

## padStart()

Pad string at start.

```javascript
import { utils } from 'animejs';

utils.padStart('5', 3, '0');     // "005"
utils.padStart('hi', 5, '-');   // "---hi"
```

---

## padEnd()

Pad string at end.

```javascript
import { utils } from 'animejs';

utils.padEnd('5', 3, '0');      // "500"
utils.padEnd('hi', 5, '-');    // "hi---"
```

---

## degToRad()

Convert degrees to radians.

```javascript
import { utils } from 'animejs';

utils.degToRad(180);   // 3.14159...
utils.degToRad(90);    // 1.5708...
```

---

## radToDeg()

Convert radians to degrees.

```javascript
import { utils } from 'animejs';

utils.radToDeg(Math.PI);      // 180
utils.radToDeg(Math.PI / 2);  // 90
```

---

## Chain-able Utilities

Create fluent utility chains.

```javascript
import { utils } from 'animejs';

const result = utils
  .chain(50)
  .clamp(0, 100)
  .mapRange(0, 100, 0, 1)
  .round(2)
  .value();
```

---

## Practical Examples

### Grid Reveal

```javascript
animate('.grid-item', {
  opacity: [0, 1],
  scale: [0.5, 1],
  delay: stagger(50, {
    grid: [4, 4],
    from: 'center',
    ease: 'easeOutQuad'
  }),
  duration: 600
});
```

### Smooth Following

```javascript
const cursor = { x: 0, y: 0 };
const follower = { x: 0, y: 0 };

document.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

function update() {
  follower.x = utils.damp(follower.x, cursor.x, 0.1);
  follower.y = utils.damp(follower.y, cursor.y, 0.1);
  
  utils.set('.follower', {
    translateX: follower.x,
    translateY: follower.y
  });
  
  requestAnimationFrame(update);
}

update();
```

### Random Particle System

```javascript
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

document.querySelectorAll('.particle').forEach(particle => {
  animate(particle, {
    translateX: () => utils.random(-200, 200),
    translateY: () => utils.random(-200, 200),
    rotate: () => utils.random(0, 360),
    scale: () => utils.random(0.5, 1.5),
    backgroundColor: () => utils.randomPick(colors),
    duration: () => utils.random(1000, 3000),
    delay: () => utils.random(0, 1000),
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutQuad'
  });
});
```

---

## Next Steps

- Learn about [Stagger](./11-utilities.md#stagger) for cascading animations
- Explore [Easings](./12-easings.md) for timing functions
- Check out [Animation](./03-animation.md) for property animation
