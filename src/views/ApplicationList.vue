<template>
  <v-card>

    <v-toolbar flat>
      <v-toolbar-title
        class="text-h4">
        {{card_title_lookup[direction]}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        color="#c00000"
        dark
        :to="{name:'new_application'}">
        <v-icon>mdi-plus</v-icon>
        <span>新規作成 / New submission</span>

      </v-btn>

      <template v-slot:extension>
        <v-tabs
          color="#444444"
          v-model="tab"
          align-with-title>

          <v-tabs-slider color="#c00000"></v-tabs-slider>

          <v-tab
            v-for="table in tables[direction]"
            :key="`tab_${table.state}`">
            {{ table.title }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider></v-divider>

    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="table in tables[direction]"
        :key="`tab_item_${table.state}`">
        <v-card-text>
          <ApplicationListTable
            :title="table.title"
            :state="table.state"
            :headers="table.headers"
            :direction="direction"/>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>




  </v-card>
</template>

<script>
  import ApplicationListTable from '@/components/ApplicationListTable.vue'
  export default {
    name: 'ApplicationList',
    components: {
      ApplicationListTable
    },
    props: {
      direction: String,
    },
    data(){
      return {
        tab: null,
        card_title_lookup: {
          'submitted' : '送信トレイ / Outbox',
          'received': '受信トレイ / Inbox'
        },
        items: ['承認中 / Pending', '却下 / Rejected', '承認完了 / Approved'],

        tables: {
          submitted: [
            {
              title: '承認中 / Pending',
              state: 'pending',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '%', value: 'progress'},
                {text: '承認者 / Current recipient', value: 'current_recipient.properties.display_name'},
              ],
            },
            {
              title: '却下 / Rejected',
              state: 'rejected',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '%', value: 'progress'},
                {text: '承認者 / Current recipient', value: 'current_recipient.properties.display_name'},
              ],
            },
            {
              title: '承認完了 / Approved',
              state: 'approved',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
              ],
            },
          ],
          received: [
            {
              title: '承認中 / Pending',
              state: 'pending',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '却下 / Rejected',
              state: 'rejected',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '承認完了 / Approved',
              state: 'approved',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
          ]
        }

      }
    },
  }
</script>
