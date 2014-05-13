// var prJsonSubmitUrl = "http://10.101.117.92:12345/json/submit";  // http://10.101.117.92:12345/test.html
var prwAddrHostAndPortHttps = "http://app2.cbits.northwestern.edu"; // https://ejs.cbits.northwestern.edu:8094 OR https://165.124.171.88 OR https://165.124.171.34:8094
var triggerIdCommonPrefix = 'CopingCard: ';

/**
 * Clears the contents of the specified jQuery element.
 * @param  {[type]} jqElem [description]
 * @return {[type]}        [description]
 */
var clearContents = function(jqElem) {
  if($(jqElem).is("input")) { $(jqElem).val(''); }
  if($(jqElem).is("textarea")) { $(jqElem).text(''); }
};

//===========================================================
// PurpleRobotWarehouse POST code (i.e. database-upload code)
//===========================================================

var s4 = function() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

var guid = function() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
};

/**
 * 
 * @param  {[type]} protoHostAndPortUrlBase 
 * @param  {[type]} userId                  
 * @param  {[type]} postData                
 * @param  {[type]} cbFn                    
 * @param  {[type]} cbData                  
 * @return {[type]}                         
 */

//IN order to use post to pri importer in app:
//postToPRImporter(prwAddrHostAndPortHttps, interventionID:String, "responses",postData:Object);
//postToPRImporter(prwAddrHostAndPortHttps, interventionID:String, "events",postData:Object);

/**
 * POSTs a user-enrollment form to Purple Robot Warehouse, for a specific user.
 * @param  {[type]} protoHostAndPortUrlBase Base URL to which you wish to POST. EX: "https://app2.cbits.northwestern.edu"
 * @param  {[type]} userId                  A user ID string, which will be MD5 hashed - this hash value is the database name. EX (pre-MD5-hashing): "evan.story@northwestern.edu".
 * @param  {[type]} tableName               Table name. EX: "user_responses".
 * @param  {[type]} postData                The data structure to POST. EX: { Q1: "Name?", A1: "John Doe", Q2: "Rate your happiness, 1-10 (high).", A2: 7 }
 * @param  {[type]} cbFn                    Callback function. Takes 4 parameters: cbData, responseData, postData, postUrl
 * @param  {[type]} cbData                  External data to pass to the callback function.
 * @return {[type]}                         No defined return value.
 */


var postArrayToPRImporter = function (protoHostAndPortUrlBase, userId, tableName, postDataArray, cbFn, cbData){

  if (_.isArray(postDataArray)) {

    _.each(postDataArray, function(el){
      postToPRImporter(protoHostAndPortUrlBase, userId, tableName, el, cbFn, cbData);
    })

  };

};

var postToPRImporter = function(protoHostAndPortUrlBase, userId, tableName, postData, cbFn, cbData) {
  var postUrl = protoHostAndPortUrlBase + '/prImporter';

  console.log("Preparing to transmit", postData);
  // generate the PR Importer message to be posted
  var userIdHash = md5(userId);
  var prImporterPostMessage = {
    "json": {
      "Operation": "SubmitProbes",
      "UserHash": userIdHash,
      "Payload": [
        {
          "PROBE": tableName,
          "GUID": guid(),
          "TIMESTAMP": (new Date().getTime() / 1000)
        }
      ],
      "Checksum": ""
    }
  };

  // SINGLE-LEVEL TABLE COLUMN + VALUE APPEND: loop-over the keys in the postData obj and append them to the Payload
  _.each(_.keys(postData), function(k) {
    prImporterPostMessage.json.Payload[0][k] = postData[k];
  });

  // stringify the payload
  prImporterPostMessage.json.Payload = JSON.stringify(prImporterPostMessage.json.Payload);
  
  // package-up the data.
  prImporterPostMessage.json.Checksum = md5(
      prImporterPostMessage.json.UserHash
    + prImporterPostMessage.json.Operation
    + prImporterPostMessage.json.Payload
  );
  var postData = prImporterPostMessage;
  postData.json = JSON.stringify(prImporterPostMessage.json);

  // POST the data to the specified URL.
  console.log('posting the following object to this URL: ' + postUrl);
  console.log(postData);

  $.post(postUrl, postData)
    .done(function(responseData) { 
      // call the user's callback function, if defined
      if (!isNullOrUndefined(cbFn)) {
        cbFn(cbData, responseData, postData, postUrl);
      }
    }
  );
};




