<template>
    <v-snackbar
      v-model="isOpen"
      :timeout="timeout"
      :color="color"
      min-width="0"
    >
    <div class="d-flex justify-center align-center w-100 h-100">
        <v-icon :icon="icon"></v-icon>
        <p class="ml-2 d-inline">{{ message }}</p>
    </div>
    </v-snackbar>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'

export default {
    data() {
        return {
            isOpen: false as boolean,
            message: "" as string,
            timeout: 0 as number,
            icon: "" as string,
            color: "" as string
        }
    },
    methods: {
        // Opens the dialog with the given properties,
        // use FeedbackUtils.openSnackbar as a shortcut for this
        open(message: string, color: string, icon: string, length: number) {
            this.message = message;
            this.timeout = length;
            this.isOpen = true;
            this.color = color;
            this.icon = icon;
        },
    }
}
</script>
