# Scope

Scope provides a way to manage and organize animations, handle cleanup, and respond to media queries.

## Creating a Scope

```javascript
import { createScope } from 'animejs';

const scope = createScope();
```

---

## Add Constructor Function

Add animations using a constructor function that runs immediately.

```javascript
const scope = createScope({
  root: '.container'
});

scope.add((self) => {
  // Animations created here are tracked by the scope
  self.animate('.box', {
    translateX: 250,
    duration: 1000
  });
  
  self.timeline()
    .add({ targets: '.box-1', translateX: 100 })
    .add({ targets: '.box-2', translateX: 100 });
});
```

### Available Methods in Constructor

| Method | Description |
|--------|-------------|
| `self.animate()` | Create animation |
| `self.timeline()` | Create timeline |
| `self.timer()` | Create timer |
| `self.draggable()` | Create draggable |
| `self.animatable()` | Create animatable |
| `self.onScroll()` | Create scroll observer |

---

## Register Method Function

Register reusable animation methods.

```javascript
const scope = createScope();

// Register a reusable animation
scope.add('fadeIn', (self, targets, options = {}) => {
  return self.animate(targets, {
    opacity: [0, 1],
    duration: options.duration || 500,
    ease: 'easeOutQuad'
  });
});

scope.add('slideIn', (self, targets, direction = 'left') => {
  const from = direction === 'left' ? -100 : 100;
  return self.animate(targets, {
    translateX: [from, 0],
    opacity: [0, 1],
    duration: 600
  });
});

// Use registered methods
scope.fadeIn('.element');
scope.slideIn('.panel', 'right');
```

---

## Parameters

### root

Scope all selectors to a root element.

```javascript
const scope = createScope({
  root: '.app-container'
});

scope.add((self) => {
  // '.box' becomes '.app-container .box'
  self.animate('.box', {
    translateX: 250
  });
});
```

```javascript
// DOM element as root
const scope = createScope({
  root: document.querySelector('#app')
});
```

---

### defaults

Set default animation parameters for the scope.

```javascript
const scope = createScope({
  defaults: {
    duration: 800,
    easing: 'easeOutExpo',
    delay: 100
  }
});

scope.add((self) => {
  // Uses scope defaults
  self.animate('.box', {
    translateX: 250
  });
  
  // Override specific defaults
  self.animate('.other', {
    translateX: 250,
    duration: 400  // Overrides default
  });
});
```

---

### mediaQueries

Create responsive animations with media query support.

```javascript
const scope = createScope({
  mediaQueries: {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)'
  }
});

// Add animations for specific breakpoints
scope.add((self) => {
  // Runs on all breakpoints
  self.animate('.logo', {
    opacity: [0, 1],
    duration: 500
  });
});

scope.add('mobile', (self) => {
  // Only runs on mobile
  self.animate('.menu', {
    translateX: ['-100%', 0],
    duration: 300
  });
});

scope.add('desktop', (self) => {
  // Only runs on desktop
  self.animate('.sidebar', {
    translateX: ['-100%', 0],
    duration: 500
  });
});
```

#### Listening to Media Query Changes

```javascript
const scope = createScope({
  mediaQueries: {
    dark: '(prefers-color-scheme: dark)',
    light: '(prefers-color-scheme: light)'
  }
});

scope.add('dark', (self) => {
  self.animate('.theme-icon', {
    rotate: 180
  });
});

scope.add('light', (self) => {
  self.animate('.theme-icon', {
    rotate: 0
  });
});
```

---

## Methods

### add()

Add animations or register methods.

```javascript
// Add animation constructor
scope.add((self) => {
  self.animate('.box', { translateX: 100 });
});

// Add for specific media query
scope.add('mobile', (self) => {
  self.animate('.box', { translateX: 50 });
});

// Register named method
scope.add('bounce', (self, targets) => {
  return self.animate(targets, {
    translateY: [0, -30, 0],
    duration: 600,
    ease: 'easeOutBounce'
  });
});
```

**Returns:** `Scope` - For chaining.

---

### addOnce()

Add animation that only runs once.

```javascript
scope.addOnce((self) => {
  // Only runs on initial page load
  self.animate('.intro', {
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 1000
  });
});
```

**Returns:** `Scope` - For chaining.

---

### keepTime()

Keep animations synchronized during tab switches.

```javascript
scope.keepTime();
```

This prevents animations from jumping ahead when the tab regains focus.

**Returns:** `Scope` - For chaining.

---

### revert()

Revert all animations and clean up.

```javascript
scope.revert();
```

Useful for:
- Component unmounting in frameworks
- Page transitions
- Resetting state

**Returns:** `Scope` - For chaining.

---

### refresh()

Recalculate animations after DOM changes.

```javascript
window.addEventListener('resize', () => {
  scope.refresh();
});

// After dynamic content loads
fetch('/api/content').then(() => {
  updateDOM();
  scope.refresh();
});
```

**Returns:** `Scope` - For chaining.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `root` | `Element` | Root element for selector scoping |
| `defaults` | `Object` | Default animation parameters |
| `animations` | `Array` | All managed animations |
| `timelines` | `Array` | All managed timelines |

---

## Practical Examples

### React Component Integration

```jsx
import { useEffect, useRef } from 'react';
import { createScope } from 'animejs';

function AnimatedComponent() {
  const containerRef = useRef(null);
  const scopeRef = useRef(null);

  useEffect(() => {
    scopeRef.current = createScope({
      root: containerRef.current
    });

    scopeRef.current.add((self) => {
      self.animate('.box', {
        translateX: 250,
        opacity: [0, 1],
        delay: (el, i) => i * 100
      });
    });

    // Cleanup on unmount
    return () => {
      scopeRef.current.revert();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <div className="box">1</div>
      <div className="box">2</div>
      <div className="box">3</div>
    </div>
  );
}
```

### Page Transitions

```javascript
const pageScope = createScope({ root: '#page' });

function enterPage() {
  pageScope.add((self) => {
    self.timeline()
      .add({ targets: '.header', opacity: [0, 1], translateY: [-20, 0] })
      .add({ targets: '.content', opacity: [0, 1] }, '-=200')
      .add({ targets: '.footer', opacity: [0, 1] }, '-=200');
  });
}

function leavePage() {
  pageScope.revert();
}
```

### Responsive Animations

```javascript
const uiScope = createScope({
  root: '#app',
  mediaQueries: {
    mobile: '(max-width: 768px)',
    desktop: '(min-width: 769px)'
  }
});

uiScope.add('mobile', (self) => {
  // Mobile navigation
  self.add('toggleMenu', (s, isOpen) => {
    return s.animate('.mobile-menu', {
      translateX: isOpen ? 0 : '-100%',
      duration: 300
    });
  });
});

uiScope.add('desktop', (self) => {
  // Desktop hover effects
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      self.animate(item, { scale: 1.05, duration: 200 });
    });
    item.addEventListener('mouseleave', () => {
      self.animate(item, { scale: 1, duration: 200 });
    });
  });
});
```

---

## Next Steps

- Learn about [Events](./08-events.md) for scroll-linked animations
- Explore [Timeline](./04-timeline.md) for sequencing
- Check out [Utilities](./11-utilities.md) for helper functions
