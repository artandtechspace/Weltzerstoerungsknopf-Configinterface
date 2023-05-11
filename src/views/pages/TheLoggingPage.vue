<template>
    <!--Feedback components for messages-->
    <Snackbar ref="snackbar" />

    <!--Main content-->
    <div style="position: relative"
        class="d-flex flex-column w-100 h-100">

        <!--Reconnecting flag-->
        <v-scroll-x-transition>
            <v-card v-show="status == Status.RECONNECTING"
                style="white-space: nowrap; background: #ff000050; position: absolute; top: 10px; right: 10px; z-index: 1"
                class="mx-auto text-error px-2">
                <span class="mr-2" style="font-size: 0.8rem">Reconnecting</span>
                <v-progress-circular :width="2" :size="15"
                    color="primary"
                    indeterminate></v-progress-circular>
            </v-card>
        </v-scroll-x-transition>
        <!--Connected flag-->
        <v-scroll-x-transition>
            <v-card v-show="status == Status.CONNECTED"
                style="white-space: nowrap; background: #00ff0050; position: absolute; top: 10px; right: 10px; z-index: 1"
                class="mx-auto text-success px-2">
                <span class="mr-2" style="font-size: 0.8rem">Connected</span>
                <v-icon icon="mdi-web-check"/>
            </v-card>
        </v-scroll-x-transition>

        <!--Log content-->
        <div style="position: relative"
            class="h-100 w-100 flex-grow-1">
            <v-virtual-scroll ref="scroller"
                style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"
                :items="filteredLogs"
                item-height="48">
                <template v-slot:default="{ item }">
                    <v-list-item :title="item.msg"
                        :subtitle="`${item.logger} / ${item.func}`"
                        :color="getColor(item.type)">
                        <template v-slot:prepend>
                            <v-icon :icon="getIcon(item.type)"
                                class="mr-2 ml-2" />
                        </template>
                        <template v-slot:append>
                            <v-tooltip :text="getFormattedTime(item.time)">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon="mdi-magnify"
                                        size="x-small"
                                        variant="tonal"
                                        v-bind="props">
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </template>
                    </v-list-item>
                </template>
            </v-virtual-scroll>
            <div v-if="filteredLogs.length <= 0"
                style="color: gray"
                class="w-100 h-100 d-flex justify-center align-center flex-column">
                <p class="text-h6">No logs found</p>
                <p class="mt-5 text-h4">¯\_(ツ)_/¯</p>
            </div>
        </div>

        <v-combobox v-model="selectedLogTypes"
            :items="Object.values(LogType)"
            label="Display these log-types"
            multiple
            hide-details>
            <template v-slot:selection="data">
                <v-chip :key="JSON.stringify(data.item)"
                    v-bind="data.attrs"
                    :model-value="data.selected"
                    :disabled="data.disabled"
                    size="small"
                    :color="getColor(data.item.value)"
                    @click:close="data.parent.selectItem(data.item)">
                    <template v-slot:prepend>
                        <v-icon :icon="getIcon(data.item.value)" />
                    </template>
                    {{ data.item.title }}
                </v-chip>
            </template>

        </v-combobox>
    </div>
</template>

<script lang="ts">
import Snackbar from "@/components/Snackbar.vue"
import { openSnackbar } from '@/utils/FeedbackUtil';
import { LogSocketHandler, Status } from "@/core/logsystem/LogSocketHandler";
import { LogMessage, LogMessageSchema } from "@/core/logsystem/LogMessage"
import { reactive, ref } from "vue";
import { getCurrentInstance } from 'vue'
import { VVirtualScroll } from 'vuetify/labs/VVirtualScroll'
import { LogType } from "@/core/logsystem/LogType";
import { getRef } from "@/utils/VueUtils";

type Test = { [key: string]: LogMessage }

export default {
    data() {
        return {
            status: Status.RECONNECTING,
            logs: [] as LogMessage[],
            selectedLogTypes: [LogType.INFO, LogType.ERROR, LogType.WARNING, LogType.STATE_SWITCH] as LogType[]
        }
    },
    computed: {
        // Returns a filtered log-list where all logs with an unselected type are hidden
        filteredLogs() {
            return this.logs.filter(log => this.selectedLogTypes.includes(log.type));
        }
    },
    setup() {
        // Creates the socket-connection
        const socket = new LogSocketHandler()

        return { socket, Status, LogType };
    },
    beforeUnmount() {
        // Ensures the socket is closed
        this.socket.end();
    },
    mounted() {
        // Starts the socket connection
        this.socket.setup(
            // New log    
            log => {
                // Adds log and scrolls down
                this.logs.push(log);

                // Delays a small time to give rendering time before scrolling
                setTimeout(() => getRef<any>(this, "scroller").scrollToIndex(Infinity), 100);
            },
            // Reset logs
            () => {
                this.logs = [];
            },
            // New status
            nstatus => {
                this.status = nstatus
            },
            // Invalid log retreived
            () => {
                openSnackbar(this, "Retreived invalid log...", "warning", "mdi-alert-outline", 1200);
            },
            // An error occurred with the connection
            () => {
                if (this.status == Status.RECONNECTING)
                    openSnackbar(this, "Reconnecting failed, retrying...", "error", "mdi-alert-outline", 1200);
                else
                    openSnackbar(this, "An connection-error occurred", "error", "mdi-alert-outline", 1200);
            })
    },
    methods: {
        // Small method to format the time of a logmessage
        getFormattedTime(time: Date) {
            // Converts a number to a string and adds a leading zero to ensure always a length of min 2
            const asTwoNums = (x: number) => (x <= 9 ? "0" : "") + x.toString();

            return `${asTwoNums(time.getHours())}:${asTwoNums(time.getMinutes())}:${asTwoNums(time.getSeconds())}`;
        },

        // Returns the color for a specific log-type
        getColor(type: LogType) {
            switch (type) {
                case LogType.DEBUG:
                    return "gray";
                case LogType.ERROR:
                    return "error";
                case LogType.WARNING:
                    return "warning"
                case LogType.INFO:
                    return "info"
                case LogType.STATE_SWITCH:
                    return "primary"
            }
        },

        // Returns the icon for a specific log-type
        getIcon(type: LogType) {
            switch (type) {
                case LogType.DEBUG:
                    return "mdi-bug-outline";
                case LogType.ERROR:
                    return "mdi-alert-circle-outline";
                case LogType.WARNING:
                    return "mdi-alert-outline"
                case LogType.INFO:
                    return "mdi-information-outline"
                case LogType.STATE_SWITCH:
                    return "mdi-state-machine"
            }
        },
    },
    components: {
        Snackbar,
        VVirtualScroll
    }
}
</script>