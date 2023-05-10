<template>
    <!--Feedback components for messages-->
    <Dialog ref="dialog"/>
    <Snackbar ref="snackbar"/>

    <!--Loading state-->
    <div v-if="status === RequestStatus.LOADING"
        class="d-flex justify-center align-center h-100">
        <v-progress-circular color="primary"
            indeterminate></v-progress-circular>
    </div>

    <!--Error state-->
    <div v-else-if="status === RequestStatus.ERROR"
        class="d-flex justify-center flex-column align-center h-100">
        <div class="text-h4 pa-2">Error retreiving data</div>
        {{ errorMessage }}

        <v-btn prepend-icon="mdi-refresh"
            class="mt-12"
            @click="loadData">
            Refresh
        </v-btn>
    </div>

    <!--Data state-->
    <form v-else>

        <v-text-field type="number"
            v-model="state.counter"
            :errorMessages="(v$.counter.$errors.map(e => e.$message) as string[])"
            label="Counter"
            :min=0
            @input="v$.counter.$touch"
            @blur="v$.counter.$touch">
        </v-text-field>

        <v-text-field v-model="state.event"
            :errorMessages="(v$.event.$errors.map(e => e.$message) as string[])"
            label="Event-Name"
            @input="v$.event.$touch"
            @blur="v$.event.$touch"></v-text-field>
        <v-textarea label="General Text"
            v-model="state.text"
            :errorMessages="(v$.text.$errors.map(e => e.$message) as string[])"
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
import { loadJsonData } from "@/utils/RequestUtils";
import { RequestStatus } from "@/utils/RequestUtils"
import { Endpoints } from "@/Config"
import Dialog from "@/components/Dialog.vue";
import Snackbar from "@/components/Snackbar.vue"
import { openDialog, openSnackbar } from '@/utils/FeedbackUtil';

// Scheam for validation
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
            status: RequestStatus.LOADING,
            errorMessage: undefined as string | undefined
        }
    },
    mounted() {
        // Starts loading the data
        this.loadData();
    },
    methods: {
        // Function to load data from the backend
        async loadData() {
            // Ensures the loading dialog
            this.status = RequestStatus.LOADING;

            try {
                // Waits until data has been retreived
                var res = await loadJsonData<any>(Endpoints.config.get, SCHEMA);
            } catch (e) {
                this.errorMessage = e as string;
                this.status = RequestStatus.ERROR
                return;
            }

            // Closes the loading dialog
            this.status = RequestStatus.SUCCESS;

            // Updates the state
            for (var key in res)
                (this.state as any)[key] = res[key];
        },

        // Function to send data back to the backend to save it
        async sendData(data: object){
            // Displays the loading screen
            this.status = RequestStatus.LOADING;

            try {
                var res = await fetch(Endpoints.config.update, {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...data,
                        counter: parseInt((data as any).counter)
                    })
                });

                if (!res.ok)
                    throw res.statusText;
                
                // Notifies the user
                openSnackbar(this, "Successfully saved", "success", "mdi-account");
            } catch (e : any) {
                // Function to callback to retry
                var cb = ()=>this.sendData(data);

                openDialog(this, e.toString(), "Error saving settings", "error", [
                    {
                        text: "Retry",
                        action: cb,
                    },
                    {text: "Close"}
                ])
            }

            // Returns the state back to normal
            this.status = RequestStatus.SUCCESS;
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
            // Validates the data
            if (!await this.v$.$validate())
                return;
            
            // Sends the data
            this.sendData(this.state)
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

        return {
            state,
            v$,
            clearData: clear,

            // Forwards to ensure usability inside the template
            RequestStatus
        }
    },
    components: {
        Dialog, Snackbar
    }
}
</script>
