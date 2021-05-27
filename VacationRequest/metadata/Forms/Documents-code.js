{
  init: function (args){
    if(args.state.app.impersonatedUserId) {
        args.data.impersonatedQuery = "/?impersonatedUserId=" + args.state.app.impersonatedUserId;
    }
    
    var path = args.state.router.location.pathname.split('/');
    var filter = path[path.length - 1];
    var header = "Requests";
    if(filter === "inbox"){
        header += ": Inbox";
    }
    else if(filter === "outbox"){
        header += ": Outbox";
    }
    args.data.header = header;
  }
}