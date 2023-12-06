export const gaussianBlur = (
    setMatrix: (matrix: number[]) => void,
    setScale: (scale: number) => void,
    setOffset: (offset: number) => void) => {

    setMatrix([
        1, 1, 1, 1, 1,
        1, 2, 2, 2, 1,
        1, 2, 3, 2, 1,
        1, 2, 2, 2, 1,
        1, 1, 1, 1, 1
    ]);

    setScale(35);
    setOffset(0);
};

export const sharpen = (
    setMatrix: (matrix: number[]) => void,
    setScale: (scale: number) => void,
    setOffset: (offset: number) => void) => {

    setMatrix([
        0, 0, 0, 0, 0,
        0, 0, -1, 0, 0,
        0, -1, 5, -1, 0,
        0, 0, -1, 0, 0,
        0, 0, 0, 0, 0
    ]);

    setScale(1);
    setOffset(0);
};

export const emboss = (
    setMatrix: (matrix: number[]) => void,
    setScale: (scale: number) => void,
    setOffset: (offset: number) => void) => {

    setMatrix([
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, -1, 0,
        0, 0, 0, 0, 0
    ]);

    setScale(1);
    setOffset(128);
}

export const invert = (
    setMatrix: (matrix: number[]) => void,
    setScale: (scale: number) => void,
    setOffset: (offset: number) => void) => {

    setMatrix([
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, -1, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0
    ]);

    setScale(1);
    setOffset(255);
}