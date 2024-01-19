<template>
  <q-editor v-model="editor" />
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'EditorComponent',

  setup() {
    return {
      editor: ref('')
    }
  }
})
</script>