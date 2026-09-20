/* eslint-disable @next/next/no-img-element */

type ClassicStatBarProps = {
    src: string;
    ratio: number;
    width: number;
    height: number;
    label?: string;
};

export default function ClassicStatBar({
    src,
    ratio,
    width,
    height,
    label,
}: ClassicStatBarProps) {
    const fill = Math.max(0, Math.min(1, ratio));

    return (
        <div
            className="pointer-events-none relative overflow-hidden"
            style={{ width, height }}
            aria-label={label}
        >
            <img
                src={src}
                alt=""
                width={width}
                height={height}
                draggable={false}
                className="absolute left-0 top-0 block max-w-none"
                style={{
                    width,
                    height,
                    clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`,
                }}
            />
        </div>
    );
}
