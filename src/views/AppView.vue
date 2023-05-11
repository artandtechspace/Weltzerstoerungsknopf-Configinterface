<template>
  <v-app>


    <v-app-bar>
      <v-toolbar-title>
        <v-icon @click="onSecretClicked" icon="mdi-earth-remove" class="mr-4 text-error"/>
        <span>Weltzerstörungsknopf / {{ selected_view.title }}</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer location="bottom"
      temporary
      v-model="drawer">
      <v-list lines="one"
        density="comfortable"
        nav
        :selected="[selected_view.index]">

        <v-list-item :title="item.title"
          :value="idx"
          rounded="xl"
          @click="onSelectView(item)"
          v-for="(item, idx) in navItems"
          :key="idx"
          :prepend-icon="item.icon">
        </v-list-item>
      </v-list>

    </v-navigation-drawer>

    <v-main>
      <v-btn @click="drawer = !drawer"
        style="position: fixed; bottom: 10px; right: 10px; z-index: 5;"
        icon="mdi-menu"
        size="large"></v-btn>
      <component :is="selected_view.component"></component>
    </v-main>

  </v-app>
</template>

<script lang="ts">

import { defineAsyncComponent } from "vue";
import { markRaw } from "vue";

// Predefined navigation items
// that can be selected
type NavItem = {
  title: string,
  icon: string,
  // Holds the path to the vue-component and is used
  // to async-render the component
  renderer: any
}
// Gets created dynamically and holds actual data requird for the
// selected component to render
type SelectedNavItem = {
  // Asyncly-loaded component to render the main content
  component: any,
  // Index of the navbar item (Used to highlight the correct one)
  index: number,
  // Actual title of the current page
  title: string
}

export default {
  methods: {

    // Event: When a view get's selected
    onSelectView(view: NavItem) {
      this.selected_view = {
        component: view.renderer,
        index: this.navItems.indexOf(view),
        title: view.title
      }
      this.drawer = false;
    },


    // Event: When the secret "button" gets clicked
    onSecretClicked(){
      // Ensures that the secret button is only clicked once
      if(document.body.classList.contains("explosion"))
        return;

      // Adds the explosion class
      document.body.classList.add("explosion");

      setTimeout(() => {
        // Resets the class
        document.body.classList.remove("explosion");
      }, 1200);
    }

  },
  beforeMount() {
    this.onSelectView(this.navItems[0]);
  },
  data: () => ({
    // Dynamically-imported view
    // Will directly at the start be filled
    selected_view: null as any as SelectedNavItem,

    // If the drawer is open or closed
    drawer: false,

    // Navigation bar items
    navItems: [
      {
        title: "Settings",
        icon: "mdi-cog-outline",
        renderer: defineAsyncComponent(() => import("./pages/TheSettingsPage.vue"))
      }, {
        title: "Tests",
        icon: "mdi-test-tube",
        renderer: defineAsyncComponent(() => import("./pages/TheTestsPage.vue"))
      }, {
        title: "Logging",
        icon: "mdi-file-code-outline",
        renderer: defineAsyncComponent(() => import("./pages/TheLoggingPage.vue"))
      }
    ] as NavItem[]
  }),
}
</script>
  
<style lang="sass">
  @import '../../node_modules/@fontsource/roboto/index.css'
</style>
