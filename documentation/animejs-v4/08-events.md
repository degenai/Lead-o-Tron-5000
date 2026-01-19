# Events

Events provide scroll-linked animations and intersection-based triggers.

## onScroll

Create scroll-triggered animations.

```javascript
import { onScroll } from 'animejs';

onScroll({
  target: '.element',
  onEnter: () => {
    console.log('Element entered viewport');
  }
});
```

---

## Settings

### container

The scroll container to observe.

```javascript
onScroll({
  container: '.scroll-container',  // Custom scroll container
  target: '.element',
  onEnter: () => { /* ... */ }
});

// Default is window
onScroll({
  container: window,
  target: '.element',
  onEnter: () => { /* ... */ }
});
```

---

### target

The element to observe.

```javascript
onScroll({
  target: '.observed-element',
  onEnter: () => { /* ... */ }
});

// Multiple targets
document.querySelectorAll('.item').forEach(el => {
  onScroll({
    target: el,
    onEnter: () => { /* ... */ }
  });
});
```

---

### debug

Show visual debugging guides.

```javascript
onScroll({
  target: '.element',
  debug: true,  // Shows threshold markers
  onEnter: () => { /* ... */ }
});
```

---

### axis

Scroll axis to observe.

```javascript
// Vertical scrolling (default)
onScroll({
  target: '.element',
  axis: 'y',
  onEnter: () => { /* ... */ }
});

// Horizontal scrolling
onScroll({
  target: '.element',
  axis: 'x',
  onEnter: () => { /* ... */ }
});
```

---

### repeat

Whether callbacks should repeat on re-entry.

```javascript
// Trigger only once (default)
onScroll({
  target: '.element',
  repeat: false,
  onEnter: () => { /* ... */ }
});

// Trigger every time
onScroll({
  target: '.element',
  repeat: true,
  onEnter: () => { /* ... */ }
});
```

---

## Thresholds

Define when enter/leave events fire.

### Numeric Values

Pixel values for threshold positions.

```javascript
onScroll({
  target: '.element',
  enter: 100,    // 100px from viewport edge
  leave: -100,   // 100px outside viewport
  onEnter: () => { /* ... */ }
});
```

---

### Position Shorthands

Use string shorthands for common positions.

```javascript
onScroll({
  target: '.element',
  enter: 'top',      // When element top reaches viewport top
  leave: 'bottom',   // When element bottom leaves viewport
  onEnter: () => { /* ... */ }
});
```

| Shorthand | Description |
|-----------|-------------|
| `'top'` | Top of viewport/element |
| `'center'` | Center of viewport/element |
| `'bottom'` | Bottom of viewport/element |
| `'left'` | Left of viewport/element |
| `'right'` | Right of viewport/element |

---

### Relative Position Values

Use percentages or relative values.

```javascript
onScroll({
  target: '.element',
  enter: '25%',     // 25% from top of viewport
  leave: '75%',     // 75% from top of viewport
  onEnter: () => { /* ... */ }
});

// Combined format: "element viewport"
onScroll({
  target: '.element',
  enter: 'top 80%',     // Element top at 80% of viewport
  leave: 'bottom 20%',  // Element bottom at 20% of viewport
  onEnter: () => { /* ... */ }
});
```

---

### Min Max

Define both enter and leave thresholds.

```javascript
onScroll({
  target: '.element',
  enter: { min: 'top 100%', max: 'bottom 0%' },
  onEnter: () => { /* ... */ }
});
```

---

## Synchronization Modes

### Method Names

Sync scroll with animation methods.

```javascript
import { animate, onScroll } from 'animejs';

const anim = animate('.element', {
  translateX: 250,
  autoplay: false
});

onScroll({
  target: '.trigger',
  sync: anim,
  syncMethod: 'play',     // Calls anim.play() on enter
  syncReverse: 'reverse'  // Calls anim.reverse() on leave
});
```

---

### Playback Progress

Link scroll position to animation progress.

```javascript
const anim = animate('.element', {
  translateX: 250,
  autoplay: false
});

onScroll({
  target: '.section',
  sync: anim,
  enter: 'top bottom',
  leave: 'bottom top',
  // Animation progress follows scroll position
});
```

```javascript
// Full section animation
onScroll({
  target: '.parallax-section',
  enter: 'top 100%',
  leave: 'bottom 0%',
  sync: animate('.parallax-bg', {
    translateY: [-100, 100],
    autoplay: false
  })
});
```

---

### Smooth Scroll

Smooth interpolation of scroll-linked values.

```javascript
onScroll({
  target: '.section',
  sync: animate('.element', {
    translateX: 250,
    autoplay: false
  }),
  smooth: true,
  smoothAmount: 0.1  // Lower = smoother
});
```

---

### Eased Scroll

Apply easing to scroll progress.

