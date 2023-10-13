<template>
    <div>
        <v-list-item>
            <v-list-item-content>
                {{ $t('Confidential') }}
            </v-list-item-content>
            <v-list-item-content class="align-end">
                <v-switch
                    :disabled="!user_is_applicant"
                    v-model="application.private"
                    @change="update_privacy_of_application()"
                />
            </v-list-item-content>
        </v-list-item>

        <template v-if="application.private">
            <v-divider />
            <v-list-item>
                <v-list-item-content>{{
                    $t('Visibility')
                }}</v-list-item-content>
                <v-list-item-content class="align-end">
                    <v-row>
                        <v-col cols="auto">
                            <v-chip outlined label>{{
                                $t('Approval flow')
                            }}</v-chip>
                        </v-col>
                        <v-col
                            cols="auto"
                            v-for="(group, index) in application.visibility"
                            :key="`group_${index}`"
                        >
                            <GroupChip
                                :group="group"
                                :close="user_is_applicant"
                                @click:close="
                                    remove_application_visibility_to_group(
                                        group
                                    )
                                "
                            />
                        </v-col>
                        <v-col cols="auto" v-if="user_is_applicant">
                            <AddGroupDialog
                                @selection="share_with_group($event)"
                            />
                        </v-col>
                    </v-row>
                </v-list-item-content>
            </v-list-item>
        </template>
    </div>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import GroupChip from '@/components/GroupChip.vue'

export default {
    name: 'ApplicationPrivacy',
    components: {
        AddGroupDialog,
        GroupChip,
    },
    props: {
        value: Object,
    },
    mixins: [IdUtils],

    data() {
        return {
            application: this.value,
        }
    },
    watch: {
        application: {
            deep: true,
            handler() {
                this.$emit('update', this.application)
            },
        },
    },
    computed: {
        application_id() {
            return this.$route.params.application_id
        },
        user_as_recipient() {
            return this.application.recipients.find(
                (recipient) =>
                    this.get_id_of_item(recipient) === this.current_user_id
            )
        },

        user_is_applicant() {
            return (
                this.get_id_of_item(this.application.applicant) ===
                this.current_user_id
            )
        },
    },
    methods: {
        async update_privacy_of_application() {
            const url = `/applications/${this.application_id}/privacy`
            const body = { private: this.application.private }

            try {
                await this.axios.put(url, body)
            } catch (error) {
                alert('Error updating privacy of application')
                console.error(error)
            }
        },
        share_with_group(group) {
            const url = `/applications/${this.application_id}/privacy/groups`
            const body = { group_id: this.get_id_of_item(group) }
            this.axios
                .post(url, body)
                .then(() => {
                    // create visibility array if needed, not sure if required
                    if (!this.application.visibility) {
                        this.$set(this.application, 'visibility', [])
                    }
                    this.application.visibility.push(group)
                })
                .catch((error) => {
                    alert('Error updating visibility of application')
                    console.error(error)
                })
        },
        remove_application_visibility_to_group(group) {
            const url = `/applications/${
                this.application_id
            }/privacy/groups/${this.get_id_of_item(group)}`
            this.axios
                .delete(url)
                .then(() => {
                    const groupIndex = this.application.visibility.findIndex(
                        (g) =>
                            this.get_id_of_item(g) ===
                            this.get_id_of_item(group)
                    )
                    if (groupIndex >= 0)
                        this.application.visibility.splice(groupIndex, 1)
                })
                .catch((error) => {
                    console.error(error)
                    alert('Error updating visibility of application')
                })
        },
    },
}
</script>
