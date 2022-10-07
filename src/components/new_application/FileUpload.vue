<template>
    <div>
        <v-file-input 
            v-if="!value"
            :loading="loading"
            :accept="accept" 
            @change="file_upload($event)"
            :label="label" />
        <v-chip 
            v-else 
            close 
            label 
            @click:close="file_id = null">
            {{ $t('Upload OK') }}
        </v-chip>
    </div>
</template>

<script>

export default {
    name: 'FileUpload',
    props: {
        value: String,
        accept: String,
        label: String,
    },
    components: {
    },
    data() {
        return {
            loading: false,
        }
    },
    methods: {
        async file_upload(file) {

            this.loading = true
            const formData = new FormData()
            formData.append('file_to_upload', file)
            const headers = { 'Content-Type': 'multipart/form-data' }

            try {
                const { data } = await this.axios.post(`/v2/files`, formData, { headers })
                this.file_id = data.file_id
            }
            catch (error) {
                alert(`Upload failed`)
                console.error(error)
            }
            finally {
                this.loading = false
            }
        },
    },
    computed: {
        file_id: {
            get() { return this.value },
            set(newVal) { this.$emit('input', newVal) }
        }
    }
}
</script>