import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import { createPoll } from "ags/time"
import style from "./style.scss"
import { For, createBinding } from "ags"
import Hyprland from "gi://AstalHyprland"



app.start({
    css: style,
    main() {
        const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

        const hypr = Hyprland.get_default()

        const clock = createPoll("", 1000, ["date"])
        const battery = createPoll("", 10000, [
            "sh", "-c", "cat /sys/class/power_supply/BAT0/capacity"
        ])
        const network = createPoll("", 5000, [
            "sh", "-c", "nmcli -t -f TYPE,STATE device | grep ':connected' | head -1 | cut -d: -f1"
        ])

        return (
            <window
                layer={Astal.Layer.TOP}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                visible
                anchor={TOP | LEFT | RIGHT}
            >
                
            
            <centerbox>
                {/* LEFT: Workspaces */}
                <box $type="start" spacing={6}>
                    <For each={createBinding(hypr, "workspaces").as(
                        workspaces => [...workspaces].sort(
                            (a, b) => a.get_id() - b.get_id()
                        )
                    )}>
                        {(ws: any) => (
                            <button
                                cssName={createBinding(
                                    hypr,
                                    "focusedWorkspace"
                                ).as(focused =>
                                    focused?.get_id() === ws.get_id()
                                        ? "active"
                                        : "workspace"
                                )}
                                onClicked={() => ws.focus()}
                            >
                                {ws.get_id()}
                            </button>
                        )}
                    </For>
                </box>

                {/* CENTER: Date and Time */}
                <label $type="center" label={clock} />

                {/* RIGHT: Network and Battery */}
                <box $type="end" spacing={12}>
                    <label label={network.as(n =>
                        n === "wifi" ? "󰤨 Wi-Fi" : "󰈀 Ethernet"
                    )} />

                    <label label={battery.as(b => `󰁹 ${b}%`)} />
                </box>
            </centerbox>

            </window>
        )
    },
})