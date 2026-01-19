# Draggable

Draggable enables smooth drag interactions with physics-based movement, snapping, and containment.

## Creating a Draggable

```javascript
import { createDraggable } from 'animejs';

const draggable = createDraggable('.element');
```

---

## Axes Parameters

### x

Configure horizontal axis dragging.

```javascript
const draggable = createDraggable('.element', {
  x: true,           // Enable x-axis (default)
  y: false           // Disable y-axis
});

// With bounds
const bounded = createDraggable('.element', {
  x: { min: 0, max: 500 }
});
```

---

### y

Configure vertical axis dragging.

```javascript
const draggable = createDraggable('.element', {
  x: false,
  y: true  // Only vertical dragging
});

// With bounds
const bounded = createDraggable('.element', {
  y: { min: 0, max: 300 }
});
```

---

### snap

Snap to specific positions or intervals.

```javascript
// Snap to grid
const gridSnap = createDraggable('.element', {
  x: { snap: 50 },   // Snap every 50px
  y: { snap: 50 }
});

// Snap to specific positions
const positionSnap = createDraggable('.element', {
  x: { snap: [0, 100, 250, 400] }
});

// Function-based snap
const customSnap = createDraggable('.element', {
  x: {
    snap: (value) => Math.round(value / 100) * 100
  }
});
```

---

### modifier

Transform drag values.

```javascript
const draggable = createDraggable('.element', {
  x: {
    modifier: (value) => Math.max(0, value)  // Prevent negative values
  }
});
```

---

### mapTo

Map drag values to another property or element.

```javascript
const draggable = createDraggable('.handle', {
  x: {
    mapTo: '.slider-fill',  // Apply x value to another element
  }
});

// Map to different property
const rotationDrag = createDraggable('.dial', {
  x: {
    mapTo: {
      targets: '.dial',
      property: 'rotate'
    }
  }
});
```

---

## Settings

### trigger

Element that triggers the drag.

```javascript
const draggable = createDraggable('.panel', {
  trigger: '.panel-header'  // Only drag when grabbing header
});
```

---

### container

Constrain dragging within a container.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds'
});

// Or DOM element
const draggable2 = createDraggable('.element', {
  container: document.querySelector('.bounds')
});
```

---

### containerPadding

Padding inside the container bounds.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds',
  containerPadding: 20  // 20px padding on all sides
});

// Or per-side
const draggable2 = createDraggable('.element', {
  container: '.bounds',
  containerPadding: { top: 10, right: 20, bottom: 10, left: 20 }
});
```

---

### containerFriction

Resistance when dragging at container edges.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds',
  containerFriction: 0.85  // Bouncy edge feel
});
```

| Type | Default |
|------|---------|
| `number` | `0.75` |

---

### releaseContainerFriction

Friction when released at container edges.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds',
  releaseContainerFriction: 0.5
});
```

---

### releaseMass

Mass affects momentum on release.

```javascript
const draggable = createDraggable('.element', {
  releaseMass: 2  // Heavier, more momentum
});
```

| Type | Default |
|------|---------|
| `number` | `1` |

---

### releaseStiffness

Spring stiffness on release.

```javascript
const draggable = createDraggable('.element', {
  releaseStiffness: 100
});
```

| Type | Default |
|------|---------|
| `number` | `80` |

---

### releaseDamping

Spring damping on release.

```javascript
const draggable = createDraggable('.element', {
  releaseDamping: 20
});
```

| Type | Default |
|------|---------|
| `number` | `15` |

---

### velocityMultiplier

Multiply release velocity.

```javascript
const draggable = createDraggable('.element', {
  velocityMultiplier: 1.5  // 50% more momentum
});
```

| Type | Default |
|------|---------|
| `number` | `1` |

---

### minVelocity

Minimum velocity threshold.

```javascript
const draggable = createDraggable('.element', {
  minVelocity: 0.1
});
```

---

### maxVelocity

Maximum velocity cap.

```javascript
const draggable = createDraggable('.element', {
  maxVelocity: 50
});
```

---

### releaseEase

Easing for release animation.

```javascript
const draggable = createDraggable('.element', {
  releaseEase: 'easeOutExpo'
});
```

---

### dragSpeed

Drag speed multiplier.

```javascript
const draggable = createDraggable('.element', {
  dragSpeed: 0.5  // Half speed
});
```

| Type | Default |
|------|---------|
| `number` | `1` |

---

### dragThreshold

Minimum distance before drag starts.

```javascript
const draggable = createDraggable('.element', {
  dragThreshold: 10  // Must move 10px before dragging
});
```

| Type | Default |
|------|---------|
| `number` | `0` |

---

### scrollThreshold

Distance from edge to trigger scroll.

