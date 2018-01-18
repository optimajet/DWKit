{
//  validate: function (args /*{data, originalData, state, component, formName, index, controlRef, eventArgs, isChild}*/){
//    var errors = {};
//    //TODO: Insert your code for validation this form
//    if(data.name == undefined || data.name == ''){
//      errors.name = 'This field is requered!';
//    }
//    if(errors.name){
//      throw {
//          level: 1,
//          message: 'Check errors on the form!',
//          formerrors: errors
//      };
//    }
//    return {};
//  }

    openworkflowdesginer: function (args) {
        var url = "/admin?apanel=workflowinstances&aid=" + args.data.Id;
        return {
            router: {
                redirect: url
            }
        };
    }

}