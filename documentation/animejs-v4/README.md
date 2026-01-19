# Anime.js v4 Documentation

> JavaScript Animation Engine - Version 4.0.0

This documentation mirrors the official [anime.js documentation](https://animejs.com/documentation/).

## Table of Contents

1. [Getting Started](./01-getting-started.md) - Installation, module imports, vanilla JS, React
2. [Timer](./02-timer.md) - Playback settings, callbacks, methods, properties
3. [Animation](./03-animation.md) - Targets, animatable properties, tweens, keyframes
4. [Timeline](./04-timeline.md) - Add animations, sync, time position
5. [Animatable](./05-animatable.md) - Settings, methods, properties
6. [Draggable](./06-draggable.md) - Axes parameters, settings, callbacks
7. [Scope](./07-scope.md) - Constructor functions, register methods, mediaQueries
8. [Events](./08-events.md) - onScroll, thresholds, synchronization modes
9. [SVG](./09-svg.md) - morphTo, createDrawable, createMotionPath
10. [Text](./10-text.md) - splitText, settings, HTML templates
11. [Utilities](./11-utilities.md) - stagger, $, get, set, random, and more
12. [Easings](./12-easings.md) - Built-in eases, cubic bezier, spring
13. [WAAPI](./13-waapi.md) - Web Animations API integration
14. [Engine](./14-engine.md) - Global engine settings and configuration

## Quick Start

### Installation

```bash
npm install animejs
```

### Basic Usage

```javascript
import anime from 'animejs';

anime({
  targets: '.element',
  translateX: 250,
  rotate: '1turn',
  duration: 800
});
```

## Version Information

This documentation covers **anime.js v4.0.0**. For older versions, refer to:
- [v3.2.2 Documentation](https://animejs.com/documentation/?v=3.2.2)
- [v2.1.0 Documentation](https://animejs.com/documentation/?v=2.1.0)

## Resources

- [Official Website](https://animejs.com/)
- [GitHub Repository](https://github.com/juliangarnier/anime)
- [Easings Visualizer](https://animejs.com/documentation/easings)
- [Examples](https://animejs.com/documentation/examples)

## License

anime.js is released under the MIT License.

---

*Documentation generated from the official anime.js v4 documentation.*
