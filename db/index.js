var db = function(config) {
    var MongoClient = require('mongodb').MongoClient;

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }

    var uri = config.uri
    var base = config.base
    var options = config.options

    // Créer la base
    this.create_db = function () {
        MongoClient.connect(uri + base, function(err, client) {
            if (err) throw err;
            
            console.log("Database created!");
            
            client.close();
         });
    }

    // Créer la liste des collections en param
    this.create_collections = function (collections) {
        MongoClient.connect(uri + base + options, function(err, client) {
            if (err) throw err;

            var db = client.db(base);

            collections.forEach(c => {
                db.createCollection(c, function(err, res) {
                    if (err) throw err;
    
                    console.log("Collection " + c + " created!");
                });
            });

            client.close();
        }); 
    }
    
    this.insert = function (collection, doc) {
        MongoClient.connect(uri + base + options, function(err, client) {
            var db = client.db(base)
            
            const c = db.collection(collection);
            
            c.insert(doc, function (err, res) {
                if (err) throw err;

                client.close()
            })
        });
    }

    this.find = function (collection, carac, cb) {
        MongoClient.connect(uri + base + options, function(err, client) {
            var db = client.db(base)
            const c = db.collection(collection)
            
            c.find(carac).toArray(function (err, res) {
                if (err) throw err

                client.close()
                cb(res)
            })
        });
        
    }

    /* db module */
    return this
}


module.exports = db;