// =====================
// Date / Time functions
// =====================

/**
 * Takes an HTML5 date string, and and an HTML5 time string, and returns a JS Date object.
 * @param  {[type]} dateStr [description]
 * @param  {[type]} timeStr [description]
 * @return {[type]}         [description]
 */
var html5DateAndTimeToJSDateTime = function(dateStr, timeStr) {
  var darr = dateStr.split('-');
  var tarr = timeStr.split(':');

  var year = parseInt(darr[0]),
    month = parseInt(darr[1]) - 1,
    day = parseInt(darr[2]),
    hour = parseInt(parseInt(tarr[0], 10)),
    minute = parseInt(parseInt(tarr[1], 10)),
    second = 0
    ;
  var d = new Date(year, month, day, hour, minute, second);
  return d;
};


/**
 * Returns the string representing an ICal-formatted Date string. EX: "20130101T123400" (as seen on: http://tech.cbits.northwestern.edu/purple-robot-javascript-api/)
 * Copy-pasted from PRNM.
 * @return {[type]} [description]
 */
Date.prototype.toICal = function() { var fn = 'Date.prototype.toICal';
  var  yy = this.getFullYear()
      ,MM = this.clone().addMonths(1).getMonth()
      ,dd = this.getDate()
      ,hh = this.getHours()
      ,mm = this.getMinutes()
      ,ss = this.getSeconds();

  var ret = ''
    + yy.toString()
    + ((MM < 10) ? '0' + MM : MM.toString())
    + ((dd < 10) ? '0' + dd : dd.toString())
    + 'T'
    + ((hh < 10) ? '0' + hh : hh.toString())
    + ((mm < 10) ? '0' + mm : mm.toString())
    + ((ss < 10) ? '0' + ss : ss.toString())
    ;
  return ret;
};


/**
 * Converts an ICal-formatted date string into a JS Date object.
 * Copy-pasted from PRNM.
 * @param  {[type]} iCalStr [description]
 * @return {[type]}         [description]
 */
var iCalToDate = function(iCalStr) { var fn = 'iCalToDate';
  var  yy = iCalStr.substr(0,4)
      ,MM = (parseInt(iCalStr.substr(4,2), 10)) - 1
      ,dd = iCalStr.substr(6,2)
      ,hh = iCalStr.substr(9,2)
      ,mm = iCalStr.substr(11,2)
      ,ss = iCalStr.substr(13,2);

  var d = new Date(yy,MM,dd,hh,mm,ss);
  // self.debug('iCalStr = ' + iCalStr + '; d = ' + d, fn);
  return d;
};



// =================
// Utility functions
// =================
 
var isNullOrUndefined = function(v) { var fn = 'isNullOrUndefined';
  // if(v == '"') { self.debug('v is a double-quote!', fn); return false; }
  return (v == null || v == undefined || v == 'null');
};

var isStringGt0Len = function(s) { var fn = 'isString';
  var ret = !self.isNullOrUndefined(s) && _.isString(s) && s.length > 0;
  self.debug('s = ' + s + '; ret = ' + ret, fn);
  return ret;
};


/**
 * Returns a single-quoted string representing a set of values in an array.
 * Copy-pasted from PRNM.
 * @param  {[type]} paramArray [description]
 * @return {[type]}            [description]
 */
var getQuotedAndDelimitedStr = function(paramArray, delim, quoteChar, doNotQuoteTokens) { var fn = 'getQuotedAndDelimitedStr';
  // self.log('entered and exiting, with paramArray = ' + paramArray,fn);
  var qc = self.isNullOrUndefined(quoteChar) ? '\'' : quoteChar;
  if(self.isNullOrUndefined(paramArray) || paramArray.length == 0) { return ''; }
  return _.reduce(_.map(paramArray, function(param) { 
      return !self.isNullOrUndefined(doNotQuoteTokens) && _.isArray(doNotQuoteTokens) && _.contains(doNotQuoteTokens, param)
        ? param
        : qc + param + qc;
    }),
    function(memo, val) {
      return paramArray.length == 1 ? val : memo + delim + val;
  });
};