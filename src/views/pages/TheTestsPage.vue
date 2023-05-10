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

  <div v-if="availableTests === undefined"
    class="d-flex justify-center align-center h-100">
    <v-progress-circular color="primary"
      indeterminate></v-progress-circular>
  </div>

  <div v-else
    class="d-flex align-center flex-column">
    <v-btn v-for="key in availableTests"
      class="mt-4"
      prepend-icon="mdi-bug-play"
      @click="() => onTestClicked(key)"
      color="primary">
      Test {{ key }}
    </v-btn>

    <v-btn prepend-icon="mdi-refresh"
      @click="onRefreshClicked"
      class="mt-10">
      Refresh
    </v-btn>
  </div>
</template>

<script lang="ts">
import Ajv from "ajv";
import { loadJsonData } from "@/utils/RequestUtils";
import { Endpoints } from "@/Config"

// Schema and schema validator
const ajv = new Ajv();
const SCHEMA = {
  type: "array",
  items: {
    type: "string"
  }
}

export default {
  data: () => ({
    availableTests: undefined as string[] | undefined,

    dialog: {
      isOpen: false as boolean,
      message: "" as string,
      color: "" as string,
      title: "" as string
    }
  }),
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
      // Ensures no old test are loaded
      this.availableTests = undefined;

      // Waits until data has been retreived
      var res = await loadJsonData<any>(Endpoints.tests.get, SCHEMA);

      // Loads the new tests
      this.availableTests = res;

    },

    // Event: Refresh button clicked
    onRefreshClicked() {
      this.loadData();
    },

    // Event: A test-button is clicked
    async onTestClicked(test: string) {

      try {
        var res = await fetch(Endpoints.tests.start, {
          method: "POST",
          mode: "cors",
          body: test
        });

        // Checks if everything went to plan
        if (res.ok) {
          this.showMessage("Success", "Test is starting", false);
          return;
        }

        // Checks the error
        switch (res.status) {
          // Not in idle state
          case 412:
            this.showMessage("Error", "Tests can only be run in idle state", true);
            return;
          // Test not found
          case 405:
            this.showMessage("Error", "Test couldn't be found? Refreshing tests...", true);
            this.loadData();
            return;
          default:
            this.showMessage("Error", "An unknown error occurred, please try again.", true);
            return;
        }


        if (!res.ok)
          throw new Error("Retreived invalid status code: " + res.status + "/" + res.statusText);
      } catch (e) {
        this.showMessage("Error", "Failed to reach server, please retry manually.", true);
      }

    }
  },
  mounted() {
    // Starts loading the data
    this.loadData();
  },
  components: {
  }
}
</script>