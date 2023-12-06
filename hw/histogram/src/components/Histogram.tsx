import { useEffect, useRef } from "react";

const Histogram = ({
  histograms,
  width,
  height,
}: {
  histograms: number[][];
  width: number;
  height: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !histograms) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);

    const maxHist = Math.max(
      ...histograms.reduce((acc, hist) => acc.concat(hist), [])
    );

    // Set the global composite operation to make colors blend
    context.globalCompositeOperation = "lighter";

    console.log("Rendering histogram...");
    console.log("Max hist: ", histograms);
    for (let i = 0; i < histograms[0].length; i++) {
      const rBarHeight = (histograms[0][i] / maxHist) * height;
      const gBarHeight = (histograms[1][i] / maxHist) * height;
      const bBarHeight = (histograms[2][i] / maxHist) * height;

      // Set transparency
      context.globalAlpha = 0.5;

      // Draw the color bars with blending
      context.fillStyle = `rgba(${histograms[0][i]}, 0, 0, 1)`;
      context.fillRect(i, height - rBarHeight, 1, rBarHeight);

      context.fillStyle = `rgba(0, ${histograms[1][i]}, 0, 1)`;
      context.fillRect(i, height - gBarHeight, 1, gBarHeight);

      context.fillStyle = `rgba(0, 0, ${histograms[2][i]}, 1)`;
      context.fillRect(i, height - bBarHeight, 1, bBarHeight);
    }

    // Reset global alpha and composite operation for subsequent drawings
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
    console.log("Histogram rendered");
  }, [histograms, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Histogram;
