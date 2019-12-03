export const application_types = {
  data(){
    return {
      application_types: [

        // IT
        {label: 'パソコン持ち出し申請 / PC takeout', component: 'PcTakeOut'},

        // Purchases
        {label: '領収書事前申請 / Receipt based purchase application', component: 'ReceiptPurchaseBefore'},
        {label: '領収書精算申請 / Receipt based purchase settlement', component: 'ReceiptPurchaseAfter'},
        //{label: '請求賞事前申請 / Invoice based purchase application', component: 'InvoicePurchaseBefore'},
        //{label: '請求賞精算申請 / Invoice based purchase settlement', component: 'InvoicePurchaseAfter'},

        // Reports
        {label: 'レポート / Report', component: 'Report'},

        {label: 'NEW', component: 'NewTemplateTest'},
        //{label: 'Test', component: 'TestForm'},
        //{label: 'Test Alternative', component: 'TestFormAlternative'},

        //{label: 'メモリー持ち込み', component: 'MemoryBringIn'},
      ],
    }
  }

};
