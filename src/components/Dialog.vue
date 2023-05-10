<template>
    <v-dialog transition="dialog-bottom-transition"
        v-model="isOpen"
        width="auto">
        <v-card>
            <v-toolbar class="text-h2"
                :color="color"
                :title="title"></v-toolbar>
            <v-card-text>
                <div class="text-h4 pa-2">{{ message }}</div>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn v-for="btn in buttons"
                    variant="text"
                    @click="onButtonClicked(btn)">
                {{ btn.text }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'
import { DialogButton } from "@/utils/FeedbackUtil";

export default {
    data() {
        return {
            isOpen: false as boolean,
            message: "" as string,
            color: "" as string,
            title: "" as string,
            buttons: [] as DialogButton[]
        }
    },
    methods: {
        // Opens the dialog with the given properties,
        // use FeedbackUtils.openDialog as a shortcut for this
        open(message: string, title: string, color: string, buttons: DialogButton[]) {
            this.message = message;
            this.title = title;
            this.color = color;
            this.buttons = buttons;
            this.isOpen = true;
        },

        // Event: Whenever one of the buttons is clicked
        onButtonClicked(btn: DialogButton) {
            // Closes the dialog if required
            if(btn.closeOnAction === undefined || btn.closeOnAction)
                this.isOpen = false;

            // Run the callback
            if(btn.action !== undefined)
                btn.action();
        }
    }
}
</script>
