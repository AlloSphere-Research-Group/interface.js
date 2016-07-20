'use strict'

let fs                = require( 'fs' ),
    ws                = require( 'ws' ),
    url               = require( 'url' ),
    server            = require( 'http' ).createServer(),
    connect           = require( 'connect' ),
    directory         = require( 'serve-index' ),
    serve_static      = require( 'serve-static' ),
    oscMin            = require( 'osc-min' ),
    parseArgs         = require( 'minimist' ),
    udp               = require( 'dgram' ),
    app               = connect(),
    midi              = null,   
    args              = parseArgs( process.argv.slice(2) ),
    webServerPort     = args.serverPort || 8080,
    oscOutPort        = args.oscOutPort || webServerPort + 1,
    oscInPort         = args.oscInPort  || webServerPort + 2,
    outputIPAddress   = args.outputIPAddress || null,
    appendID          = args.appendID   || false,
    clients_in        = new ws.Server({ server:server }),
    clients           = {},
    root              = args.interfaceDirectory || __dirname + '/../',
    midiInit          = false,
    interfaceJS       = null,
    serveInterfaceJS  = null,
    midiOut           = null,
    midiNumbers       = {
      "noteon"        : 0x90,
      "noteoff"       : 0x80,
      "cc"            : 0xB0,
      "programchange" : 0xC0,
    },
    osc,
    idNumber = 0;
    
if( args.useMIDI === true ) midi = require( 'midi' )

/* 
 * Start web server running
*/

app
  .use( directory( root, { hidden:false,icons:true } ) )
  .use( serve_static( root ) )

server.on( 'request', app )
server.listen( webServerPort )

/*
 * Create OSC input port for bi-directional communication
*/

osc = udp.createSocket( 'udp4', function( _msg, rinfo ) {
  let msg = oscMin.fromBuffer( _msg )
    
  let firstPath = msg.address.split('/')[1],
      isNumber  = ! isNaN( firstPath ),
      tt = '',
      msgArgs = []
  
  for( let arg of msg.args ) {
    tt += arg.type[ 0 ]
    msgArgs.push( arg.value )
  }
  
  if( ! isNumber ) {
    for( let key in clients ) {
      try{
        clients[ key ].send( JSON.stringify({ type:'osc', address:msg.address, typetags: tt, parameters:msgArgs }) )
      } catch (error){}
    }
  }else{
    clients[ firstPath ].send( JSON.stringify({ type:'osc', address:'/'+msg.address.split('/')[2], typetags: tt, parameters:msgArgs }) )
  }
})

osc.bind( oscInPort )

/*
 * Define WebSocket interaction.
*/

clients_in.on( 'connection', function ( socket ) {
  let clientIP = socket.upgradeReq.headers.origin.split( ':' )[ 1 ].split( '//' )[ 1 ]
  
  console.log( 'client connected:', clientIP )
  
  clients[ idNumber ] = socket
  socket.ip = clientIP
  socket.idNumber = idNumber++
  
  socket.on( 'message', function( obj ) {
    let msg = JSON.parse( obj );

    if(msg.type === 'osc') {
      if( args.appendID ) {  // append client id
        msg.parameters.push( socket.idNumber )
      }
      let buf = oscMin.toBuffer({
        address: msg.address,
        args: msg.parameters
      })
      
      osc.send( buf, 0, buf.length, oscOutPort, outputIPAddress || 'localhost')
    }else if( msg.type === 'midi' && midi !== null ) {
      if( !midiInit ) {
        midiOutput = new midi.output();
        midiOutput.openVirtualPort( 'Interface Output' );
        midiInit = true;
      }

      if(msg.type !== 'programchange') {
        midiOutput.sendMessage([ midiNumbers[ msg.midiType ] + msg.channel, msg.number, Math.round(msg.value) ])
      }else{
        midiOutput.sendMessage([ 0xC0 + msg.channel, msg.number])
      }
    }else if( msg.type === 'socket' ) {
      for( let key in clients ) {
        if( clients[ key ] !== socket ) {
          clients[ key ].send( JSON.stringify({ type:'socket', address:msg.address, parameters:msg.parameters }) )
        }
      }
    }
  })
});
