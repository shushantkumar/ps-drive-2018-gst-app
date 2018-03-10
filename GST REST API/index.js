'use strict';

const Hapi=require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
// joi for field validation
const Joi = require('joi');
const Pack = require('./package');
var mysql = require('mysql'); 
const Relish = require('relish')({});
let rsp;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "gstbilling"
  });

function retFunc(values){
    if(values){ rsp=values;}
};

function getFunc(){
    return rsp;
}
// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

const options = {
    info: {
            'title': 'GST API Documentation',
            'version': Pack.version,
        }
    };

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], (err) => {
        console.log(err);

    });
    

// Add the route
server.route(
    {
    method:'GET',
    path:'/productget/{product_code}',
    config:{
        handler: function (request, reply) {
            console.log(request.params);
            let product_code = request.params.product_code;
            let final={
            };

            var sql = "select * from product_details where product_code='"+product_code+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                // console.log(result);
                // this.final=result[0];
                return(result);
            }); 

            console.log(something);
            return("something");
        },
        description: 'Get product data',
        notes: 'product Get request',
        tags: ['api'],
        validate: {
            failAction: Relish.failAction,
            params: {
                product_code :Joi.string().required()
            }
        }
    }
});

server.route(
    {
    method:'GET',
    path:'/productget',
    config:{
        handler: function (request, reply) {
            let resp;
            var sql = "select * from product_details";
            con.query(sql,this, function (err, result) {
                if (err) throw err;
                console.log(result);
                console.log(this.rsp);
                retFunc(result);
            }); 
            resp=getFunc();
            console.log(getFunc());
            console.log(resp);
            return(resp);
 
        },
        description: 'Get product data',
        notes: 'product Get request',
        tags: ['api'],
        validate: {
            failAction: Relish.failAction,
            // params: {
            //     product_code :Joi.string().required()
            // }
        }   
    }
});

server.route(
    {
    method:'POST',
    path:'/productpost',
    config: {handler: function(request,reply){
        // console.log(request.params); //params for get
        console.log(request.payload);
        let product_code = request.payload.product_code;
        let product_name = request.payload.product_name;
        let product_price = request.payload.product_price;
        let product_gst = request.payload.product_gst;

            var sql = "INSERT INTO product_details (id,product_code,product_name,product_price,product_gst ) VALUES ('','"+product_code+"','"+product_name+"','"+product_price+"','"+product_gst+"')";
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("1 record inserted");
            });

        return ({success:true,message: "product data stored"});
    },
        description: 'post product request',
        notes:'post  requ',
        tags:['api'],
        validate:{
            failAction: Relish.failAction,
            payload:{
                product_code: Joi.string().required(),
                product_name: Joi.string().required(),
                product_price: Joi.number().required(),
                product_gst: Joi.number().min(0).max(100)

            }
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/productdel/{product_code}',
    handler: function (request, reply) {
    let product_code = request.params.product_code;
    var sql = "DELETE FROM product_details WHERE product_code = '" + product_code +"'";
    con.query(sql,function (err, result, fields) {
       if (err) throw err;
 
       if (result.affectedRows) {
           return(true);
       } else {
           return(false);
       }
    });
    return("Deleted");
    },
    config: {
        description: 'delete product data',
        notes: 'product DELETE request',
        tags: ['api'],
        validate: {
        params: {
            product_code: Joi.string().required()
        }
        }
    }
});

server.route(
    {
    method:'PUT',
    path:'/productput/{product_code}',
    config: {handler: function(request,reply){
        // console.log(request.params); //params for get
        console.log("hey reached");
        console.log(request.payload);
        let product_code = request.params.product_code;
        console.log(product_code);
        let product_name = request.payload.product_name;
        let product_price = request.payload.product_price;
        let product_gst = request.payload.product_gst;
        console.log(product_gst);

            var sql = "update product_details set product_name='"+product_name+"',product_price='"+product_price+"',product_gst='"+product_gst+"' where product_code='"+product_code+"'";
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(result);
              console.log("1 record updated");
            });

        return ({success:true,message: "product data updated"});
    },
        description: 'put product request',
        notes:'put  requ',
        tags:['api'],
        validate:{
            failAction: Relish.failAction,
            params:{
                product_code: Joi.string().required(),
            },
            payload:{
                
                product_name: Joi.string().required(),
                product_price: Joi.number().required(),
                product_gst: Joi.number().min(0).max(100)

            }
        }
    }
});
function newFunction() {
    console.log(rsp);
}

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();