# Text

anime.js provides utilities for splitting and animating text content.

## splitText()

Split text into animatable elements.

```javascript
import { splitText, animate, stagger } from 'animejs';

const split = splitText('.heading');

animate(split.chars, {
  opacity: [0, 1],
  translateY: [20, 0],
  delay: stagger(50)
});
```

---

## Settings

### lines

Split text into line elements.

```javascript
const split = splitText('.paragraph', {
  lines: true
});

animate(split.lines, {
  opacity: [0, 1],
  translateY: [30, 0],
  delay: stagger(100)
});
```

---

### words

Split text into word elements.

```javascript
const split = splitText('.heading', {
  words: true
});

animate(split.words, {
  opacity: [0, 1],
  translateX: [-20, 0],
  delay: stagger(50)
});
```

---

### chars

Split text into character elements.

```javascript
const split = splitText('.title', {
  chars: true  // Default: true
});

animate(split.chars, {
  opacity: [0, 1],
  scale: [0, 1],
  delay: stagger(30)
});
```

---

### debug

Add visual debugging outlines.

```javascript
const split = splitText('.text', {
  debug: true  // Adds colored borders to split elements
});
```

---

### includeSpaces

Include space characters as elements.

```javascript
const split = splitText('.text', {
  chars: true,
  includeSpaces: true  // Spaces become elements too
});
```

---

### accessible

Preserve accessibility by keeping original text in the DOM.

```javascript
const split = splitText('.heading', {
  accessible: true  // Keeps aria-label with original text
});
```

---

## Split Parameters

### class

Add custom class names to split elements.

```javascript
const split = splitText('.heading', {
  chars: { class: 'char' },
  words: { class: 'word' },
  lines: { class: 'line' }
});
```

Output:
```html
<span class="line">
  <span class="word">
    <span class="char">H</span>
    <span class="char">e</span>
    <span class="char">l</span>
    <span class="char">l</span>
    <span class="char">o</span>
  </span>
</span>
```

---

### wrap

Wrap split elements in a container.

```javascript
const split = splitText('.heading', {
  chars: {
    wrap: '<span class="char-wrapper"></span>'
  }
});
```

Output:
```html
<span class="char-wrapper">
  <span>H</span>
</span>
```

---

### clone

Clone the original element for effects.

```javascript
const split = splitText('.heading', {
  chars: {
    clone: true  // Creates duplicate for effects like shadows
  }
});
```

---

## HTML Template

Use custom HTML templates for split elements.

```javascript
const split = splitText('.heading', {
  chars: {
    template: (char, index) => `
      <span class="char" style="--index: ${index}">
        ${char}
      </span>
    `
  }
});
```

### With Data Attributes

```javascript
const split = splitText('.text', {
  words: {
    template: (word, index, total) => `
      <span 
        class="word" 
        data-index="${index}"
        data-total="${total}"
      >${word}</span>
    `
  }
});
```

---

## Methods

### addEffect()

Add animation effects to split text.

```javascript
const split = splitText('.heading');

split.addEffect({
  targets: split.chars,
  opacity: [0, 1],
  translateY: [20, 0],
  delay: stagger(30),
  duration: 600
});
```

**Returns:** `Animation` - The created animation.

---

### revert()

Restore original text content.

```javascript
const split = splitText('.heading');

// After animations
split.revert();  // Restores original HTML
```

---

### refresh()

Recalculate after content or layout changes.

```javascript
const split = splitText('.heading');

window.addEventListener('resize', () => {
  split.refresh();  // Recalculate line breaks
});
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `el` | `Element` | The original element |
| `chars` | `Array` | Array of character elements |
| `words` | `Array` | Array of word elements |
| `lines` | `Array` | Array of line elements |
| `original` | `string` | Original text content |

---

## Practical Examples

### Typewriter Effect

```javascript
const split = splitText('.typewriter');

animate(split.chars, {
  opacity: [0, 1],
  delay: stagger(50),
  duration: 1,
  easing: 'steps(1)'
});
```

### Wave Animation

```javascript
const split = splitText('.wave-text', {
  chars: { class: 'wave-char' }
});

animate(split.chars, {
  translateY: [0, -20, 0],
  delay: stagger(30, { from: 'center' }),
  duration: 600,
  loop: true,
  easing: 'easeInOutQuad'
});
```

### Staggered Reveal

```javascript
const split = splitText('.reveal-heading', {
  lines: true,
  words: true
});

const tl = timeline();

tl.add({
  targets: split.lines,
  opacity: [0, 1],
  delay: stagger(100)
});

tl.add({
  targets: split.words,
  translateY: [20, 0],
  delay: stagger(30)
}, '-=400');
```

### Glitch Effect

```javascript
const split = splitText('.glitch-text', {
  chars: {
    clone: true,
    class: 'glitch-char'
  }
});

split.chars.forEach((char, i) => {
  animate(char, {
    translateX: () => anime.random(-5, 5),
    translateY: () => anime.random(-5, 5),
    opacity: [1, 0.8, 1],
    duration: 100,
    delay: i * 10,
    loop: true,
    direction: 'alternate',
    easing: 'steps(2)'
  });
});
```

### Scroll-Triggered Text

```javascript
import { splitText, animate, stagger, onScroll } from 'animejs';

const split = splitText('.scroll-heading');

onScroll({
  target: '.scroll-heading',
  enter: 'top 80%',
  onEnter: () => {
    animate(split.chars, {
      opacity: [0, 1],
      translateY: [50, 0],
      rotateX: [-90, 0],
      delay: stagger(20),
      duration: 800,
      easing: 'easeOutQuad'
    });
  }
});
```

### Color Wave

```javascript
const split = splitText('.color-wave');

animate(split.chars, {
  color: ['#ff0000', '#00ff00', '#0000ff', '#ff0000'],
  delay: stagger(50, { from: 'first' }),
  duration: 2000,
  loop: true,
  easing: 'linear'
});
```

### Scramble Effect

```javascript
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function scramble(element, finalText) {
  const split = splitText(element);
  
  split.chars.forEach((char, i) => {
    const originalChar = finalText[i];
    let iterations = 0;
    
    const interval = setInterval(() => {
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      iterations++;
      
      if (iterations > 10) {
        char.textContent = originalChar;
        clearInterval(interval);
      }
    }, 30);
  });
}

scramble('.scramble-text', 'Hello World');
```

### Responsive Line Animation

```javascript
const split = splitText('.responsive-text', {
  lines: true
});

// Re-split on resize (line breaks change)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    split.refresh();
  }, 250);
});

animate(split.lines, {
  opacity: [0, 1],
  translateY: [30, 0],
  delay: stagger(100),
  duration: 600
});
```

---

## CSS Tips

```css
/* Prevent layout shifts during animation */
.split-text {
  overflow: hidden;
}

/* Smooth character animations */
.char {
  display: inline-block;
  will-change: transform, opacity;
}

/* Line overflow for reveals */
.line {
  display: block;
  overflow: hidden;
}

/* Word spacing preservation */
.word {
  display: inline-block;
  white-space: nowrap;
}
```

---

## Next Steps

- Learn about [Utilities](./11-utilities.md) for stagger and helpers
- Explore [Timeline](./04-timeline.md) for sequencing text animations
- Check out [Events](./08-events.md) for scroll-triggered reveals
