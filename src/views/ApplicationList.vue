<template>
  <div class="received applications">
    <h1 v-if="$route.params.type === 'received'">受け取った申請 / Received applications</h1>
    <h1 v-else-if="$route.params.type === 'submitted'">出した申請 / Submitted applications</h1>

    <div class="new_application_button_wrapper">

      <button
        type="button"
        class="bordered"
        @click="$router.push({path: '/create_application'})">
        <plus-icon />
        <span>新しい申請 / New application</span>
       </button>

    </div>


    <ApplicationTable
      :application_records="application_records"
      :hideRecipient="$route.params.type === 'received'"
      :hideApplicant="$route.params.type === 'submitted'"
      @load_more="load_more($event)"/>
  </div>
</template>

<script>
import ApplicationTable from '@/components/ApplicationTable.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'

export default {
  name: 'ApplicationList',
  components: {
    ApplicationTable,
    PlusIcon,
  },
  data () {
    return {
      application_records: {
        pending: [],
        rejected: [],
        approved: []
      }
    }
  },
  mounted () {
    this.get_applications()
  },
  beforeRouteUpdate (_, __, next) {
    next()
    this.$nextTick()
    .then(() => {
      this.get_applications()
    })
  },

  methods: {
    get_applications(){
      let application_direction = this.$route.params.type
      let application_states = ['pending', 'rejected', 'approved']

      application_states.forEach((state) => {

        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_direction}/${state}`

        this.$set(this.application_records[state], 'loading', true)
        this.axios.get(url,{params: {batch_size: 3}})
        .then(response => {
          this.application_records[state] = []
          response.data.forEach(record => {
            this.application_records[state].push(record)
          })
        })
        .catch(error => this.$set(this.application_records[state], 'error', 'Error loading applications'))
      })
    },
    load_more(event){
      console.log(event)
      let application_direction = this.$route.params.type
      let state = event
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_direction}/${state}`

      this.$set(this.application_records[state], 'loading', true)
      this.axios.get(url,{
        params: {
          start_index: this.application_records[state].length,
          batch_size: 3,
        }
      })
      .then(response => {
        response.data.forEach(record => {
          this.application_records[state].push(record)
        })
      })
      .catch(error => this.$set(this.application_records[state], 'error', 'Error loading applications'))
      .finally(() => {
        this.$set(this.application_records[state], 'loading', false)
      })
    }
  }
}
</script>

<style scoped>
.new_application_button_wrapper{
  text-align: center;
  padding: 10px;

}
</style>
