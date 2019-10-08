{
  sidebarclick: function (args){
    $('.dwkit-sidebar-btn').toggleClass('active');
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