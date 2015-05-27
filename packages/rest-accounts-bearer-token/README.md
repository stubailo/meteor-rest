# simple:rest-accounts-bearer-token

Authorize a `Meteor.user` using the standard bearer token `Authorization` 
header. Sets the `request.userId` to the ID of the authorized user, so it can be 
accessed in later middleware. 