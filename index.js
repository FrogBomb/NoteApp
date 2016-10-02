;(function(){
var express = require('express');
var bodyParser = require('body-parser');
var noteHelper = require('./lib/notes.js');
var PORT = 80;

var app = express();

//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type:"*/*"}));

function findNotesWithWord(wordToFind, findByWord, caseSensitive){
    /*
    Finds the notes with the given word.
    (By default, finds by string match. If findByWord is truthy,
    will return only exact word matches. )
    */
    
    matches = noteHelper.query(wordToFind, caseSensitive);
    if(!caseSensitive){
        wordToFind = wordToFind.toLocaleLowerCase();
    }
    if(findByWord){
        matches = matches.filter(function(elem){
            //Filtering out notes that do not have exact word matches.
            //splitting the string on the word to find.
            
            var body = elem['body'];
            if(!caseSensitive){body = body.toLocaleLowerCase();}
            return body.split(wordToFind)
                .some(function(elem, i, arr){
                    //If the last character of the previous array element
                    //and the first character of the current element are not
                    //letters, then the word is in the note. (since the word
                    //we are looking for will be in the gap between the two!)

                    if(i==0){return false;}//skip the first split.
                    var prev = arr[i-1];
                    return !(isALetter(elem[0]) || isALetter(prev[prev.length-1]));
                });
        });
    }
    return matches;
}

function isALetter(char){
    if(char){
        return char.length == 1 && /[a-zA-Z]/.test(char);
    }
    return false;
}

app.get('/api/notes', function(req, res){
    /*
    Request for all notes, or all notes containing the 
    the word in the 'query' get query. (e.g. ./api/notes?query=api )
    */
    var wordToFind = req.query['query']; //Potential query string
    //optional parameter to find only word matches. Default is false.
    var findByWord = req.query['word_match'] == 'true';
    //optional parameter to find case sensitive. Default is false.
    var caseSensitive = req.query['case_sensitive'] == 'true';
    
    var arrayToSend; //Unstringified array to send
    
    if(wordToFind){
        arrayToSend = findNotesWithWord(wordToFind, findByWord, caseSensitive);
    }
    else{
        arrayToSend = noteHelper.notes;
    }
    
    res.send(JSON.stringify(arrayToSend));
});

app.get('/api/notes/:id', function(req, res){
    /*
    Request for a single note with the given id.
    
    If there is no note, will send an empty object.
    */
    res.send(JSON.stringify(noteHelper.getId(parseInt(req.params.id)) || {}));
});

app.post('/api/notes', function(req, res){
    /*
    Post a new note
    */
    if (!req.body){
        res.sendStatus(400);
    }
    if (req.accepts('application/json')){
        var ret = JSON.stringify(noteHelper.addNote(req.body['body']));
        res.send(ret);
    }
    else{ //Can't send other formats
        res.sendStatus(406, "Server can only send application/json");
    }
});

app.listen(PORT);
})();