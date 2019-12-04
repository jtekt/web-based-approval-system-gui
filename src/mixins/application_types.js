export const application_types = {
  data(){
    return {
      application_types: [

        // IT
        {label: 'パソコン持ち出し申請 / PC takeout', component: 'PcTakeOut'},
        {label: 'パソコン持ち込み申請 / PC bring back', component: 'PcBringBack'},
        {label: 'メモリー持ち出し申請　/ Memory takeout', component: 'MemoryTakeOut'},
        {label: 'メモリー持ち込み申請　/ Memory bring back', component: 'MemoryBringBack'},

        // Purchases
        {label: '領収書事前申請 / Receipt based purchase application', component: 'ReceiptPurchaseBefore'},
        {label: '領収書精算申請 / Receipt based purchase settlement', component: 'ReceiptPurchaseAfter'},
        {label: '請求書事前申請 / Invoice based purchase application', component: 'InvoicePurchaseBefore'},
        {label: '請求書精算申請 / Invoice based purchase settlement', component: 'InvoicePurchaseAfter'},

        // Reports
        {label: 'レポート / Report', component: 'Report'},

        //{label: 'New template', component: 'NewTemplateTest'},

      ],
    }
  }

};
