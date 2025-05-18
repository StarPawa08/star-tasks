import * as preact from "preact";
import {useState} from "preact/hooks";

interface TButtonProps extends preact.JSX.HTMLAttributes<HTMLButtonElement>{
    icon: string;
    extraClass?: string;
}

export function TButton(props: TButtonProps) {
    const { icon, extraClass} = props;
    const [toggled, setToggled] = useState(false);


    function onToggle(event: preact.JSX.TargetedMouseEvent<HTMLButtonElement>) {
        props.onClick?.(event);
        setToggled(!toggled);
    }

    return (
        <>
            <button className={`h-full aspect-square rounded-xl text-white hover:bg-fuchsia-400 cursor-pointer
                ${extraClass} ${toggled ? "bg-fuchsia-500" : "bg-fuchsia-300"}`} onClick={onToggle}>
                <i className={icon} style="vertical-align: middle;"></i>
            </button>
        </>
    );
}