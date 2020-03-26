let RuleEngine = require('json-rules-engine');
let engine = new RuleEngine.Engine();
let event = {
    type: 'young-adult-rocky-mnts',
    params: {
      giftCard: 'amazon',
      value: 50
    }
  };
  let conditions = {
    all: [
      {
        fact: 'age',
        operator: 'greaterThanInclusive',
        value: 18
      }, {
        fact: 'age',
        operator: 'lessThanInclusive',
        value: 25
      },
      {
        any: [
          {
            fact: 'state',
            params: {
              country: 'us'
            },
            operator: 'equal',
            value: 'CO'
          }, {
            fact: 'state',
            params: {
              country: 'us'
            },
            operator: 'equal',
            value: 'UT'
          }
        ]
      }
    ]
  };
  let rule = new RuleEngine.Rule({ conditions, event});
  engine.addRule(rule);
  /*
 * Define the 'state' fact
 */
let stateFact = function(params, almanac) {
    // rule "params" value is passed to the fact
    // 'almanac' can be used to lookup other facts
    // via almanac.factValue()
    return almanac.factValue('zip-code')
      .then(zip => {
        return stateLookupByZip(params.country, zip);
      });
  };
  engine.addFact('state', stateFact);
  
  /*
   * Define the 'age' fact
   */
  let ageFact = function(params, almanac) {
    // facts may return a promise when performing asynchronous operations
    // such as database calls, http requests, etc to gather data
    return almanac.factValue('userId').then((userId) => {
      return getUser(userId);
    }).then((user) => {
      return user.age;
    })
  };
  engine.addFact('age', ageFact);
  
  /*
   * Define the 'zip-code' fact
   */
  let zipCodeFact = function(params, almanac) {
    return almanac.factValue('userId').then((userId) => {
      return getUser(userId);
    }).then((user) => {
      return user.zipCode;
    })
  };
  engine.addFact('zip-code', zipCodeFact);

  // subscribe directly to the 'young-adult' event
engine.on('young-adult-rocky-mnts', (params) => {
    // params: {
    //   giftCard: 'amazon',
    //   value: 50
    // }
  });
  
  // - OR -
  
  // subscribe to any event emitted by the engine
  engine.on('success', function (event, engine) {
      console.log('Success event:\n', event);
    // event: {
    //   type: "young-adult-rocky-mnts",
    //   params: {
    //     giftCard: 'amazon',
    //     value: 50
    //   }
    // }
  });

  // evaluate the rules
//engine.run();

// Optionally, facts known at runtime may be passed to run()
engine.run({ userId: 1 });  // any time a rule condition requires 'userId', '1' will be returned

// run() returns a promise
engine.run({ userId: 4 }).then((results) => {
  console.log('all rules executed; the following events were triggered: ', results.events)
});

function stateLookupByZip(country, zip) {
    var state;
    switch (zip.toString()) {
      case '80014':
        state = 'CO';
        break;
      case '84101':
        state = 'UT';
        break;
      case '90210':
        state = 'CA';
        break;
      default:
        state = 'NY';
    }
  
    return state;
  }
  
  var users = {
    1: {age: 22, zipCode: 80014},
    2: {age: 16, zipCode: 80014},
    3: {age: 35, zipCode: 84101},
    4: {age: 23, zipCode: 90210},
  };
  
  function getUser(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(users[id]);
      }, 500);
    });
  }