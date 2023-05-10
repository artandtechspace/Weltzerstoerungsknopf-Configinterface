<template>
  <!--Feedback components for messages-->
  <Dialog ref="dialog" />
  <Snackbar ref="snackbar" />

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
import { loadJsonData } from "@/utils/RequestUtils";
import { Endpoints } from "@/Config"
import Dialog from "@/components/Dialog.vue";
import Snackbar from "@/components/Snackbar.vue"
import { openDialog, openSnackbar } from '@/utils/FeedbackUtil';
import { RequestStatus } from "@/utils/RequestUtils"

// Data validator
const SCHEMA = {
  type: "array",
  items: {
    type: "string"
  }
}

export default {
  data: () => ({
    // Tests that got loaded
    availableTests: undefined as string[] | undefined,

    // If the loading-dialog is open
    status: RequestStatus.LOADING,
    errorMessage: undefined as string | undefined,
  }),
  methods: {

    // Function to load data from the backend
    async loadData() {

      // Sets loading state
      this.status = RequestStatus.LOADING;

      try {
        // Waits until data has been retreived
        var res = await loadJsonData<any>(Endpoints.tests.get, SCHEMA);

        // Loads the new tests
        this.availableTests = res;

        // Closes the loading dialog
        this.status = RequestStatus.SUCCESS;
      } catch (e) {
        this.errorMessage = e as string;
        this.status = RequestStatus.ERROR
      }
    },

    // Sends a request to start the test
    async sendTestStart(testname: string){
      // Sets the loading state
      this.status = RequestStatus.LOADING;

      try {
        var res = await fetch(Endpoints.tests.start, {
          method: "POST",
          mode: "cors",
          body: testname
        });

        // Checks if everything went to plan
        if (res.ok) {
          openDialog(this, "Test is starting", "Test is starting", "primary", [{ text: "close" }]);
          return;
        }

        // Checks the error
        switch (res.status) {
          // Not in idle state
          case 412:
            throw "Tests can only be run in idle state";
          // Test not found
          case 405:
            // Refreshes the data with a second delay in case the refresh
            // failes and open a new dialog (thus closing this one)
            setTimeout(this.loadData.bind(this), 1000);
            throw "Test couldn't be found? Refreshing tests...";
          default:
            throw res.statusText;
        }
      } catch (e: any) {
        // Retry callback
        var cb = ()=>this.sendTestStart(testname);

        openDialog(this, e.toString(), "Error", "error", [
          {
            text: "Retry",
            action: cb
          },
          {text: "Close"},
        ]);
      }

      // Returns back to the normal state
      this.status = RequestStatus.SUCCESS;
    },

    // Event: Refresh button clicked
    onRefreshClicked() {
      this.loadData();
    },

    // Event: A test-button is clicked
    onTestClicked(test: string) {
      this.sendTestStart(test);
    }
  },
  mounted() {
    // Starts loading the data
    this.loadData();
  },
  setup() {
    return {
      // Forwards to ensure usability inside the template
      RequestStatus
    }
  },
  components: {
    Dialog, Snackbar
  }
}
</script>