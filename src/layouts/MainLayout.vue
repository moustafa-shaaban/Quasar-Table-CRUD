<template>
    <q-layout view="hHh lpR fFf">

        <q-header reveal elevated class="bg-primary text-white" height-hint="98">
            <q-toolbar>
                <!-- <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" /> -->

                <q-toolbar-title>
                    Quasar CRUD
                </q-toolbar-title>
                <q-space />
                <q-btn flat round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleTheme" />
            </q-toolbar>

            <q-tabs align="left">
                <q-route-tab to="/" label="Home" />
                <q-route-tab to="/about" label="About" />
                <!-- <q-route-tab @click="toggleTheme" label="Toggle Theme" /> -->
            </q-tabs>
        </q-header>

        <!-- <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
        </q-drawer> -->

        <q-page-container>
            <router-view />
        </q-page-container>

    </q-layout>
</template>

<script setup>
import { Dark } from 'quasar'

const darkMode = localStorage.getItem('darkMode') === 'true';
Dark.set(darkMode);

function toggleTheme() {
    Dark.toggle()
    localStorage.setItem('darkMode', Dark.isActive);
}
</script>

<!-- <script>
import { Dark } from 'quasar'
import { ref } from 'vue'

export default {
    setup() {
        const leftDrawerOpen = ref(false)

        return {
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            toggleTheme() {
                Dark.toggle()
            }
        }
    }
}
</script> -->