```javascript
const draggable = createDraggable('.element', {
  scrollThreshold: 50  // 50px from edge starts scrolling
});
```

---

### scrollSpeed

Auto-scroll speed near edges.

```javascript
const draggable = createDraggable('.element', {
  scrollSpeed: 10
});
```

---

### cursor

Cursor styles during drag states.

```javascript
const draggable = createDraggable('.element', {
  cursor: {
    grab: 'grab',
    grabbing: 'grabbing'
  }
});
```

---

## Callbacks

### onGrab

Called when element is grabbed.

```javascript
const draggable = createDraggable('.element', {
  onGrab: (self) => {
    console.log('Grabbed!');
    console.log('Position:', self.x, self.y);
  }
});
```

---

### onDrag

Called during drag movement.

```javascript
const draggable = createDraggable('.element', {
  onDrag: (self) => {
    console.log('Dragging:', self.x, self.y);
    console.log('Velocity:', self.velocityX, self.velocityY);
  }
});
```

---

### onUpdate

Called on every frame.

```javascript
const draggable = createDraggable('.element', {
  onUpdate: (self) => {
    console.log('Update:', self.x, self.y);
  }
});
```

---

### onRelease

Called when element is released.

```javascript
const draggable = createDraggable('.element', {
  onRelease: (self) => {
    console.log('Released!');
    console.log('Velocity:', self.velocityX, self.velocityY);
  }
});
```

---

### onSnap

Called when snapping to a position.

```javascript
const draggable = createDraggable('.element', {
  x: { snap: [0, 100, 200] },
  onSnap: (self) => {
    console.log('Snapped to:', self.x);
  }
});
```

---

### onSettle

Called when movement settles.

```javascript
const draggable = createDraggable('.element', {
  onSettle: (self) => {
    console.log('Settled at:', self.x, self.y);
  }
});
```

---

### onResize

Called when container resizes.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds',
  onResize: (self) => {
    console.log('Container resized');
  }
});
```

---

### onAfterResize

Called after resize calculations.

```javascript
const draggable = createDraggable('.element', {
  container: '.bounds',
  onAfterResize: (self) => {
    console.log('Resize complete');
  }
});
```

---

## Methods

### disable()

Disable dragging.

```javascript
const draggable = createDraggable('.element');

draggable.disable();
```

---

### enable()

Re-enable dragging.

```javascript
draggable.enable();
```

---

### setX()

Set x position programmatically.

```javascript
draggable.setX(100);

// Animate to position
draggable.setX(100, { duration: 500 });
```

---

### setY()

Set y position programmatically.

```javascript
draggable.setY(200);

// Animate to position
draggable.setY(200, { duration: 500, ease: 'easeOutQuad' });
```

---

### animateInView()

Animate to bring element into view.

```javascript
draggable.animateInView({
  duration: 500,
  ease: 'easeOutQuad'
});
```

---

### scrollInView()

Scroll to bring element into view.

```javascript
draggable.scrollInView();
```

---

### stop()

Stop current movement.

```javascript
draggable.stop();
```

---

### reset()

Reset to initial position.

```javascript
draggable.reset();
```

---

### revert()

Revert and remove draggable.

```javascript
draggable.revert();
```

---

### refresh()

Recalculate after DOM changes.

```javascript
window.addEventListener('resize', () => {
  draggable.refresh();
});
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | Current x position |
| `y` | `number` | Current y position |
| `velocityX` | `number` | Current x velocity |
| `velocityY` | `number` | Current y velocity |
| `isDragging` | `boolean` | Whether currently dragging |
| `isReleasing` | `boolean` | Whether in release animation |
| `disabled` | `boolean` | Whether dragging is disabled |
| `targets` | `Array` | Target elements |

---

## Practical Examples

### Carousel Slider

```javascript
const carousel = createDraggable('.carousel-track', {
  y: false,
  x: {
    snap: (value) => {
      const slideWidth = 300;
      return Math.round(value / slideWidth) * slideWidth;
    }
  },
  releaseStiffness: 100,
  releaseDamping: 20,
  onSnap: (self) => {
    const currentSlide = Math.abs(self.x / 300);
    updateIndicators(currentSlide);
  }
});
```

### Reorderable List

```javascript
document.querySelectorAll('.list-item').forEach((item) => {
  createDraggable(item, {
    x: false,
    y: { snap: 50 },  // Snap to item height
    onDrag: (self) => {
      updateListOrder(item, self.y);
    },
    onSettle: () => {
      saveListOrder();
    }
  });
});
```

---

## Next Steps

- Learn about [Scope](./07-scope.md) for managing multiple instances
- Explore [Events](./08-events.md) for scroll interactions
- Check out [Animatable](./05-animatable.md) for value binding
