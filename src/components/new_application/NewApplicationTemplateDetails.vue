<template>
    <v-expansion-panels v-if="selected_form && !this.$route.query.copy_of" flat accordion>
        <v-expansion-panel>
            <v-expansion-panel-header>
                {{ $t('Type') }}: {{ selected_form.label }} ({{ $t('Click for more info') }})
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-row>
                    <v-col>
                        {{ $t('Template author') }}: {{ selected_form.author.display_name }}
                    </v-col>
                    <v-spacer />
                    <v-col cols="auto">
                        <router-link :to="{ name: 'template', params: { template_id: selected_form._id } }">
                            {{ $t('Template page') }}
                        </router-link>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" class="form_description">
                        {{ selected_form.description }}
                    </v-col>
                </v-row>
            </v-expansion-panel-content>

        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>

export default {
    name: 'NewApplicationTemplateDetails',
    props: {
        selected_form: Object,
    },
    data() {
        return {
            
        }
    },
    methods: {

    },
    computed: {

    }
}
</script>