import Stats from 'stats-js';
import * as PIXI from 'pixi.js';
import { Application } from '@pixi/app';
import { AppLoaderPlugin } from '@pixi/loaders';
import { TickerPlugin } from '@pixi/ticker';
import vs from './shader.vert';
import fs from './shader.frag';

const gameContainer = document.querySelector('.game_container');

const app = new Application({
    width: gameContainer.clientWidth,
    height: gameContainer.clientHeight,
    resolution: window.devicePixelRatio || 1.0,
    autoDensity: true,
    resizeTo: gameContainer,
    backgroundColor: 0xaaaaaa,
    forceFXAA: false,
    antialias: false,
    powerPreference: 'high-performance',
    clearBeforeRender: true,
    preserveDrawingBuffer: false
});

Application.registerPlugin(TickerPlugin);
Application.registerPlugin(AppLoaderPlugin);

gameContainer.appendChild(app.view);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

app.loader.baseUrl = './assets';
console.log(app);

const diffMap = PIXI.CubeTexture.from([
    'assets/r_dragon_d.png',
    'assets/l_dragon_d.png',
    'assets/t_dragon_d.png',
    'assets/bo_dragon_d.png',
    'assets/f_dragon_d.png',
    'assets/b_dragon_d.png'
]);
/* const normalMap = PIXI.CubeTexture.from([
    'assets/r_dragon_n.png',
    'assets/l_dragon_n.png',
    'assets/t_dragon_n.png',
    'assets/bo_dragon_n.png',
    'assets/f_dragon_n.png',
    'assets/b_dragon_n.png'
]);
const specMap = PIXI.CubeTexture.from([
    'assets/r_dragon_s.png',
    'assets/l_dragon_s.png',
    'assets/t_dragon_s.png',
    'assets/bo_dragon_s.png',
    'assets/f_dragon_s.png',
    'assets/b_dragon_s.png'
]); */

diffMap.mipmap = PIXI.MIPMAP_MODES.ON;
diffMap.scaleMode = PIXI.SCALE_MODES.LINEAR;
// normalMap.mipmap = PIXI.MIPMAP_MODES.ON;
// normalMap.scaleMode = PIXI.SCALE_MODES.LINEAR;
// normalMap.premultiplyAlpha = false;
// specMap.mipmap = PIXI.MIPMAP_MODES.ON;
// specMap.scaleMode = PIXI.SCALE_MODES.LINEAR;
// specMap.premultiplyAlpha = false;

const container = new PIXI.Container();
// eslint-disable-next-line no-bitwise
const halfW = ~~(0.5 * app.screen.width);
// eslint-disable-next-line no-bitwise
const halfH = ~~(0.5 * app.screen.height);
container.filterArea = new PIXI.Rectangle(halfW - 100, halfH - 100, 200, 200);
app.stage.addChild(container);

const filter = new PIXI.Filter(vs, fs, {
    diffMap,
    // normalMap,
    // specMap,
    angle: [0.0, 0.0],
    uDissolveSettings: [0.0, 0.02],
    uEdgeColor: [0.89, 0.47, 0.2, 1.0]
});
filter.autoFit = false;

container.filters = [filter];
console.log(filter);

let a = 0.005;
let b = 2.0;
const r = 0.5 * container.filterArea.width;
const startY = container.filterArea.y;

app.ticker.add(delta => {
    stats.begin();
    // filter.uniforms.angle[1] -= 0.005;
    container.filterArea.y += b;
    if (
        container.filterArea.y + b > app.screen.height - container.filterArea.height ||
        container.filterArea.y + b < 0.0
    )
        b *= -1.0;

    filter.uniforms.angle[0] = ((startY - container.filterArea.y) / r) % (2.0 * Math.PI);

    filter.uniforms.uDissolveSettings[0] += a;
    if (
        filter.uniforms.uDissolveSettings[0] + a < 0.0 ||
        filter.uniforms.uDissolveSettings[0] + a > 0.75
    )
        a *= -1.0;
    stats.end();
});

app.ticker.start();
