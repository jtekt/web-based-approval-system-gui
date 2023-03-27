<template>
  <div>
    <v-file-input
      v-if="!value"
      :loading="loading"
      :accept="accept"
      @change="file_upload($event)"
      :label="label"
    />

    <v-text-field
      v-else
      :label="label"
      readonly
      prepend-icon="mdi-paperclip-check"
      :value="$t('Upload OK')"
      clearable
      @click:clear="file_id = null"
    />
  </div>
</template>

<script>
export default {
  name: "FileUpload",
  props: {
    value: String,
    accept: String,
    label: String,
  },
  components: {},
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    async file_upload(file) {
      this.loading = true
      const formData = new FormData()
      formData.append("file_to_upload", file)
      const headers = { "Content-Type": "multipart/form-data" }

      try {
        const { data } = await this.axios.post(`/files`, formData, { headers })
        this.file_id = data.file_id
      } catch (error) {
        alert(`Upload failed`)
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
  computed: {
    file_id: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit("input", newVal)
      },
    },
  },
}
</script>
