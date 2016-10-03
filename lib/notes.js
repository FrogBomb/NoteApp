dbNoteLink = require('dbNoteLink.js');

function Note(id, body){
    /*
    Note class 
    
    Class for generating notes and 
        providing helper functions for individual notes.
    */
    this["id"] = id;
    this["body"] = body;
}

Note.prototype = Object.create({
    "contains":function(qStr, asLower){
        /*
        Note.contains: str -> bool
        Finds if the note contains the exact string qStr.
        */
        if(asLower){
            return this["body"].toLocaleLowerCase().indexOf(qStr) != -1;
        }
        else{
            return this["body"].indexOf(qStr) != -1;
        }
    }
});

function NoteHandler(){
    /*
    NoteHandler class
    
    Helper class for storing, building, and accessing notes locally
    
    NoteHandler.notes: [Note]
        Array of all the currently stored notes.
    */
    this._nxtId = 1; //Id of the next note to be saved. 
                            //Keeping this separate for potential later changes
    
    this.notes = []; //Current notes. note id = index + 1. 
}
NoteHandler.prototype = Object.create({
    "addNote": function(body, id){
        /*
        NoteHandler.addNote: str -> Note | undefined
        NoteHandler.addNote: str, int -> Note | undefined
        
        Adds a note with the given text body, and returns the note object.
        If body is falsy, return undefined.
        
        (optional)
        If id is larger than all existing ids, will write the note as that id.
        Otherwise, will write as the next id from the largest id.
        */
        if(id>this._nxtId){
            this._nxtId = id;
        }
        if(!body){return;}
        
        var retNote = new Note(this._nxtId, body);
        this.notes.push(retNote);
        this._nxtId += 1; 
        return retNote;
    },
    "query": function(qStr, caseSensitive){
        /*
        NoteHandler.query: str -> [Note]
        
        Returns all notes that contain the string qStr as an array.
        */
        var filterFunc;
        if(caseSensitive){
            filterFunc = function(elem){
                return elem.contains(qStr);
            };
        }
        else{
            var lcqStr = qStr.toLocaleLowerCase();
            filterFunc = function(elem){
                return elem.contains(lcqStr, true);
            };
        }
        return this.notes.filter(filterFunc);
    },
    "getId": function(id){
        /*
        NoteHandler.getId: int -> Note|undefined
        
        Returns the note with the given id. If there is no note with that id, 
        returns undefined. 
        */
        var retNote = this.notes[id-1];
        if(!retNote){ //validation, for potential changes
            retNote = this.notes.find(function(elem){return elem["id"] === id;});
        }
        else if(retNote["id"] != id){ 
            retNote = this.notes.find(function(elem){return elem["id"] === id;});
        }
        return retNote;
    }
});
dbNoteLink(NoteHandler);//Database link for the note handler
module.exports = new NoteHandler();