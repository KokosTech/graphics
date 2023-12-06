import { useState } from "react";

import { emboss, gaussianBlur, invert, sharpen } from "../utils/predefinedFilters";
import { Filter } from "../types/Filter";

import '../styles/inputCustomFilter.css'

const InputCustomFilter = ({ onApply }: {
    onApply: (filter: Filter) => void;
}) => {
    const [matrix, setMatrix] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<number>(0);

    const handleMatrixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const index = Number(id.split('-')[1]);
        const newMatrix = [...matrix];
        newMatrix[index] = Number(value);
        setMatrix(newMatrix);
    }

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setScale(Number(value));
    };

    const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setOffset(Number(value));
    };

    if (!matrix) return null;


    return (
        <div className="input-custom-filter">
            <div className="container">
                <div className="input-custom-filter__matrix">
                    {
                        matrix.map((v, i) => (
                            <input
                                key={i}
                                type="number"
                                id={`matrix-${i}`}
                                value={v}
                                onChange={handleMatrixChange}
                            />
                        ))
                    }
                </div>
            </div>
            <div className="input-custom-filter__other">
                <div>
                    <label htmlFor="scale">Scale</label>
                    <input
                        type="number"
                        id="scale"
                        value={scale}
                        onChange={handleScaleChange}
                    />
                </div>
                <div>
                    <label htmlFor="offset">Offset</label>
                    <input
                        type="number"
                        id="offset"
                        value={offset}
                        onChange={handleOffsetChange}
                    />
                </div>
                <button
                    type="button"
                    className="input-custom-filter__apply"
                    onClick={() => onApply({ matrix, scale, offset })}
                >
                    Apply
                </button>
                <p>Pre-defined filters</p>
                <div>
                    <button
                        type="button"
                        className="input-custom-filter__apply"
                        onClick={() => gaussianBlur(setMatrix, setScale, setOffset)}
                    >
                        Gaussian blur
                    </button>
                    <button
                        type="button"
                        className="input-custom-filter__apply"
                        onClick={() => sharpen(setMatrix, setScale, setOffset)}
                    >
                        Sharpen
                    </button>
                    <button
                        type="button"
                        className="input-custom-filter__apply"
                        onClick={() => emboss(setMatrix, setScale, setOffset)}
                    >
                        Emboss
                    </button>
                    <button
                        type="button"
                        className="input-custom-filter__apply"
                        onClick={() => invert(setMatrix, setScale, setOffset)}
                    >
                        Invert
                    </button>
                </div>
            </div>
        </div >
    );
}

export default InputCustomFilter;
