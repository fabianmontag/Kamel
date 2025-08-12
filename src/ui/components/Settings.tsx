import { X } from "lucide-react";
import { Switch } from "./base/Switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./base/Select";
import { Input } from "./base/Input";
import React from "react";

interface SettingsProps {
    closeSettings: () => void;
}

export const Settings: React.FunctionComponent<SettingsProps> = ({ closeSettings }) => {
    return (
        <div className="w-full h-full bg-black/70 z-20 fixed top-0 left-0 flex items-center justify-center lg:p-5">
            <div className="w-full h-full lg:max-w-4xl lg:max-h-[550px] bg-background lg:rounded lg:border lg:border-border/50 p-8 text-primary flex flex-col gap-7 overflow-y-auto">
                <div className="flex flex-row items-center justify-between">
                    <p className="text-3xl">Settings</p>
                    <button className="cursor-pointer" onClick={() => closeSettings()}>
                        <X className="text-muted-foreground" />
                    </button>
                </div>

                <div className="flex flex-col gap-2 pointer-events-none opacity-50">
                    <div className="w-full border-b border-input pb-2 mb-2">
                        <p className="text-2xl">General</p>
                    </div>
                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Theme</p>

                        <Select>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Timeout</p>
                        <Input placeholder="Timeout" value="5000" className="w-32" type="number" />
                    </div>

                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Font Size</p>
                        <Input placeholder="Timeout" value="20" className="w-32" type="number" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 pointer-events-none opacity-50">
                    <div className="w-full border-b border-input pb-2 mb-2">
                        <p className="text-2xl">Editor</p>
                    </div>
                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Show Minimap</p>
                        <Switch />
                    </div>

                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Enable Syntax Highlighting</p>
                        <Switch />
                    </div>

                    <div className="w-full h-10 flex flex-row items-center justify-between gap-5">
                        <p className="text-sm text-primary/70">Tab Size</p>
                        <Input placeholder="Timeout" value="4" className="w-32" type="number" />
                    </div>
                </div>
            </div>
        </div>
    );
};
