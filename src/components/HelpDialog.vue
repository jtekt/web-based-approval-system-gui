<template lang="html">
  <v-dialog
    v-model="help_dialog"
    width="800">

    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        v-bind="attrs"
        v-on="on">
        <v-icon>mdi-information</v-icon>
        <span>Help</span>
      </v-btn>
    </template>


    <v-card>
      <v-card-title class="text-h4">Help</v-card-title>

      <v-card-subtitle class="mt-4 text-h6">機能</v-card-subtitle>
      <v-card-text>添付のPDFに捺印（サイズ変更も可能）が可能です。</v-card-text>

      <v-card-subtitle class="mt-4 text-h6">回付手順</v-card-subtitle>
      <v-card-text>
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              １．ページ下部に表示されているPDF上の任意の場所に捺印します。（サイズ変更可能）
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              ２．メール作成ボタンを押すと、自動で次の回付者へメールが作成されます。
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              ３．作成されたメール（Outlook）をご自身で送信して下さい。
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              ４．以上で回付作業は終了です。ブラウザの×のボタンで閉じて下さい。
            </v-list-item-content>
          </v-list-item>
        </v-list>

      </v-card-text>

      <v-card-subtitle class="mt-4 text-h6">捺印済みファイルのダウンロード手順</v-card-subtitle>
      <v-card-text>ページに表示されているPDF上部にあるダウンロードから捺印済みのファイルをダウンロードします。</v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="#c00000"
          text
          @click="help_dialog = false">
          Close
        </v-btn>
      </v-card-actions>




    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'HelpDialog',
  data(){
    return {
      help_dialog: false,
    }
  }
}
</script>

<style lang="css" scoped>
</style>
