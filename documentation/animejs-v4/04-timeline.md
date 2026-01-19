# Timeline

Timelines allow you to sequence multiple animations and synchronize them together.

## Creating a Timeline

```javascript
import { timeline } from 'animejs';

const tl = timeline({
  duration: 1000,
  easing: 'easeOutExpo'
});
```

---

## Add Timers

Add timer instances to the timeline.

```javascript
import { timeline, timer } from 'animejs';

const tl = timeline();

tl.add(timer({
  duration: 500,
  onUpdate: (self) => console.log(self.progress)
}));
```

---

## Add Animations

Add animations sequentially.

```javascript
const tl = timeline({
  defaults: {
    duration: 800,
    easing: 'easeOutExpo'
  }
});

tl.add({
  targets: '.box-1',
  translateX: 250
})
.add({
  targets: '.box-2',
  translateX: 250
})
.add({
  targets: '.box-3',
  translateX: 250
});
```

---

## Sync WAAPI Animations

Synchronize Web Animations API animations.

```javascript
const tl = timeline();

const waAnimation = document.querySelector('.element').animate(
  [{ transform: 'translateX(0)' }, { transform: 'translateX(250px)' }],
  { duration: 1000 }
);

tl.sync(waAnimation, 0);
```

---

## Sync Timelines

Nest timelines within each other.

```javascript
const childTimeline = timeline()
  .add({ targets: '.child-1', translateX: 100 })
  .add({ targets: '.child-2', translateX: 100 });

const mainTimeline = timeline()
  .add({ targets: '.parent', scale: 1.5 })
  .sync(childTimeline, '+=500');
```

---

## Call Functions

Execute functions at specific points in the timeline.

```javascript
const tl = timeline()
  .add({ targets: '.box', translateX: 100 })
  .call(() => {
    console.log('First animation done!');
  })
  .add({ targets: '.box', translateY: 100 })
  .call(() => {
    console.log('Second animation done!');
  });
```

---

## Time Position

Control when animations start within the timeline.

### Absolute Time

```javascript
const tl = timeline()
  .add({ targets: '.box-1', translateX: 100 }, 0)      // Starts at 0ms
  .add({ targets: '.box-2', translateX: 100 }, 500)    // Starts at 500ms
  .add({ targets: '.box-3', translateX: 100 }, 1000);  // Starts at 1000ms
```

### Relative Offset

```javascript
const tl = timeline()
  .add({ targets: '.box-1', translateX: 100 })
  .add({ targets: '.box-2', translateX: 100 }, '-=200')  // 200ms before previous ends
  .add({ targets: '.box-3', translateX: 100 }, '+=500'); // 500ms after previous ends
```

### Labels

```javascript
const tl = timeline()
  .label('start')
  .add({ targets: '.box-1', translateX: 100 })
  .label('middle')
  .add({ targets: '.box-2', translateX: 100 }, 'start')    // At 'start' label
  .add({ targets: '.box-3', translateX: 100 }, 'middle');  // At 'middle' label
```

### Label with Offset

```javascript
const tl = timeline()
  .label('intro')
  .add({ targets: '.box-1', translateX: 100 })
  .add({ targets: '.box-2', translateX: 100 }, 'intro+=300');  // 300ms after 'intro'
```

---

## Playback Settings

### defaults

Set default parameters for all children.

```javascript
const tl = timeline({
  defaults: {
    duration: 500,
    easing: 'easeOutQuad',
    delay: 100
  }
});

tl.add({ targets: '.box', translateX: 100 })  // Uses defaults
  .add({ targets: '.box', translateY: 100, duration: 800 });  // Override duration
```

---

### delay

Delay before the timeline starts.

```javascript
const tl = timeline({
  delay: 1000
});
```

---

### loop

Loop the entire timeline.

```javascript
const tl = timeline({
  loop: 3  // Loop 3 times
});

// Infinite loop
const tl2 = timeline({
  loop: true
});
```

---

### loopDelay

Delay between loop iterations.

```javascript
const tl = timeline({
  loop: true,
  loopDelay: 500
});
```

---

### alternate

Alternate direction on each loop.

```javascript
const tl = timeline({
  loop: true,
  alternate: true  // Ping-pong
});
```

---

### reversed

Start timeline in reverse.

```javascript
const tl = timeline({
  reversed: true
});
```

---

### autoplay

Control automatic playback.

```javascript
const tl = timeline({
  autoplay: false
});

// Start manually
tl.play();
```

---

### frameRate

Target frame rate.

```javascript
const tl = timeline({
  frameRate: 30
});
```

---

### playbackRate

Speed multiplier.

```javascript
const tl = timeline({
  playbackRate: 2  // 2x speed
});
```

---

### playbackEase

Apply easing to overall timeline progress.

```javascript
const tl = timeline({
  playbackEase: 'easeInOutQuad'
});
```

---

## Callbacks

### onBegin

Called when timeline starts.

```javascript
const tl = timeline({
  onBegin: (self) => {
    console.log('Timeline started');
  }
});
```

---

### onComplete

Called when timeline completes.

```javascript
const tl = timeline({
  onComplete: (self) => {
    console.log('Timeline finished');
  }
});
```

---

### onBeforeUpdate

