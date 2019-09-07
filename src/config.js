const renderOptions = {
    width: 720,
    height: 1280,
    resolution: window.devicePixelRatio || 1
};

const SETTINGS = {
    DEBUG: false
};

window.SETTINGS = SETTINGS;

const assetsBaseUrl = './assets';

export default {
    renderOptions,
    assetsBaseUrl,
    settings: SETTINGS
};
