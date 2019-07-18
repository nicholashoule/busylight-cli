// This is my busylight-cli script
// Version: 0.0.3
// Author: Nicholas Houle
//
// Requires:
//    npm install busylight
//    npm install ps-node
//
// Function getDate() ... update the date
function getDate() {
  now = new Date();
  //console.log('Time: %s', now.toUTCString());
  return now
}

// Function intervalFunc() ... keepalive hack 
// bl.light("red") doesn't stay on 
// Keep alive isn't working so here we are
function intervalFunc() {
  now = getDate();
  console.log('Time: %s', now.toUTCString());
}

// Function pidTracker() ... ensure one process is running
function pidTracker() {
  // pid lookup vars
  var count = 0;
  var pidTracker = [];
  // A simple pid lookup
  ps.lookup({
    command: 'node',
    psargs: 'aux'
    }, function(err, resultList ) {
    if (err) {
      throw new Error( err );
    }

    console.log();
    //Loop through the object
    resultList.forEach(function( process ){

      if( process ){
        count++;
        pidTracker.push(String(process.pid))
        //Debug: console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
      }

      // Kill the process by pid
      // Pass signal SIGKILL for killing the process without allowing it to clean up
      if( process && count > 1 ){
          ps.kill( String(pidTracker[0]), 'SIGKILL', function( err ) {
            if (err) {
              throw new Error( err );
            } else {
              //Debug: console.log('Process %s has been killed.', String(pidTracker[0]) );
              bl.off();
              console.log("Found BusyLight process to stop.");
              Main();
            }
          });
        }
    });
    //console.log('Count: %s', count );
  });
}

// Function getState() ... change BusyLight state
function getState(args) {
  // Check for 'off'
  if(args && String(args) === 'off' || String(args) === 'stop') {
    setTimeout(function(){
        // Exit BusyLight (Delayed)
        now = getDate();
        //bl.off();
        console.log('Time: %s', now.toUTCString());
        console.log("Shutting down BusyLight.");
        process.exit(Main);
    }, 5);
  }

  // Check for 'work' = busy, but interuptable
  if (args && String(args) === 'work') {
    now = getDate();
    //bl.off()
    bl.blink(['white', '#ff4500'], 800);
    console.log("Status: work.");
    console.log('Time: %s', now.toUTCString());
  } else if (args && String(args) === 'busy') {
    // Check for 'red' = busy
    // Keepalive isn't working so we need setInterval
    now = getDate();
    bl.light("red")
    console.log("Status: busy.");
    console.log('Time: %s', now.toUTCString());
    setInterval(intervalFunc, 600000); // 10min, keepalive hack
  } else if (args && String(args) === 'away') {
    // Check for 'yellow' = away
    now = getDate();
    //bl.off();
    bl.pulse("yellow");
    console.log("Status: away.")
    console.log('Time: %s', now.toUTCString());
  } else if (args && String(args) === 'police') {
    // Check for 'police' = Bad Boys! Bad Boys! Whatcha gonna do--
    now = getDate();
    //bl.off();
    bl.ring('Buzz').blink(['red', 'white', 'blue', 'white'], 200);
    console.log("Status: police.")
    console.log('Time: %s', now.toUTCString());
  } else if (args && String(args) === '' || String(args) === 'free') {
      color = 'blue';

      if(color) {
        bl.light(color);
      } else { bl.light('white'); }

      console.log("Status: free.")
      setInterval(intervalFunc, 600000); // 10min, keepalive hack
  }
}

// Function Main()
// Description:
//    Main function for the script
//
//    Params:
//      off, work, busy, away, police
//
var Main = async() => {

  // Check for existing BusyLight process
  await pidTracker()

  // Get args passed to script
  // args[2] will be are starting point since
  // args[0] and args[1] are reserved
  var args = process.argv.slice(2)
  var now = getDate();

  // Defaults
  bl.defaults({
    keepalive: true,      // If the busylight is not kept alive it will turn off after 30 seconds
    color: 'white',       // The default color to use for light, blink and pulse
    duration: 30 * 1000,  // The duration for a blink or pulse sequence
    rate: 300,            // The rate at which to blink or pulse
    degamma: true,        // Fix rgb colors to present a better light
    tone: 'OpenOffice',   // Default ring tone
    volume: 4             // Default volume
  });

  getState(args);

};
// Required for process lookup, and busylight
var ps = require('ps-node');
var bl = require('busylight').get();
// Let the user know the program has started
// Vendor: 27bb
// Product: 3bcd
// ModelName: BusyLight UC Alpha
console.log("Kuando Busylight\n");
Main();