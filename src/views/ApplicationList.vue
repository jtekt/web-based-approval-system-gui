<template>
  <div class="received applications">
    <h1 v-if="type === 'received'">受け取った申請 / Received applications</h1>
    <h1 v-else-if="type === 'submitted'">出した申請 / Submitted applications</h1>

    <div class="new_application_button_wrapper">

      <button
        type="button"
        class="bordered"
        @click="$router.push({name: 'create_application'})">
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
  props: {
    type: String,
  },
  data () {
    return {
      batch_size: 10,
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
  watch: {
    // whenever question changes, this function will run
    type() {
      this.get_applications()
    }
  },

  methods: {
    get_applications(){
      let application_direction = this.type
      let application_states = ['pending', 'rejected', 'approved']
      application_states.forEach((state) => {
        this.$set(this.application_records, state, [])
        this.actual_api_call(application_direction,state)
      })
    },
    actual_api_call(application_direction, state){
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_direction}/${state}`

      this.$set(this.application_records[state], 'loading', true)
      this.axios.get(url,{
        params: {
          batch_size: this.batch_size,
          start_index: this.application_records[state].length,
        }
      })
      .then(response => {
        response.data.forEach(record => {
          this.application_records[state].push(record)
        })
        if(response.data.length < this.batch_size){
          this.$set(this.application_records[state], 'all_loaded', true)
        }
      })
      .catch(error => this.$set(this.application_records[state], 'error', 'Error loading applications'))
      .finally(() => { this.$set(this.application_records[state], 'loading', false) })
    },
    load_more(event){
      let application_direction = this.$route.params.type
      let state = event

      this.actual_api_call(application_direction,state)
    }
  },
}
</script>

<style scoped>
.new_application_button_wrapper{
  text-align: center;
  padding: 10px;

}
</style>
