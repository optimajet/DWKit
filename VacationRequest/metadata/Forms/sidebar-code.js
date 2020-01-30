{
  sidebarclick: function (args){
    $('.dwkit-sidebar-container').toggleClass('active');
  },
  
  setCurrentEmployee: function (args){
    var userId = args.component.state.data.currentEmployee;
    var state = DWKitStore.getState();
    
    DWKitApp.API.setCookie("impersonatedUserId", userId);
    
    return {
        app:{
            impersonatedUserId: userId
        },
        router: {
            reload: "reload"
        }
    };
  }
}