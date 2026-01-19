# Getting Started

This section covers how to install and set up anime.js v4 in your project.

## Installation

### NPM

```bash
npm install animejs
```

### Yarn

```bash
yarn add animejs
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4.0.0/lib/anime.min.js"></script>
```

### Download

You can also download the library directly from the [GitHub releases page](https://github.com/juliangarnier/anime/releases).

---

## Module Imports

### ES Modules (Recommended)

Import the default export for the main `anime` function:

```javascript
import anime from 'animejs';
```

### Named Imports

Import specific utilities and functions:

```javascript
import { animate, timeline, stagger, utils } from 'animejs';
```

### Available Exports

| Export | Description |
|--------|-------------|
| `anime` (default) | Main animation function |
| `animate` | Create animations |
| `timeline` | Create timelines |
| `timer` | Create timers |
| `stagger` | Stagger utility |
| `utils` | Utility functions |
| `eases` | Easing functions |
| `spring` | Spring easing creator |
| `svg` | SVG utilities |
| `createScope` | Scope creator |
| `createDraggable` | Draggable creator |
| `onScroll` | Scroll event handler |
| `engine` | Global engine instance |

### CommonJS

```javascript
const anime = require('animejs');
```

---

## Using with Vanilla JS

### Basic Animation

```javascript
import anime from 'animejs';

// Animate a single element
anime({
  targets: '.box',
  translateX: 250,
  duration: 1000
});
```

### Multiple Properties

```javascript
anime({
  targets: '.element',
  translateX: 250,
  rotate: '1turn',
  backgroundColor: '#FFF',
  duration: 800,
  easing: 'easeInOutQuad'
});
```

### Using the DOM

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/animejs@4.0.0/lib/anime.min.js"></script>
</head>
<body>
  <div class="box"></div>
  
  <script>
    anime({
      targets: '.box',
      translateX: 250,
      rotate: '1turn',
      duration: 2000,
      loop: true
    });
  </script>
</body>
</html>
```

### Targeting Elements

```javascript
// CSS Selector
anime({ targets: '.class-name', /* ... */ });

// DOM Element
const el = document.querySelector('.box');
anime({ targets: el, /* ... */ });

// NodeList
const els = document.querySelectorAll('.box');
anime({ targets: els, /* ... */ });

// Array of elements
anime({ targets: [el1, el2, el3], /* ... */ });

// JavaScript Object
const obj = { value: 0 };
anime({ targets: obj, value: 100, /* ... */ });
```

---

## Using with React

### Installation

```bash
npm install animejs
```

### Basic Usage with useRef

```jsx
import { useRef, useEffect } from 'react';
import anime from 'animejs';

function AnimatedBox() {
  const boxRef = useRef(null);

  useEffect(() => {
    anime({
      targets: boxRef.current,
      translateX: 250,
      rotate: '1turn',
      duration: 2000,
      easing: 'easeInOutQuad'
    });
  }, []);

  return <div ref={boxRef} className="box" />;
}
```

### With Cleanup

```jsx
import { useRef, useEffect } from 'react';
import anime from 'animejs';

function AnimatedComponent() {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current = anime({
      targets: elementRef.current,
      translateX: [0, 250],
      duration: 1000,
      loop: true,
      direction: 'alternate'
    });

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, []);

  return <div ref={elementRef}>Animated</div>;
}
```

### Custom Hook

```jsx
import { useRef, useEffect } from 'react';
import anime from 'animejs';

function useAnime(config) {
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      animationRef.current = anime({
        targets: elementRef.current,
        ...config
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, []);

  return { ref: elementRef, animation: animationRef };
}

// Usage
function MyComponent() {
  const { ref } = useAnime({
    translateX: 250,
    duration: 1000,
    easing: 'easeOutElastic(1, .5)'
  });

  return <div ref={ref}>Bouncy!</div>;
}
```

### Triggering Animations

```jsx
import { useRef } from 'react';
import anime from 'animejs';

function ClickToAnimate() {
  const boxRef = useRef(null);

  const handleClick = () => {
    anime({
      targets: boxRef.current,
      scale: [1, 1.5, 1],
      duration: 600,
      easing: 'easeInOutQuad'
    });
  };

  return (
    <div ref={boxRef} onClick={handleClick} className="box">
      Click me!
    </div>
  );
}
```

---

## TypeScript Support

anime.js v4 includes TypeScript definitions out of the box.

```typescript
import anime, { AnimeInstance, AnimeParams } from 'animejs';

const params: AnimeParams = {
  targets: '.element',
  translateX: 250,
  duration: 1000,
  easing: 'easeOutExpo'
};

const animation: AnimeInstance = anime(params);
```

---

## Next Steps

- Learn about [Timer](./02-timer.md) for basic playback control
- Explore [Animation](./03-animation.md) for detailed animation options
- Check out [Timeline](./04-timeline.md) for sequencing animations