Called before each frame update.

```javascript
const tl = timeline({
  onBeforeUpdate: (self) => {
    console.log('Before update:', self.progress);
  }
});
```

---

### onUpdate

Called on every frame.

```javascript
const tl = timeline({
  onUpdate: (self) => {
    console.log('Progress:', self.progress);
  }
});
```

---

### onRender

Called after DOM updates.

```javascript
const tl = timeline({
  onRender: (self) => {
    console.log('Rendered');
  }
});
```

---

### onLoop

Called on each loop.

```javascript
const tl = timeline({
  loop: 5,
  onLoop: (self) => {
    console.log('Loop:', self.currentLoop);
  }
});
```

---

### onPause

Called when paused.

```javascript
const tl = timeline({
  onPause: (self) => {
    console.log('Paused at:', self.currentTime);
  }
});
```

---

### then()

Promise-based completion.

```javascript
const tl = timeline()
  .add({ targets: '.box', translateX: 100 });

tl.then(() => {
  console.log('Done!');
});

// Async/await
await tl;
console.log('Timeline finished');
```

---

## Methods

### add()

Add an animation to the timeline.

```javascript
tl.add({
  targets: '.element',
  translateX: 250
}, '+=100');  // Optional time position
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `animation` | `Object` | Animation parameters |
| `timePosition` | `number \| string` | When to start (optional) |

**Returns:** `Timeline` - For chaining.

---

### set()

Set values instantly at a time position.

```javascript
tl.set({
  targets: '.element',
  opacity: 1,
  translateX: 0
}, 0);
```

**Returns:** `Timeline` - For chaining.

---

### sync()

Synchronize external animations or timelines.

```javascript
tl.sync(otherTimeline, 500);
tl.sync(waAnimation, 'label');
```

**Returns:** `Timeline` - For chaining.

---

### label()

Create a named time marker.

```javascript
tl.label('intro')
  .add({ /* ... */ })
  .label('main')
  .add({ /* ... */ }, 'intro+=500');
```

**Returns:** `Timeline` - For chaining.

---

### remove()

Remove an animation from the timeline.

```javascript
const anim = { targets: '.box', translateX: 100 };
tl.add(anim);
tl.remove(anim);
```

**Returns:** `Timeline` - For chaining.

---

### call()

Execute a function at current timeline position.

```javascript
tl.add({ targets: '.box', translateX: 100 })
  .call(() => console.log('Animation complete!'))
  .add({ targets: '.box', translateY: 100 });
```

**Returns:** `Timeline` - For chaining.

---

### init()

Initialize the timeline without playing.

```javascript
const tl = timeline({ autoplay: false });
tl.init();
```

**Returns:** `Timeline` - For chaining.

---

### play()

Start or resume the timeline.

```javascript
tl.play();
```

**Returns:** `Timeline` - For chaining.

---

### reset()

Reset to initial state.

```javascript
tl.reset();
```

**Returns:** `Timeline` - For chaining.

---

### reverse()

Reverse playback direction.

```javascript
tl.reverse();
```

**Returns:** `Timeline` - For chaining.

---

### pause()

Pause the timeline.

```javascript
tl.pause();
```

**Returns:** `Timeline` - For chaining.

---

### restart()

Restart from the beginning.

```javascript
tl.restart();
```

**Returns:** `Timeline` - For chaining.

---

### alternate()

Toggle playback direction.

```javascript
tl.alternate();
```

**Returns:** `Timeline` - For chaining.

---

### resume()

Resume from paused state.

```javascript
tl.resume();
```

**Returns:** `Timeline` - For chaining.

---

### complete()

Skip to end.

```javascript
tl.complete();
```

**Returns:** `Timeline` - For chaining.

---

### cancel()

Cancel and remove timeline.

```javascript
tl.cancel();
```

**Returns:** `Timeline` - For chaining.

---

### revert()

Revert all changes and remove.

```javascript
tl.revert();
```

**Returns:** `Timeline` - For chaining.

---

### seek()

Seek to specific time or progress.

```javascript
tl.seek(500);   // Seek to 500ms
tl.seek(0.5);   // Seek to 50%
```

**Returns:** `Timeline` - For chaining.

---

### stretch()

Stretch timeline duration.

```javascript
tl.stretch(5000);  // New total duration
```

**Returns:** `Timeline` - For chaining.

---

### refresh()

Recalculate values after DOM changes.

```javascript
window.addEventListener('resize', () => tl.refresh());
```

**Returns:** `Timeline` - For chaining.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique identifier |
| `progress` | `number` | Current progress (0-1) |
| `currentTime` | `number` | Current time in ms |
| `duration` | `number` | Total duration |
| `paused` | `boolean` | Paused state |
| `began` | `boolean` | Whether started |
| `completed` | `boolean` | Whether completed |
| `reversed` | `boolean` | Current direction |
| `currentLoop` | `number` | Current loop number |
| `children` | `Array` | Child animations |
| `labels` | `Object` | Label positions |

---

## Next Steps

- Learn about [Animatable](./05-animatable.md) for reactive value binding
- Explore [Stagger](./11-utilities.md#stagger) for cascading animations
- Check out [Events](./08-events.md) for scroll-triggered timelines
