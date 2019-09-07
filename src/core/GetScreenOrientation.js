import { PORTRAIT, LANDSCAPE } from './consts';

export default function GetScreenOrientation(width, height) {
    const screen = window.screen;
    const orientation = screen
        ? screen.orientation || screen.mozOrientation || screen.msOrientation
        : false;

    if (orientation && typeof orientation.type === 'string') {
        //  Screen Orientation API specification
        return orientation.type;
    }
    if (typeof orientation === 'string') {
        //  moz / ms-orientation are strings
        return orientation;
    }

    if (screen) {
        return screen.height > screen.width ? PORTRAIT : LANDSCAPE;
    }
    if (typeof window.orientation === 'number') {
        //  This may change by device based on "natural" orientation.
        return window.orientation === 0 || window.orientation === 180 ? PORTRAIT : LANDSCAPE;
    }
    if (window.matchMedia) {
        if (window.matchMedia('(orientation: portrait)').matches) {
            return PORTRAIT;
        }
        if (window.matchMedia('(orientation: landscape)').matches) {
            return LANDSCAPE;
        }
    }

    return height > width ? PORTRAIT : LANDSCAPE;
}
