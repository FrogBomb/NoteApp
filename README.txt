To start server:
    Make sure node.js is installed. Then, run:
        >>> npm i
    This will install the npm packages needed to run and test the server.
    Then, to start the server, run:
        >>> npm start
        
    To run tests, run:
        >>> npm test
    If you are running tests, the tests currently assume the database
    is empty before starting. Please restart the server and use an empty
    database before running tests.
    Currently, there is are no tests for database integrety. 
    
    Please check the config.json file to assure that if you are using an
    external database, the current database location is 
    under the "MONGO_URI" key, and the "USE_DB" key is set to true.
    
API:
    POST /api/notes
        Post a note to the server. Will return the note object.
        
    GET /api/notes
        Returns all notes
        
    GET /api/notes/:id
        Returns the note with the given ID number
        
    GET /api/notes/?query={qstr}
        Returns all notes containing the string qstr.
        
        OPTIONS:
            word_match : true | false (default)
                If true, will only return notes that have exact word matches.
                
            case_sensitive : true | false (default)
                If true, queries will be case sensitive.