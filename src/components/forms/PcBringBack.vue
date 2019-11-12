<template>
  <div>

    <table>
      <tr>
        <td>Submitted applications</td>
        <td>
          <div class="past_takeout_application" v-for="application in takeout_applications">

            <input type="radio" v-model="form_data.takeout_application_id" v-bind:value="application._fields[0].identity.low">

            <div v-for="value,key in JSON.parse(application._fields[0].properties.form_data)">
              {{key}}: {{value}}
            </div>

            <button v-on:click.stop.prevent="see_application(application._fields[0].identity.low)">SEE</button>

          </div>
        </td>
      </tr>
    </table>

  </div>


</template>

<script>
export default {
  name: 'PcBringBack',
  data(){
    return {
      takeout_applications: [],
      form_data: {
        takeout_application_id: "",
      }
    }
  },
  mounted(){
    this.axios.post('http://172.16.98.151:9723/get_submitted_applications', {})
    .then(response => {
      this.takeout_applications.splice(0,this.takeout_applications.length)
      response.data.records.forEach(record => {

        // Check if type is pc application
        if(record._fields[0].properties.type === "PcTakeOut"){

          // TODO: CHECK IF APPROVED
          this.takeout_applications.push(record)
        }

      })
    })
    .catch(error => console.log(error))
  },
  methods: {
    see_application(id){
      window.open('http://172.16.98.151:8083/show_application?id=' + id)
    }
  }

}
</script>

<style scoped>
.past_takeout_application{
  border: 1px solid black;
  margin: 5px;
}
</style>
