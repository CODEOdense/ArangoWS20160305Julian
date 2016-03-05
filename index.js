"use strict";

// Detailed documentation for this file can be found here:
// https://docs.arangodb.com/Foxx/Develop/Controller.html

// Load the Foxx library.
var Foxx = require("org/arangodb/foxx");

// Create a new Controller. The piece where we
// can create endpoints on.
var controller = new Foxx.Controller(applicationContext);

// Load the joi library.
// This is used for input validation.
// See: https://github.com/hapijs/joi/blob/v8.0.4/API.md for complete documentation
var joi = require("joi");

// Load a reference to the database object.
// This is used to access collections and
// execute queries.
var db = require("org/arangodb").db;

// Load an unauthorized error definition.
// Should be thrown if the user is not allowed to use a certain function
var UnauthorizedError = require("http-errors").Unauthorized;


controller.activateSessions({
  sessionStorageApp: '/_system/sessions',
  cookieName: 'sid',
  type: 'cookie'
});

// Now let us define our first route.
// The Java-Doc style comments are used to
// generate the documentation as shown in the web interface.
// First line is a short description, followed by arbitrary
// many lines long description.
// Next we define a "GET" route `controller.get` on
// the path `/hello/:name` where `:name` is a path parameter.
// After the route it is defined that `name` is a string, required
// and it is given a description.

/** Register user
 * 
 * What it sez
 * 
 */
controller.post("/register", function( req, res) {
    
    
    var x = req.params("newuser");
    db.Profiles.save({
        name: x.username,
        _key: x.username,
        credits: 500
    });
    
    //WAT
    
    res.json({result: "done!"});
}).bodyParam("newuser", 
    joi.object().keys({
        username: joi.string().required().description("username of the user to register"), 
        password: joi.string().required().description("password of the user to register")
    }));
    
/** Login user
 * 
 * What it sez
 * 
 */
controller.post("/login", function( req, res) {
    var x = req.params("newuser");
    
    let user = db.Profiles.firstExample({name: x.username});
    
    res.cookie("user", user.name);
    res.cookie("credits", user.credits);
    
    res.json(user);
}).bodyParam("newuser", 
    joi.object().keys({
        username: joi.string().required().description("username of the user to register"), 
        password: joi.string().required().description("password of the user to register")
    }));
    
/** Add product * 
 * What it sez
 * 
 */
controller.post("/product", function( req, res) {
    var x = req.params("prod");
    x.seller = req.cookie("user");
    
    res.json(db.Products.save(x));
}).bodyParam("prod",
    joi.object().keys({
        title: joi.string().required().description("username of the user to register"), 
        description: joi.string().required().description("password of the user to register"),
        price: joi.number().required()
    }));

/** Kindly greet a user
 *
 * This endpoint allows to greet a
 * user by taking the user name as a path parameter
 * and returing a simple JSON string.
 * No database interaction takes place in this route.
 */
controller.get("/hello/:name", function(req, res) {

  // We access all parameters by their name
  // NOTE: :var in route, pathParam("var", joi...) and params("var")
  // need to have identical names.
  var name = req.params("name");

  // We send back a JSON document, which simply is a string.
  // The content type is set to JSON and the body of the
  // result will contain the parsed object.
  res.json("Hello " + name + "!");
}).pathParam("name", joi.string().required().description("The name of the user to greet"));

// Now let us define a second route.
// This time we use an alternative way of documenting the route.
// All documentation is written below the function and in function calls.
// Both ways are identical so you can pick the one you prefer.
// This time we execute an AQL query with a user input in the body.
// For this we define a "POST" route `controller.post` on the path
// `/query`.

controller.post("/query", function(req, res) {

  // Read the user input, which is actually the request body. But it is accessed
  // identical to all other types of parameters.
  var bindParams = req.params("parameters");

  // We execute an AQL query in the database.
  // We use bind parameter for min and max as they are user defined.
  // This prohibits AQL injection like @max = "(FOR p IN Producuts REMOVE p IN Products RETURN 1)
  var cursor = db._query("FOR p IN Products FILTER p.price < @max && p.price > @min RETURN p", bindParams);
  // This function returns a cursor. We can either walk through it iteratively or just return the entire result:
  res.json(cursor.toArray());
}).bodyParam("parameters", joi.object({
  // The user has to give a minimum price, which is positive and a number
  min: joi.number().positive().required(),
  // The user has to give a maximum price, which is positive and a number and it has to be greater than min
  max: joi.number().positive().greater(joi.ref("min")).required()
}).required().description("Define the minimal and the maximal price of returned products."))
.summary("Find a range of Products") // This is the short description of this route.
.notes([ // This is the long version of the documentation. It is an array of strings.
  "In this route we execute an AQL statement",
  "which selects the all products within a",
  "user defined price range."
]);



/// YOUR CODE GOES HERE

/// THIS PART IS ONLY USED TO CLEAN UP DATA GENERATED BY TODO-List test. Do not modify

controller.post("/test/clear", function (req, res) {
  db._executeTransaction({
    collections: {
      write: ["Products", "Profiles"]
    },
    action: function () {
      try {
        db._collection("Profiles").remove("UnitTestAlice");
      } catch (e) {
      }
      try {
        db._collection("Profiles").remove("UnitTestBob");
      } catch (e) {
      }
      try {
        db._collection("Products").removeByExample({seller: "UnitTestAlice"});
      } catch (e) {
      }
      try {
        db._collection("Products").removeByExample({title: "UnitTest"});
      } catch (e) {
      }
    }
  });
  res.json({success: true});
});


