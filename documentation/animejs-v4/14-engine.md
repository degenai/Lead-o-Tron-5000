# Engine

The engine is the global animation scheduler that manages all animations, timers, and playback.

## Accessing the Engine

```javascript
import { engine } from 'animejs';

// Access engine properties
console.log(engine.speed);
console.log(engine.fps);
```

---

## Parameters

### timeUnit

Set the default time unit for durations.

```javascript
import { engine } from 'animejs';

// Default is milliseconds
engine.timeUnit = 'ms';

// Use seconds
engine.timeUnit = 's';
```

| Value | Description |
|-------|-------------|
| `'ms'` | Milliseconds (default) |
| `'s'` | Seconds |

```javascript
// With seconds
engine.timeUnit = 's';

anime({
  targets: '.element',
  translateX: 250,
  duration: 1  // 1 second
});
```

---

### speed

Global playback speed multiplier.

```javascript
import { engine } from 'animejs';

// Normal speed
engine.speed = 1;

// Half speed (slow motion)
engine.speed = 0.5;

// Double speed
engine.speed = 2;

// Pause all animations
engine.speed = 0;
```

### Use Cases

```javascript
// Debug mode - slow everything down
if (debugMode) {
  engine.speed = 0.25;
}

// Pause during modal
function openModal() {
  engine.speed = 0;
  showModal();
}

function closeModal() {
  engine.speed = 1;
  hideModal();
}
```

---

### fps

Target frames per second.

```javascript
import { engine } from 'animejs';

// Default (matches screen refresh rate)
engine.fps = Infinity;

// Limit to 30fps for performance
engine.fps = 30;

// Limit to 60fps
engine.fps = 60;
```

### Performance Optimization

```javascript
// Reduce frame rate on lower-end devices
if (isLowEndDevice()) {
  engine.fps = 30;
}

// Or based on battery status
navigator.getBattery?.().then(battery => {
  if (battery.level < 0.2) {
    engine.fps = 30;
  }
});
```

---

### precision

Decimal precision for animated values.

```javascript
import { engine } from 'animejs';

// Default precision
engine.precision = 4;  // 0.1234

// Higher precision
engine.precision = 6;  // 0.123456

// Lower precision (better performance)
engine.precision = 2;  // 0.12
```

---

### pauseOnDocumentHidden

Pause animations when tab is hidden.

```javascript
import { engine } from 'animejs';

// Pause when tab is hidden (default)
engine.pauseOnDocumentHidden = true;

// Continue animations in background
engine.pauseOnDocumentHidden = false;
```

### Use Cases

```javascript
// Game - pause when tab hidden
engine.pauseOnDocumentHidden = true;

// Background tasks - continue running
engine.pauseOnDocumentHidden = false;
```

---

## Methods

### update()

Manually trigger an engine update.

```javascript
import { engine } from 'animejs';

// Force update at specific time
engine.update(performance.now());

// Manual animation loop
function customLoop(time) {
  engine.update(time);
  requestAnimationFrame(customLoop);
}
```

### Integration with Other Systems

```javascript
// Sync with Three.js render loop
function animate() {
  requestAnimationFrame(animate);
  
  engine.update(performance.now());
  renderer.render(scene, camera);
}
```

---

### pause()

Pause the global engine.

```javascript
import { engine } from 'animejs';

engine.pause();
```

All animations stop when the engine is paused.

```javascript
// Pause on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    engine.pause();
  } else {
    engine.resume();
  }
});
```

---

### resume()

Resume the paused engine.

```javascript
import { engine } from 'animejs';

engine.resume();
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `speed` | `number` | Global speed multiplier |
| `fps` | `number` | Target frame rate |
| `precision` | `number` | Value decimal precision |
| `timeUnit` | `string` | Default time unit |
| `paused` | `boolean` | Whether engine is paused |
| `currentTime` | `number` | Current engine time |
| `deltaTime` | `number` | Time since last frame |
| `children` | `Array` | All active animations |

```javascript
import { engine } from 'animejs';

console.log('Current time:', engine.currentTime);
console.log('Delta time:', engine.deltaTime);
console.log('Active animations:', engine.children.length);
console.log('Is paused:', engine.paused);
```

---

## Engine Defaults

Set global defaults for all animations.

```javascript
import { engine } from 'animejs';

