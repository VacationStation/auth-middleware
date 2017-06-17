/**
 * Created by christiankalig on 17.06.17.
 */

const needle = require ( 'needle' );

let CkAuth = {
    url : "",
    userNameField : "",
    passwordField : ""
};

CkAuth.init = function ( url, options, debug ) {
    this.debug = debug || false;
    this.url = url;
    this.userNameField = options.userNameField || "username";
    this.passwordField = options.passwordField || "password";
};

CkAuth.login = function ( req, res, next ) {
        console.log(req.body);
        console.log(this.debug, this.url, this.userNameField, this.passwordField);

    const data = {
        email : req.body[ this.userNameField ],
        password : req.body[ this.passwordField ]
    };
    needle.post ( this.url + '/api/v1/auth/login', data, {}, function ( err, resp ) {
        if ( err ) next ( err );
        console.log(err, resp);
        if ( resp.body.user && resp.body.token ) {
            req.auth = { user : resp.body.user, token : resp.body.token };
            next ();
        } else {
            next ( new Error ( "No Authentication information provided" ) );
        }
    } );
};

CkAuth.verify = function ( req, res, next ) {
    const data = {
        token : req.body.token
    };
    needle.post ( this.url + '/api/v1/auth/verify', data, {}, function ( err, resp ) {
        if ( err ) next ( err );
        if ( resp.body.user && resp.body.token ) {
            req.auth = { user : resp.body.user, token : resp.body.token };
            res.body.token = resp.body.token;
            next ();
        } else {
            next ( new Error ( "No Authentication information provided" ) );
        }
    } );
};

module.exports = CkAuth;