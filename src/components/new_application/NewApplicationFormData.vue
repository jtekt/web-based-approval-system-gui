<template>
    <v-card-text>
        <v-row v-for="(field, index) in formFields" :key="`field_${index}`">

            <v-col>

                <FileUpload 
                    v-if="['file', 'pdf'].includes(field.type)" 
                    :label="field.label" 
                    v-model="field.value" 
                    :accept="field.type === 'pdf' ? 'application/pdf' : ''" />

                <!-- <template v-if="['file', 'pdf'].includes(field.type)">

                    <v-chip v-if="field.value" close label @click:close="field.value = null">
                        {{ $t('Upload OK') }}
                    </v-chip>

                    <v-file-input v-else :accept="field.type === 'pdf' ? 'application/pdf' : ''"
                        @change="file_upload($event, field)" :label="field.label" />

                </template> -->

                <v-checkbox v-else-if="field.type === 'checkbox'" v-model="field.value" :label="field.label" />

                <DatePicker v-else-if="field.type === 'date'" :label="field.label" v-model="field.value" />

                <v-textarea v-else-if="field.type === 'text'" rows="1" auto-grow :label="field.label"
                    v-model="field.value" />

                <v-text-field v-else v-model="field.value" :label="field.label" />

            </v-col>
        </v-row>
    </v-card-text>
</template>

<script>
import DatePicker from '../DatePicker.vue'
import FileUpload from './FileUpload.vue'

export default {
    name: 'NewApplicationFormData',
    props: {
        value: Array,
    },
    components: {
        DatePicker,
        FileUpload,
    },
    data(){
        return {
            file_uploading: false,
        }
    },
    methods: {
        async file_upload(file, field) {

            this.file_uploading = true
            const formData = new FormData()
            formData.append('file_to_upload', file)
            const headers = { 'Content-Type': 'multipart/form-data' }

            try {
                const { data } = await this.axios.post(`/v2/files`, formData, { headers })
                this.$set(field, 'value', data.file_id)
            }
            catch (error) {
                alert(`Upload failed`)
                console.error(error)

            }
            finally {
                this.file_uploading = false
            }
        },
    },
    computed: {
        formFields: {
            get(){ return this.value },
            set(newVal){ this.$emit('input', newVal)}
        }
    }
}
</script>