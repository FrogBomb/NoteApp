/*
    Note: 
    I am using copied code rather than making helper functions
    so that individual tests can be freely mutated
    without having to fit a shared structure.
    (e.g., I can put a print statement in one kind of test that I
    don't want in another, or I can modify data in a specific
    way without worrying about the other tests.)
*/
var Curl = require('node-libcurl').Curl;

function testPost(testData, callback){
    var curl = new Curl();
    var url = 'http://localhost/api/notes';
    var data = testData || '{"body" : "Pick up milk!"}';

    curl.setOpt(Curl.option.URL, url);
    curl.setOpt(Curl.option.POSTFIELDS, data);
    curl.setOpt(Curl.option.HTTPHEADER, ['Accept: application/json']);
//    curl.setOpt(Curl.option.HEADER, true);

    curl.perform();

    curl.on('end', function(statusCode, body) {

        callback(body, ["Test Post", testData]);

        this.close();
    });

    curl.on('error', curl.close.bind(curl));
}

function testGet(callback){
    var curl = new Curl();
    url = 'http://localhost/api/notes';
    
    curl.setOpt(Curl.option.URL, url);
    curl.setOpt(Curl.option.HTTPHEADER, ['Accept: application/json']);
    curl.setOpt(Curl.option.HTTPGET, 1);
//    curl.setOpt(Curl.option.HEADER, true);
    
    curl.perform();
    
    curl.on('end', function(statusCode, body) {
        
        callback(body, "Test Get");
        
        this.close();
    });

    curl.on('error', curl.close.bind(curl));
    
}
function testGetId(id, callback){
    var curl = new Curl();
    url = 'http://localhost/api/notes/' + id;
    
    curl.setOpt(Curl.option.URL, url);
    curl.setOpt(Curl.option.HTTPHEADER, ['Accept: application/json']);
    curl.setOpt(Curl.option.HTTPGET, 1);
//    curl.setOpt(Curl.option.HEADER, true);
    
    curl.on('end', function(statusCode, body) {

        callback(body, ["Test Get Id", id]);
        
        this.close();
    });

    curl.on('error', curl.close.bind(curl));
    
    curl.perform();
    
   
}

function testDefaultQuery(query, callback){
    testCustomQuery(query, callback);
}

function testCustomQuery(query, callback, wordMatch, caseSensitive){
    var curl = new Curl();
    url = 'http://localhost/api/notes?query=' + query;
    
    if(wordMatch !== undefined){
        url += '&word_match=' + wordMatch;
    }
    if(caseSensitive !== undefined){
        url += '&case_sensitive=' + caseSensitive;
    }
    
    curl.setOpt(Curl.option.URL, url);
    curl.setOpt(Curl.option.HTTPHEADER, ['Accept: application/json']);
    curl.setOpt(Curl.option.HTTPGET, 1);
//    curl.setOpt(Curl.option.HEADER, true);
    
    curl.perform();
    
    curl.on('end', function(statusCode, body) {

        callback(body, ["Test Query", query, wordMatch, caseSensitive]);
        
        this.close();
    });

    curl.on('error', curl.close.bind(curl));
}

function main(){
    var expectedNoteData = [{"id":1, "body" : "Ask Larry about the TPS reports."},
                        {"id":2, "body" : "Pick up milk"}];
    
    var testsPassed = 0;
    var testsTotal = 0;
    
    //TODO: improve testing for unsorted data and for unpredictable object structure
    //      by iterating through keys.
    assertRecievedData = function(expectedResult){
                                return function(body, params){
                                    testsTotal += 1;
                                    if(body === JSON.stringify(expectedResult)){
                                        testsPassed += 1;
                                    }
                                    else{
                                        console.log("Test "+testsTotal+" failed!");
                                        console.log("Params: " + params);
                                        console.log("Recieved: \n" + body);
                                        console.log("Expected: \n" + JSON.stringify(expectedResult));
                                    }
                                    
                                    console.log("Current Test Status: " + testsPassed + "/" + testsTotal);
                                }
                            }
    
    
    
    var doGetTests = function(){
        //Test get all notes
        testGet(assertRecievedData(expectedNoteData));

        //Test get note by id
        testGetId('1', assertRecievedData(expectedNoteData[0]));
        testGetId('2', assertRecievedData(expectedNoteData[1]));
        testGetId('3', assertRecievedData({}));

        //Test query: default
        testDefaultQuery('Ask', assertRecievedData([expectedNoteData[0]]));
        testDefaultQuery('miLk', assertRecievedData([expectedNoteData[1]]));
        testDefaultQuery('i', assertRecievedData([expectedNoteData[1]]));
        testDefaultQuery('Milk', assertRecievedData([expectedNoteData[1]]));
        testDefaultQuery('k', assertRecievedData(expectedNoteData));
        testDefaultQuery('TPS', assertRecievedData([expectedNoteData[0]]));

        //Test query: word match
        testCustomQuery('Ask', assertRecievedData([expectedNoteData[0]]), 'true');
        testCustomQuery('miLk', assertRecievedData([expectedNoteData[1]]), 'true');
        testCustomQuery('i', assertRecievedData([]), 'true');
        testCustomQuery('Milk', assertRecievedData([expectedNoteData[1]]), 'true');
        testCustomQuery('k', assertRecievedData([]), 'true');
        testCustomQuery('TPS', assertRecievedData([expectedNoteData[0]]), 'true');

        //Test query: no word match, case_sensitive
        testCustomQuery('Ask', assertRecievedData([expectedNoteData[0]]), 'false', 'true');
        testCustomQuery('miLk', assertRecievedData([]), 'false', 'true');
        testCustomQuery('i', assertRecievedData([expectedNoteData[1]]), 'false', 'true');
        testCustomQuery('Milk', assertRecievedData([]), 'false', 'true');
        testCustomQuery('k', assertRecievedData(expectedNoteData), 'false', 'true');
        testCustomQuery('TPS', assertRecievedData([expectedNoteData[0]]), 'false', 'true');

        //Test query: word match, case_sensitive
        testCustomQuery('Ask', assertRecievedData([expectedNoteData[0]]), 'true', 'true');
        testCustomQuery('miLk', assertRecievedData([]), 'true', 'true');
        testCustomQuery('i', assertRecievedData([]), 'true', 'true');
        testCustomQuery('Milk', assertRecievedData([]), 'true', 'true');
        testCustomQuery('k', assertRecievedData([]), 'true', 'true');
        testCustomQuery('TPS', assertRecievedData([expectedNoteData[0]]), 'true', 'true');
    };
    
    
    //TODO: loop tests as a part of a priority queue rather than through nested callbacks.
    
    //Test post note
    testPost('{"body" : "Ask Larry about the TPS reports."}', function(x){
            assertRecievedData(expectedNoteData[0])(x);
            testPost('{"body" : "Pick up milk"}', function(x){
                assertRecievedData(expectedNoteData[1])(x);
                doGetTests();
            });
    });
     
    
    
}

main();