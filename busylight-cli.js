// This is my busylight-cli script
// Version: 0.0.3
// Author: Nicholas Houle
//
// Requires:
//    npm install busylight

// Get args passed to script
// args[2] will be are starting point since
// args[0] and args[1] are reserved
var args = process.argv.slice(2)
//Debug: console.log(args);

// Required for process lookup, and busylight
var ps = require('ps-node');
var busylight = require('busylight');

// A simple pid lookup
ps.lookup({
    command: 'node',
    psargs: 'aux'
    }, function(err, resultList ) {
    if (err) {
      throw new Error( err );
    }

    var count = 0;
    var pidTracker = [];
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
            }

          });
        }
    });
    //Debug: Print the process count
    //console.log('Count: %s', count );
});

// Function myMain()
// Description:
//    Main function for the script
//
//    Params:
//      off, work, busy, away, police
//
var myMain = function (){

  // Get the busylight device and with the path
  var bl = busylight.get();
  var now = new Date();

  // Let the user know the program has started
  // Vendor: 27bb
  // Product: 3bcd
  // ModelName: BusyLight UC Alpha
  console.log("Kuando Busylight\n");
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

  // Keep alive isn't working so here we are
  function intervalFunc() {
    now = new Date();
    console.log('Time: %s', now.toUTCString());
  }

  // Check for 'off'
  if(args && String(args) === 'off' || String(args) === 'stop') {
    setTimeout(function(){
        // Exit BusyLight (Delayed)
        now = new Date();
        bl.off();
        console.log("Shutting down BusyLight.");
        console.log('Time: %s', now.toUTCString());
        process.exit(myMain);
    }, 5);
  }

  // Check for 'work' = busy, but interuptable
  if (args && String(args) === 'work') {
    now = new Date();
    bl.off();
    bl.blink(['white', '#ff4500'], 800);
    console.log("Status: work.");
    console.log('Time: %s', now.toUTCString());
  }

  // Check for 'red' = busy
  // Keepalive isn't working so we need setInterval
  if (args && String(args) === 'busy') {
      now = new Date();
      bl.light("red")
      console.log("Status: busy.");
      console.log('Time: %s', now.toUTCString());
      setInterval(intervalFunc, 600000); // 10min, keepalive hack
  }

  // Check for 'yellow' = away
  if (args && String(args) === 'away') {
    now = new Date();
    bl.off();
    bl.pulse("yellow");
    console.log("Status: away.")
    console.log('Time: %s', now.toUTCString());
  }

  // Check for 'police' = Bad Boys! Bad Boys! Whatcha gonna do--
  if (args && String(args) === 'police') {
    now = new Date();
    bl.off();
    bl.ring('Buzz').blink(['red', 'white', 'blue', 'white'], 200);
    console.log("Status: police.")
    console.log('Time: %s', now.toUTCString());
  }

  if(args && String(args) === '') {
    setTimeout(function(color){
      color = 'white';

      if(color)
        bl.pulse(["'"+color+"'"]);
    }, 2000);
  }

};
myMain();
