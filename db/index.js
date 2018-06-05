var db = function(config) {
    var fs = require('fs');
    var sqlite3 = require('sqlite3').verbose();
    var root_folder = './db'

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }

    // init sqlite db        
    var dbFile = root_folder + '/' + config.dbFile;
    var sqlite3DB = new sqlite3.Database(dbFile);
    
    this.exists = function () {
        return fs.existsSync(dbFile)
    }

    this._query_from_file = function (filename) {
        fs.readFile(filename, 'utf8', function (err, query) {
            
            if (err) { console.log(err); process.exit(1); }
            
            sqlite3DB.serialize(function(){
                sqlite3DB.run(query);
            });
        });            
    }

    this.create_tables = function () {
        this._query_from_file(root_folder + '/CREATE_PLAYER.sql');
        //this._query_from_file('./CREATE_.sql');
    }
    

    this.insert_player = function (player) {
        sqlite3DB.serialize(function(){
            sqlite3DB.serialize(function() {
                sqlite3DB.run('INSERT INTO Player () VALUES ("' + player.name + '", , )')
            })
        })
    }

    /* db module */
    return this
}


module.exports = db;
