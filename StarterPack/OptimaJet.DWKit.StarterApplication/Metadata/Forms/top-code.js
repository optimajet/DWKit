{
  setCurrentEmployee: function (args){
    var userId = args.component.state.data.currentEmployee;
    var state = DWKitStore.getState();
    return {
        app:{
            impersonatedUserId: userId
        },
        router: {
            refresh: "refresh"
        }
    };
  }
}