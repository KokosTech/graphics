export const equalize = (hist: number[], pixelArr: number[]): {
    pixelArr: number[];
    hist: number[];
} => {
    const c0 = 0; // the minimum value for a pixel
    const cmax = 255; // the maximum value for a pixel

    const cn: number[] = new Array(256).fill(0);    // the new values for the pixels
    const p0 = 0; // starting pixel
    const pmax = pixelArr.length; // final pixel
    const hmid = pmax / (cmax + 1); // pmax -> number of pixels; cmax + 1-> number of bins
    let rver = 0; // the sum of the pixels
    let hsum = 0; // the sum of the pixels

    // calculate the new values for each pixel
    for (let c = c0; c <= cmax; c++) {
        const lc = rver; // left corner

        hsum += hist[c]; // add the number of pixels with the same value

        // calculate the right corner
        while (hsum > hmid) {
            rver++;
            hsum -= hmid; // subtract the number of pixels with the same value
        }

        const rc = rver; // right corner

        cn[c] = (lc + rc) / 2; // calculate the new value for the pixel
    }

    // change the values of the pixels in the image
    for (let p = p0; p < pmax; p++) {
        pixelArr[p] = cn[pixelArr[p]];
    }

    return {
        pixelArr,
        hist
    };
};