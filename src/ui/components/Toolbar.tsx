import { Play } from "lucide-react";
import React from "react";
import { twcm } from "../misc/twcm";

interface ToolbarProps {
    run: () => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    firstLeft?: boolean;
    lastRight?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, firstLeft, lastRight, ...props }, ref) => {
    return (
        <button
            className={twcm(
                "flex flex-row items-center justify-center gap-2 text-primary bg-tertiary hover:bg-tertiary/50 px-3 py-1.5 min-w-14 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed",
                firstLeft && "rounded-l-lg",
                lastRight && "rounded-r-lg",
                className
            )}
            ref={ref}
            {...props}
        ></button>
    );
});
Button.displayName = "Button";

const Toolbar: React.FunctionComponent<ToolbarProps> = ({ run }) => {
    return (
        <div className="w-full h-auto flex items-center justify-center gap-[1px] p-2">
            <Button firstLeft lastRight className="text-green-500" onClick={run}>
                <Play size={15} className="fill-green-500 stroke-green-500" />
                Run
            </Button>
        </div>
    );
};

export default Toolbar;
