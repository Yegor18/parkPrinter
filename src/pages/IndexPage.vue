<template>
  <q-page class="flex flex-center">
    <div class="q-gutter-y-md">
      <div class="row q-gutter-x-md">
        <div class="col"><q-input v-model="firstName" label="Имя" type="text" /></div>
        <div class="col"><q-input v-model="lastName" label="Фамилия" type="text" /></div>
        <div class="col"><q-input v-model="email" label="Почта" type="email" /></div>
      </div>
      <div class="row">
        <div class="col"><q-input v-model="text" type="textarea" /></div>
      </div>
      <div class="row justify-end">
        <div class="col-auto"><q-btn type="submit" unelevated color="primary" label="отправить"></q-btn>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'

let firstName = ref()
let lastName = ref()
let email = ref()
let text = ref()
</script>