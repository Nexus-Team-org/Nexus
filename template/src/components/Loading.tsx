import type { FC } from "react";


interface LoadingProps {
  fullscreen?: boolean;
}
const Loading: FC<LoadingProps> = ({ fullscreen }) => {
  return (
    <div
      className={`w-full h-full flex items-center justify-center z-[9999] ${
        fullscreen ? "fixed top-0 left-0 bg-white " : "h-dvh"
      }`}
    >
      <div className="size-12 grid grid-cols-3 gap-1">
        <span className="w-full h-full bg-primary animate-blink [animation-delay:0ms]"></span>
        <span className="w-full h-full bg-primary animate-blink [animation-delay:200ms]"></span>
        <span className="w-full h-full bg-primary animate-blink [animation-delay:300ms]"></span>
        <span className="w-full h-full bg-primary animate-blink [animation-delay:400ms]"></span>
        <span className="w-full h-full bg-primary animate-blink [animation-delay:500ms]"></span>
        <span className="w-full h-full bg-primary animate-blink [animation-delay:600ms]"></span>
      </div>
    </div>
  );
};

export default Loading;
