# Timer

The Timer is the base class for all time-based animations in anime.js. It provides playback controls, callbacks, and timing properties.

## Playback Settings

### delay

Delay before the timer starts, in milliseconds.

```javascript
import { timer } from 'animejs';

timer({
  delay: 1000, // Wait 1 second before starting
  duration: 2000,
  onUpdate: (self) => console.log(self.progress)
});
```

| Type | Default |
|------|---------|
| `number` | `0` |

---

### duration

Total duration of the timer in milliseconds.

```javascript
timer({
  duration: 3000, // 3 seconds
  onComplete: () => console.log('Done!')
});
```

| Type | Default |
|------|---------|
| `number` | `1000` |

---

### loop

Number of times the timer should loop. Set to `true` for infinite loops.

```javascript
// Loop 3 times
timer({
  duration: 1000,
  loop: 3
});

// Loop infinitely
timer({
  duration: 1000,
  loop: true
});
```

| Type | Default |
|------|---------|
| `number \| boolean` | `false` |

---

### loopDelay

Delay between each loop iteration in milliseconds.

```javascript
timer({
  duration: 1000,
  loop: 3,
  loopDelay: 500 // Wait 500ms between loops
});
```

| Type | Default |
|------|---------|
| `number` | `0` |

---

### alternate

When `true`, the timer alternates direction on each loop.

```javascript
timer({
  duration: 1000,
  loop: true,
  alternate: true // Ping-pong effect
});
```

| Type | Default |
|------|---------|
| `boolean` | `false` |

---

### reversed

Start the timer in reverse.

```javascript
timer({
  duration: 1000,
  reversed: true // Starts from the end
});
```

| Type | Default |
|------|---------|
| `boolean` | `false` |

---

### autoplay

Whether the timer starts automatically.

```javascript
const t = timer({
  duration: 1000,
  autoplay: false // Won't start until play() is called
});

// Start manually
t.play();
```

| Type | Default |
|------|---------|
| `boolean` | `true` |

---

### frameRate

Target frame rate for updates. Lower values improve performance.

```javascript
timer({
  duration: 2000,
  frameRate: 30, // Update at 30fps instead of 60fps
  onUpdate: () => { /* ... */ }
});
```

| Type | Default |
|------|---------|
| `number` | `Infinity` (native refresh rate) |

---

### playbackRate

Speed multiplier for the timer.

```javascript
timer({
  duration: 1000,
  playbackRate: 2 // Plays at 2x speed (500ms actual)
});

timer({
  duration: 1000,
  playbackRate: 0.5 // Plays at half speed (2000ms actual)
});
```

| Type | Default |
|------|---------|
| `number` | `1` |

---

## Callbacks

### onBegin

Called when the timer starts (after delay).

```javascript
timer({
  delay: 1000,
  duration: 2000,
  onBegin: (self) => {
    console.log('Timer started!');
    console.log('Current time:', self.currentTime);
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | `Timer` | The timer instance |

---

### onComplete

Called when the timer completes.

```javascript
timer({
  duration: 1000,
  onComplete: (self) => {
    console.log('Timer completed!');
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | `Timer` | The timer instance |

---

### onUpdate

Called on every frame update.

```javascript
timer({
  duration: 1000,
  onUpdate: (self) => {
    console.log('Progress:', self.progress);
    console.log('Current time:', self.currentTime);
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | `Timer` | The timer instance |

---

### onLoop

Called when the timer loops.

```javascript
timer({
  duration: 1000,
  loop: 5,
  onLoop: (self) => {
    console.log('Loop count:', self.currentLoop);
  }
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | `Timer` | The timer instance |

---

### onPause

Called when the timer is paused.

```javascript
const t = timer({
  duration: 2000,
  onPause: (self) => {
    console.log('Paused at:', self.currentTime);
  }
});

setTimeout(() => t.pause(), 1000);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | `Timer` | The timer instance |

---

### then()

Returns a Promise that resolves when the timer completes.

```javascript
const t = timer({ duration: 1000 });

t.then(() => {
  console.log('Timer finished!');
});

// Or with async/await
async function runAnimation() {
  await timer({ duration: 1000 });
  console.log('Done!');
}
```

---

## Methods

### play()

Starts or resumes the timer.

```javascript
const t = timer({
  duration: 1000,
  autoplay: false
});

t.play();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### reverse()

Reverses the playback direction.

```javascript
const t = timer({ duration: 2000 });

setTimeout(() => {
  t.reverse(); // Now plays backward
}, 1000);
```

**Returns:** `Timer` - The timer instance for chaining.

---

### pause()

Pauses the timer.

```javascript
const t = timer({ duration: 2000 });

setTimeout(() => t.pause(), 1000);
```

**Returns:** `Timer` - The timer instance for chaining.

---

### restart()

Restarts the timer from the beginning.

```javascript
const t = timer({ duration: 1000 });

t.restart();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### alternate()

Toggles the direction of the timer.

```javascript
const t = timer({
  duration: 1000,
  loop: true
});

// Toggle direction every 2 seconds
setInterval(() => t.alternate(), 2000);
```

**Returns:** `Timer` - The timer instance for chaining.

---

### resume()

Resumes a paused timer.

```javascript
const t = timer({ duration: 2000 });

t.pause();
setTimeout(() => t.resume(), 1000);
```

**Returns:** `Timer` - The timer instance for chaining.

---

### complete()

Immediately completes the timer.

```javascript
const t = timer({
  duration: 5000,
  onComplete: () => console.log('Done!')
});

// Skip to end
t.complete();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### reset()

Resets the timer to its initial state without playing.

```javascript
const t = timer({ duration: 1000 });

t.reset();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### cancel()

Cancels the timer and removes it from the engine.

```javascript
const t = timer({ duration: 1000 });

t.cancel();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### revert()

Reverts all changes made by the timer and removes it.

```javascript
const t = timer({ duration: 1000 });

t.revert();
```

**Returns:** `Timer` - The timer instance for chaining.

---

### seek()

Seeks to a specific time or progress value.

```javascript
const t = timer({ duration: 2000 });

// Seek to 1 second
t.seek(1000);

// Seek to 50% progress
t.seek(0.5); // Values < 1 are treated as progress
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `time` | `number` | Time in ms, or progress (0-1) |

**Returns:** `Timer` - The timer instance for chaining.

---

### stretch()

Stretches the timer duration.

```javascript
const t = timer({ duration: 1000 });

// Double the duration
t.stretch(2000);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `newDuration` | `number` | New duration in ms |

**Returns:** `Timer` - The timer instance for chaining.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique identifier |
| `progress` | `number` | Current progress (0 to 1) |
| `currentTime` | `number` | Current time in milliseconds |
| `duration` | `number` | Total duration |
| `paused` | `boolean` | Whether timer is paused |
| `began` | `boolean` | Whether timer has begun |
| `completed` | `boolean` | Whether timer has completed |
| `reversed` | `boolean` | Current direction |
| `currentLoop` | `number` | Current loop iteration |
| `playbackRate` | `number` | Current playback speed |

```javascript
const t = timer({
  duration: 2000,
  onUpdate: (self) => {
    console.log({
      progress: self.progress,
      currentTime: self.currentTime,
      paused: self.paused
    });
  }
});
```

---

## Next Steps

- Learn about [Animation](./03-animation.md) for animating elements
- Explore [Timeline](./04-timeline.md) for sequencing multiple animations
