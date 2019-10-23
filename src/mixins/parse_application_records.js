
export const parse_application_records = {
  methods: {
    parse_application_records(records){

      // Remove applications
      // MIGHT NEED TO DO THIS OUTSIDE
      this.applications.splice(0,this.applications.length);

      records.forEach(record => {

        // Create function to retrieve fields
        // MIGHT WANT TO EXTERNALIZE IT
        record.getField = function(fieldName){
          return this._fields[this._fieldLookup[fieldName]]
        }

        const application_field_index = record._fieldLookup['application'];
        const applicant_field_index = record._fieldLookup['applicant'];
        const recipient_field_index = record._fieldLookup['recipient'];

        const submission_field_index = record._fieldLookup['submission'];
        const approval_field_index = record._fieldLookup['approval'];

        var current_application = null;

        // Check if application already exists
        this.applications.forEach(application => {
          if(application.identity.low === record.getField('application').identity.low){
            current_application = application

          }
        })

        // If the application does not exist, create it
        if(!current_application) {
          current_application = record.getField('application');
          this.applications.push(current_application)

          // save applicant
          current_application.applicant = record.getField('applicant');
        }

        if(!current_application.submissions) current_application.submissions = [];

        // Add the info of the submission
        current_application.submissions.push({
          recipient: record.getField('recipient'),
          approval: record.getField('approval'),
        })

      })

    },



  }
};