// Set default duration
engine.defaults = {
  duration: 500,
  easing: 'easeOutQuad'
};
```

### Available Defaults

```javascript
engine.defaults = {
  duration: 1000,
  delay: 0,
  easing: 'easeOutQuad',
  loop: false,
  alternate: false,
  autoplay: true
};
```

### Per-Project Configuration

```javascript
// config/animation.js
import { engine } from 'animejs';

// Project-wide animation settings
engine.defaults = {
  duration: 400,
  easing: 'easeOutCubic'
};

engine.fps = 60;
engine.pauseOnDocumentHidden = true;

export { engine };
```

---

## Practical Examples

### Debug Panel

```javascript
import { engine } from 'animejs';

const debugPanel = document.querySelector('.debug-panel');

function updateDebugInfo() {
  debugPanel.innerHTML = `
    <div>FPS: ${(1000 / engine.deltaTime).toFixed(1)}</div>
    <div>Active: ${engine.children.length}</div>
    <div>Speed: ${engine.speed}x</div>
    <div>Time: ${engine.currentTime.toFixed(0)}ms</div>
  `;
  requestAnimationFrame(updateDebugInfo);
}

updateDebugInfo();
```

### Speed Controls

```javascript
import { engine } from 'animejs';

document.querySelector('.speed-1x').onclick = () => engine.speed = 1;
document.querySelector('.speed-2x').onclick = () => engine.speed = 2;
document.querySelector('.speed-half').onclick = () => engine.speed = 0.5;
document.querySelector('.pause').onclick = () => engine.pause();
document.querySelector('.play').onclick = () => engine.resume();
```

### Performance Monitor

```javascript
import { engine } from 'animejs';

let frameCount = 0;
let lastTime = performance.now();

function monitorPerformance() {
  frameCount++;
  
  const now = performance.now();
  if (now - lastTime >= 1000) {
    const fps = frameCount;
    frameCount = 0;
    lastTime = now;
    
    // Reduce quality if FPS drops
    if (fps < 30 && engine.fps > 30) {
      console.warn('Low FPS detected, reducing target');
      engine.fps = 30;
    }
  }
  
  requestAnimationFrame(monitorPerformance);
}

monitorPerformance();
```

### Battery-Aware Animation

```javascript
import { engine } from 'animejs';

async function optimizeForBattery() {
  const battery = await navigator.getBattery?.();
  
  if (!battery) return;
  
  function updateSettings() {
    if (battery.charging) {
      engine.fps = Infinity;
      engine.speed = 1;
    } else if (battery.level < 0.2) {
      engine.fps = 30;
    } else if (battery.level < 0.5) {
      engine.fps = 45;
    }
  }
  
  battery.addEventListener('chargingchange', updateSettings);
  battery.addEventListener('levelchange', updateSettings);
  updateSettings();
}

optimizeForBattery();
```

### Synchronized Game Loop

```javascript
import { engine } from 'animejs';

// Disable auto-update
engine.pauseOnDocumentHidden = false;

// Custom game loop
let lastTime = 0;

function gameLoop(time) {
  const delta = time - lastTime;
  lastTime = time;
  
  // Update anime.js engine
  engine.update(time);
  
  // Update game logic
  updateGame(delta);
  
  // Render
  render();
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Best Practices

1. **Set defaults early**
   ```javascript
   // In your app initialization
   engine.defaults = {
     duration: 300,
     easing: 'easeOutQuad'
   };
   ```

2. **Handle visibility changes**
   ```javascript
   // Prevent animation jumps when returning to tab
   engine.pauseOnDocumentHidden = true;
   ```

3. **Monitor performance**
   ```javascript
   // Log slow frames
   if (engine.deltaTime > 32) {
     console.warn('Slow frame:', engine.deltaTime.toFixed(1), 'ms');
   }
   ```

4. **Clean up unused animations**
   ```javascript
   // Check for too many active animations
   if (engine.children.length > 100) {
     console.warn('Many animations active:', engine.children.length);
   }
   ```

---

## Next Steps

- Start with [Getting Started](./01-getting-started.md)
- Learn about [Animation](./03-animation.md)
- Explore [Timeline](./04-timeline.md) for sequencing
- Check out [WAAPI](./13-waapi.md) for hardware acceleration
