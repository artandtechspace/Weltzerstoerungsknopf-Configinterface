<template>
    <v-dialog transition="dialog-bottom-transition"
        v-model="dialog.isOpen"
        width="auto">
        <v-card>
            <v-toolbar class="text-h2"
                :color="dialog.color"
                :title="dialog.title"></v-toolbar>
            <v-card-text>
                <div class="text-h4 pa-2">{{ dialog.message }}</div>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text"
                    @click="dialog.isOpen = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <div v-if="showLoadingDialog"
        class="d-flex justify-center align-center h-100">
        <v-progress-circular color="primary"
            indeterminate></v-progress-circular>
    </div>
    <form v-else>

        <v-text-field type="number"
            v-model="state.counter"
            :error-messages="v$.counter.$errors.map(e => e.$message)"
            label="Counter"
            @input="v$.counter.$touch"
            @blur="v$.counter.$touch"
            :min=0>
        </v-text-field>

        <v-text-field v-model="state.event"
            :error-messages="v$.event.$errors.map(e => e.$message)"
            label="Event-Name"
            @input="v$.event.$touch"
            @blur="v$.event.$touch"></v-text-field>
        <v-textarea label="General Text"
            v-model="state.text"
            :error-messages="v$.text.$errors.map(e => e.$message)"
            @input="v$.text.$touch"
            @blur="v$.text.$touch"></v-textarea>


        <v-container class="d-flex justify-center">
            <v-row justify="center"
                align="center">
                <v-col cols="auto">
                    <v-btn prepend-icon="mdi-content-save-outline"
                        class="me-4 mb-4"
                        @click="onSubmitClicked">
                        submit
                    </v-btn>
                </v-col>

                <v-col cols="auto">
                    <v-btn prepend-icon="mdi-delete-outline"
                        class="me-4 mb-4"
                        @click="onClearClicked">
                        clear
                    </v-btn>
                </v-col>

                <v-col cols="auto">
                    <v-btn prepend-icon="mdi-refresh"
                        class="mb-4"
                        @click="onRefreshClicked">
                        Refresh
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </form>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue, maxValue, helpers } from '@vuelidate/validators'
import Ajv from "ajv";
import { loadJsonData } from "@/utils/RequestUtils";

// Schema and schema validator
const ajv = new Ajv();
const SCHEMA = {
    type: "object",
    properties: {
        counter: { type: "integer", min: 0 },
        event: { type: "string" },
        text: { type: "string" }
    },
    required: ["counter", "event", "text"],
};

// Small validator utils to ensure that a text contains a given string
const contains = (param: string) => (value: string) => !helpers.req(value) || value.includes(param)

export default {
    data() {
        return {
            // If the loading-dialog is open
            showLoadingDialog: true,


            dialog: {
                isOpen: false as boolean,
                message: "" as string,
                color: "" as string,
                title: "" as string
            }
        }
    },
    mounted() {
        // Starts loading the data
        this.loadData();
    },
    methods: {
        // Displays a given message to the user
        showMessage(title: string, msg: string, isError: boolean) {
            this.dialog.isOpen = true;
            this.dialog.message = msg;
            this.dialog.color = isError ? "error" : "primary"
            this.dialog.title = title;
        },

        // Function to load data from the backend
        async loadData() {
            // Ensures the loading dialog
            this.showLoadingDialog = true;

            // Waits until data has been retreived
            var res = await loadJsonData<any>("http://localhost:5000/api/get_config", SCHEMA);

            // Closes the loading dialog
            this.showLoadingDialog = false;

            // Updates the state
            for (var key in res)
                (this.state as any)[key] = res[key];
        },

        // Event: Refresh button clicked
        onRefreshClicked() {
            this.clearData();

            this.loadData();
        },

        // Event: Clear button clicked
        onClearClicked() {
            this.clearData();
        },

        // Event: Submit button clicked
        async onSubmitClicked() {
            if (!await this.v$.$validate())
                return;

            try {
                var res = await fetch("http://localhost:5000/api/update_config", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...this.state,
                        counter: parseInt((this.state as any).counter)
                    })
                });

                if (!res.ok)
                    throw new Error("Retreived invalid status code: " + res.status + "/" + res.statusText);
            } catch (e) {
                this.showMessage("Error", "Failed to save, please retry manually", true)
            }

        },
    },
    setup() {
        const initialState = {
            counter: undefined,
            event: "",
            text: ""
        }

        const state = reactive({
            ...initialState,
        })

        const rules = {
            counter: {
                required: helpers.withMessage("Please specify a counter", required),
                minValue: minValue(0)
            },
            event: {
                required: helpers.withMessage("Please specify an event-name", required),

            },
            text: {
                required: helpers.withMessage("Please specify an event-text", required),
                mustHaveCounter: helpers.withMessage('The text must contain %counter%', contains("%counter%")),
                mustHaveEvent: helpers.withMessage('The text must contain %event%', contains("%event%"))
            }
        }

        const v$ = useVuelidate(rules, state)

        // Clears all data from the ui
        function clear() {
            v$.value.$reset()

            for (const [key, value] of Object.entries(initialState)) {
                (state as any)[key] = value
            }
        }

        return { state, v$, clearData: clear }
    },
}
</script>
