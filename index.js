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
    CkAuth.debug = debug || false;
    CkAuth.url = url;
    CkAuth.userNameField = options.userNameField || "username";
    CkAuth.passwordField = options.passwordField || "password";
};

CkAuth.login = function ( req, res, next ) {
    if(CkAuth.debug){
        console.log(req.body);
        console.log(CkAuth.debug, CkAuth.url, CkAuth.userNameField, CkAuth.passwordField);
    }
    const data = {
        email : req.body[ CkAuth.userNameField ],
        password : req.body[ CkAuth.passwordField ]
    };
    needle.post ( CkAuth.url + '/api/v1/auth/login', data, {}, function ( err, resp ) {
        if ( err ) next ( err );
        if(CkAuth.debug) console.log(err, resp.body);
        if ( resp.body.success && resp.body.user ) {
            req.auth = { user : resp.body.user, token : resp.body.token };
            req.body.auth = { user : resp.body.user, token : resp.body.token };
            next ();
        } else {
            next ( new Error ( "No Authentication information provided" ) );
        }
    } );
};

CkAuth.verify = function ( req, res, next ) {
    const token = req.header('authorization');
    const data = {
        token : token.replace("JWT ", "")
    };
    needle.post ( CkAuth.url + '/api/v1/auth/validate', data, {}, function ( err, resp ) {
        if ( err ) next ( err );
        if ( resp.body.success && resp.body.user ) {
            req.auth = { user : resp.body.user, token : resp.body.token };
            req.body.auth = { user : resp.body.user, token : resp.body.token };
            // res.body.token = resp.body.token;
            next ();
        } else {
            next ( new Error ( "No Authentication information provided" ) );
        }
    } );
};

CkAuth.register = function ( req, res, next ) {
    const data = {
        user: {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            password : req.body.password
        }
    };
    needle.post(CkAuth.url + '/api/v1/users', data, {json: true}, function (err, resp) {
        if ( err ) next ( err );
        if ( resp.body.success && resp.body.user ) {
            req.user = resp.body.user;
            req.body.user = resp.body.user;
            // res.body.token = resp.body.token;
            next ();
        } else {
            next ( new Error ( "No User information provided" ) );
        }
    });
};

module.exports = CkAuth;