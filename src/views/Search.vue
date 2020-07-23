<template>
  <div class="">
    <h1>検索 / Search</h1>

    <form @submit.prevent="search()">
      <label>ハンコ ID</label>
      <input type="search" v-model="hanko_id" placeholder="ID">

      <label>ハ申請 ID</label>
      <input type="search" v-model="application_id" placeholder="ID">


      <label>Type</label>
      <input type="search" v-model="application_type" placeholder="Type">

      <label>Start date</label>
      <input type="date" v-model="start_date">

      <label>End date</label>
      <input type="date" v-model="end_date">

      <label>Relationship</label>

      <select class="" v-model="relationship_type">
        <option :value="null">None</option>
        <option value="APPROVED">APPROVED</option>
        <option value="SUBMITTED_BY">SUBMITTED_BY</option>
        <option value="SUBMITTED_TO">SUBMITTED_TO</option>
        <option value="REJECTED">REJECTED</option>

      </select>

      <input type="submit">

    </form>

    <div class="export_button_wrapper">
      <button
        class="bordered"
        type="button"
        @click="download_table_as_csv">
        CSV export
      </button>

    </div>


    <div class="table_wrapper">
      <table id="search_results_table">
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Title</th>
          <th>Applicant</th>
          <th
            v-for="(label, i) in field_labels"
            :key="`field_label_${i}`">
            {{label}}
          </th>
        </tr>

        <SearchResult
          v-for="(record, i) in application_records"
          v-bind:key="`result_${i}`"
          :record="record"
          :fields="field_labels"/>

      </table>
    </div>



  </div>

</template>

<script>
import SearchResult from '@/components/SearchResult.vue'

export default {
  name: 'Search',
  components: {
    SearchResult
  },
  data () {
    return {
      application_id: null,
      hanko_id: null,
      relationship_type: null,
      application_type: null,
      application_records: [],
      field_labels: [],
      start_date: null,
      end_date: null,
    }
  },
  methods: {
    search () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/search`
      this.axios.get(url, {
        params: {
          hanko_id: this.hanko_id,
          application_id: this.application_id,
          relationship_type: this.relationship_type,
          application_type: this.application_type,
          start_date: this.start_date,
          end_date: this.end_date,
        }
      })
      .then(response => {
        this.application_records = []
        this.field_labels = []
        response.data.forEach((record) => {
          this.application_records.push(record)
          let application = record._fields[record._fieldLookup.application]
          let form_data = JSON.parse(application.properties.form_data)

          if(!Array.isArray(form_data)) return
          form_data.forEach((field) => {
            if(!this.field_labels.includes(field.label) && field.type !== 'file' ) {
              this.field_labels.push(field.label)
            }
          })

        })

      })
      .catch(error => {
        console.log(error)
      })

    },
    download_table_as_csv() {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + 'search_results_table' + ' tr');
    // Construct csv
    var csv = [];
    for (var i = 0; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll('td, th');
      for (var j = 0; j < cols.length; j++) {
        // Clean innertext to remove multiple spaces and jumpline (break csv)
        var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
        // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
        data = data.replace(/"/g, '""');
        // Push escaped string
        row.push('"' + data + '"');
      }
      csv.push(row.join(','));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = `export.csv`
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string))
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



  }
}
</script>

<style scoped>
form {
  text-align: center;
}
form > * {
  margin: 0.25em;
}

.table_wrapper {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  //table-layout: fixed;
  min-width: 100%;
}

tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

tr:not(:first-child) {
  cursor: pointer;
  transition: background-color 0.25s;
}

tr:not(:first-child):hover {
  background-color: #eeeeee;
}

.export_button_wrapper {
  margin: 1em;
  text-align: center;
}
</style>