```javascript
onScroll({
  target: '.section',
  sync: animate('.element', {
    translateX: 250,
    autoplay: false
  }),
  ease: 'easeInOutQuad'
});
```

---

## Callbacks

### onEnter

Called when target enters the viewport.

```javascript
onScroll({
  target: '.element',
  onEnter: (self) => {
    console.log('Entered!');
    console.log('Scroll progress:', self.progress);
  }
});
```

---

### onEnterForward

Called when entering while scrolling down/right.

```javascript
onScroll({
  target: '.element',
  onEnterForward: (self) => {
    console.log('Entered scrolling forward');
  }
});
```

---

### onEnterBackward

Called when entering while scrolling up/left.

```javascript
onScroll({
  target: '.element',
  onEnterBackward: (self) => {
    console.log('Entered scrolling backward');
  }
});
```

---

### onLeave

Called when target leaves the viewport.

```javascript
onScroll({
  target: '.element',
  onLeave: (self) => {
    console.log('Left viewport');
  }
});
```

---

### onLeaveForward

Called when leaving while scrolling down/right.

```javascript
onScroll({
  target: '.element',
  onLeaveForward: (self) => {
    console.log('Left scrolling forward');
  }
});
```

---

### onLeaveBackward

Called when leaving while scrolling up/left.

```javascript
onScroll({
  target: '.element',
  onLeaveBackward: (self) => {
    console.log('Left scrolling backward');
  }
});
```

---

### onUpdate

Called on every scroll update while in range.

```javascript
onScroll({
  target: '.element',
  enter: 'top bottom',
  leave: 'bottom top',
  onUpdate: (self) => {
    console.log('Progress:', self.progress);
    console.log('Velocity:', self.velocity);
  }
});
```

---

### onSyncComplete

Called when synced animation completes.

```javascript
onScroll({
  target: '.section',
  sync: animate('.element', { translateX: 250 }),
  onSyncComplete: (self) => {
    console.log('Synced animation finished');
  }
});
```

---

## Methods

### link()

Link additional animations to the scroll observer.

```javascript
const scroll = onScroll({
  target: '.section',
  enter: 'top bottom',
  leave: 'bottom top'
});

scroll.link(animate('.bg', {
  scale: [1, 1.2],
  autoplay: false
}));

scroll.link(animate('.text', {
  opacity: [0, 1],
  autoplay: false
}));
```

**Returns:** `ScrollObserver` - For chaining.

---

### refresh()

Recalculate after layout changes.

```javascript
const scroll = onScroll({
  target: '.element',
  onEnter: () => { /* ... */ }
});

window.addEventListener('resize', () => {
  scroll.refresh();
});
```

**Returns:** `ScrollObserver` - For chaining.

---

### revert()

Remove the scroll observer and clean up.

```javascript
const scroll = onScroll({
  target: '.element',
  onEnter: () => { /* ... */ }
});

// Later...
scroll.revert();
```

**Returns:** `ScrollObserver` - For chaining.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `progress` | `number` | Current scroll progress (0-1) |
| `velocity` | `number` | Current scroll velocity |
| `isInView` | `boolean` | Whether target is in viewport |
| `direction` | `number` | Scroll direction (1 or -1) |

---

## Practical Examples

### Fade In on Scroll

```javascript
document.querySelectorAll('.fade-in').forEach(el => {
  onScroll({
    target: el,
    enter: 'top 80%',
    repeat: false,
    onEnter: () => {
      animate(el, {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 600,
        ease: 'easeOutQuad'
      });
    }
  });
});
```

### Parallax Background

```javascript
document.querySelectorAll('.parallax-section').forEach(section => {
  const bg = section.querySelector('.parallax-bg');
  
  onScroll({
    target: section,
    enter: 'top 100%',
    leave: 'bottom 0%',
    sync: animate(bg, {
      translateY: ['-20%', '20%'],
      autoplay: false
    })
  });
});
```

### Progress Indicator

```javascript
onScroll({
  container: window,
  target: document.body,
  enter: 'top top',
  leave: 'bottom bottom',
  onUpdate: (self) => {
    document.querySelector('.progress-bar').style.width = 
      `${self.progress * 100}%`;
  }
});
```

### Sticky Header Reveal

```javascript
let lastProgress = 0;

onScroll({
  target: document.body,
  enter: 'top top',
  leave: 'bottom bottom',
  onUpdate: (self) => {
    const header = document.querySelector('.header');
    
    if (self.progress < lastProgress) {
      // Scrolling up - show header
      header.classList.add('visible');
    } else if (self.progress > 0.1) {
      // Scrolling down - hide header
      header.classList.remove('visible');
    }
    
    lastProgress = self.progress;
  }
});
```

---

## Next Steps

- Learn about [Timeline](./04-timeline.md) for sequencing scroll animations
- Explore [Animatable](./05-animatable.md) for reactive bindings
- Check out [SVG](./09-svg.md) for path animations
