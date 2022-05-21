<template>
  <v-card>

    <v-toolbar flat>
      <v-toolbar-title
        class="text-h4">
        {{card_title_lookup[direction]}}
      </v-toolbar-title>
      <v-spacer />

      <v-btn
        color="#c00000"
        dark
        :to="{name:'new_application'}">
        <v-icon>mdi-plus</v-icon>
        <span>{{ $t('new_application') }}</span>
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
        
        items: ['承認待ち / Pending', '却下 / Rejected', '承認完了 / Approved'],

        tables: {
          submitted: [
            {
              title: '承認中 / Pending',
              state: 'pending',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: 'タイプ / Type', value: 'properties.type'},
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
                {text: 'タイプ / Type', value: 'properties.type'},
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
                {text: 'タイプ / Type', value: 'properties.type'},
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
                {text: 'タイプ / Type', value: 'properties.type'},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '却下 / Rejected',
              state: 'rejected',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: 'タイプ / Type', value: 'properties.type'},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
            {
              title: '承認完了 / Approved',
              state: 'approved',
              headers: [
                {text: '日付 / Date', value: "properties.creation_date"},
                {text: 'タイプ / Type', value: 'properties.type'},
                {text: '件名 / Title', value: 'properties.title'},
                {text: '申請者 / Applicant', value: 'applicant.properties.display_name'},
              ],
            },
          ]
        }

      }
    },
    computed: {
      card_title_lookup(){
        return {
          submitted : this.$t('title.outbox'),
          received: this.$t('title.inbox')
        }
      }
    }
  }
</script>

<i18n>
{
  "en": {
    "new_application": "New submission",
    "title": {
      "inbox": "Inbox",
      "outbox": "Outbox"
    }
  },
  "ja": {
    "new_application": "新規作成",
    "title": {
      "inbox": "受信トレイ",
      "outbox": "送信トレイ"
    }
  }

}
</i18n>
