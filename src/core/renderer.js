import * as PIXI from 'pixi.js';

// eslint-disable-next-line import/no-mutable-exports
export let renderer;
// eslint-disable-next-line import/no-mutable-exports
export let ticker;
// eslint-disable-next-line import/no-mutable-exports
export let stage;

export function initRenderer() {
    renderer = new PIXI.Renderer({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xaaaaaa,
        forceFXAA: false,
        antialias: false,
        powerPreference: 'high-performance',
        clearBeforeRender: true,
        preserveDrawingBuffer: false
    });

    ticker = new PIXI.Ticker();
    ticker.maxFPS = 144;

    stage = new PIXI.Container();

    ticker.add(() => {
        renderer.render(stage);
    }, PIXI.UPDATE_PRIORITY.HIGH);

    ticker.start();

    document.querySelector('.game_container').appendChild(renderer.view);

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
}
