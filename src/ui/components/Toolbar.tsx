import { Check, Moon, Play, Share, Square, Sun } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { twcm } from "../misc/twcm";
import { useSaveThemeContext } from "../contexts/themeContext";
import { defaultDarkTheme, defaultLightTheme } from "../hooks/useTheme";
import { getURIDataFromCode } from "../misc/shareURI";

interface ToolbarProps {
    code: string;
    run: () => void;
    autoRun: boolean;
    toggleAutoRun: () => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    firstLeft?: boolean;
    lastRight?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, firstLeft, lastRight, ...props }, ref) => {
        return (
            <button
                className={twcm(
                    "flex flex-row items-center justify-center gap-2 text-primary bg-secondary hover:cursor-pointer hover:bg-secondary/50 px-3 py-1.5 min-w-14 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed",
                    firstLeft && "rounded-l-lg",
                    lastRight && "rounded-r-lg",
                    !firstLeft && !lastRight && "rounded-lg",
                    className
                )}
                ref={ref}
                {...props}
            ></button>
        );
    }
);
Button.displayName = "Button";

const Toolbar: React.FunctionComponent<ToolbarProps> = ({ code, run, autoRun, toggleAutoRun }) => {
    const [shared, setShared] = useState(false);
    const sharedRef = useRef(0);
    const { theme, setTheme } = useSaveThemeContext();

    const handleToggleTheme = () => {
        if (theme == defaultLightTheme) {
            setTheme(defaultDarkTheme);
        } else {
            setTheme(defaultLightTheme);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href + "?code=" + getURIDataFromCode(code));

        setShared(true);
        clearTimeout(sharedRef.current);
        sharedRef.current = setTimeout(() => {
            setShared(false);
        }, 2000);
    };

    useEffect(() => {
        return () => {
            clearTimeout(sharedRef.current);
        };
    }, []);

    return (
        <div className="w-full h-auto flex items-center justify-between gap-2">
            <div className="w-[130px] h-auto flex flex-row items-center justify-start gap-1 p-2">
                <Button onClick={handleShare}>
                    {shared ? (
                        <>
                            <Check size={15} className="stroke-primary" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Share size={15} className="stroke-primary" />
                            Share
                        </>
                    )}
                </Button>
            </div>

            <div className="w-auto h-auto flex flex-row items-center justify-center gap-0.5 p-2">
                <Button firstLeft className="text-outputToplevel" onClick={run}>
                    <Play size={15} className="fill-outputToplevel stroke-outputToplevel" />
                    Run
                </Button>

                {autoRun ? (
                    <Button lastRight className="text-outputToplevel" onClick={toggleAutoRun}>
                        <Square size={15} className="fill-outputToplevel stroke-outputToplevel" />
                        Auto-Run: On
                    </Button>
                ) : (
                    <Button lastRight className="text-primary/70" onClick={toggleAutoRun}>
                        <Play size={15} className="fill-primary stroke-primary opacity-70" />
                        Auto-Run: Off
                    </Button>
                )}
            </div>

            <div className="w-[130px] h-auto flex flex-row items-center justify-end gap-1 p-2">
                <Button onClick={handleToggleTheme}>
                    {theme == defaultLightTheme ? (
                        <Moon size={15} className="fill-primary stroke-primary" />
                    ) : (
                        <Sun size={15} className="fill-primary stroke-primary" />
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Toolbar;
