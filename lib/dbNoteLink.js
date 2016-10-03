var mongoose = require('mongoose');
var config = require('../config.json');
var mongoURI = config['MONGO_URI'];
var mongoOps = config['MONGO_OPTIONS'];
var useDB = config['USE_DB'];

if(useDB){
    function dbNoteLink(noteHandler){
        //Currently, the database is acting as a backup for local
        //storage. 
        
        //Don't allow adding notes until the database has updated local data!
        //We will delete this method when we can again, and the object
        //will use the addNote method in the prototype chain.
        NoteHandler.addNote = function(){return "Could not add note. Try again later."};
        
        
        var db = mongoose.connection;

        db.on('error', console.error.bind(console, 'connection error:'));

        db.once('open', function(){
            
            var noteSchema = new mongoose.Schema({
                id      : Number,
                body    : String
            });
            var noteModel = mongoose.model('note', noteSchema);
            
            //Get Notes from the Database
                //Currently, since the server is not using callbacks
                //to validate writes and reads, the server will just
                //act as a data redundant backup. 
            
            delete noteHandler.addNote; //Delete so it uses the prototype.
            noteModel.find(function(err, docs){
                if(err){console.error('database error:');}
                else{
                    //sort by id
                    docs.sort(function(a, b){return a.get('id')-b.get('id');});
                    
                    //Then, add to the note Handler in order. 
                    docs.forEach(function(doc){
                        noteHandler.addNote(doc.get('body'),doc.get('id'));
                    });
                }
            });
            
            //Modify noteHandler's bahavior when adding notes
            //so that the database is also updated.
            noteHandler.addNote = function(body, id){
                var ret = noteHandler.__proto__.addNote(body, id);
                noteModel.create({ id: ret.id, body: ret.body }, function(err, doc){
                    if(err){console.log(err);} //TODO: better error handling
                });
            }
        });
        
        mongoose.connect(mongoURI, mongoOps);

    }
}
else{
    //The returned function does nothing
    function dbNoteLink(){return};
}
module.exports = dbNoteLink;