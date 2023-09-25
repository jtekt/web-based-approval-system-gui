<template>
    <v-data-table
        disable-sort
        :loading="loading"
        :items="applications"
        :headers="headers"
        :options.sync="options"
        :server-items-length="application_count"
        @click:row="row_clicked($event)"
    >
        <template v-slot:body v-if="error">
            <div class="error_message">An error occured while loading data</div>
        </template>

        <template v-slot:item.creation_date="{ item }">
            <span>{{ format_date_neo4j(item.creation_date) }}</span>
        </template>

        <template v-slot:item.progress="{ item }">
            <v-progress-linear :value="item.progress" height="0.5em" rounded />
        </template>

        <template v-slot:item.current_recipient="{ item }">
            <UserChip
                :user="item.current_recipient"
                :link="false"
                v-if="item.current_recipient"
            />
        </template>

        <template v-slot:item.applicant="{ item }">
            <UserChip :user="item.applicant" :link="false" />
        </template>
    </v-data-table>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'
import dateUtils from '@/mixins/dateUtils.js'
import UserChip from '../UserChip.vue'

export default {
    name: 'ApplicationListTable',
    components: {
        UserChip,
    },
    props: {
        direction: String,
        title: String,
        headers: {
            type: Array,
            default() {
                return [{ text: 'Title', value: 'properties.title' }]
            },
        },
    },
    mixins: [IdUtils, dateUtils],
    data() {
        return {
            loading: false,
            options: {},
            applications: [],
            application_count: 0,
            error: null,
            relationship_lookup: {
                submitted: 'SUBMITTED_BY',
                received: 'SUBMITTED_TO',
            },
        }
    },

    mounted() {
        this.get_applications()
    },
    watch: {
        options: {
            handler() {
                this.get_applications()
            },
            deep: true,
        },
        direction() {
            this.get_applications()
        },
        state() {
            this.get_applications()
        },
    },
    methods: {
        get_applications() {
            this.loading = true

            this.applications = []

            const { page, itemsPerPage } = this.options

            const params = {
                start_index: (page - 1) * itemsPerPage,
                batch_size: itemsPerPage,
                type: this.type,
                relationship: this.relationship_lookup[this.direction],
                state: this.$route.query.state || 'pending',
            }

            this.axios
                .get(`/applications`, { params })
                .then(({ data }) => {
                    this.applications = data.applications
                    this.application_count = data.count
                    this.applications.forEach((application) => {
                        // Adding current recipient and progress to application
                        // This should better be done somewhere else

                        application.current_recipient = application.recipients
                            .slice()
                            .sort(
                                (a, b) =>
                                    a.submission.flow_index -
                                    b.submission.flow_index
                            )
                            .find((recipient) => !recipient.approval)

                        application.progress =
                            (100 *
                                application.recipients.filter(
                                    (recipient) => recipient.approval
                                ).length) /
                            application.recipients.length
                    })
                })
                .catch((error) => {
                    console.error(error)
                    this.error = error
                })
                .finally(() => {
                    this.loading = false
                })
        },
        row_clicked(application) {
            const application_id = this.get_id_of_item(application)
            this.$router.push({
                name: 'application',
                params: { application_id },
            })
        },
    },
    computed: {
        state() {
            return this.$route.query.state
        },
    },
}
</script>

<style scoped>
.error_message {
    padding: 0.5em;
    color: #c00000;
}
</style>
