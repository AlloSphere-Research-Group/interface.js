let Panel = require( './panel.js' ),    
    Communication

Communication = {
  Socket : null,

  init() {
    this.Socket = new WebSocket( this.getServerAddress() )
    this.Socket.onmessage = this.onmessage
  },

  getServerAddress() {
    let expr, socketIPAndPort, socketString, ip, port

    expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/

    socketIPAndPort = expr.exec( window.location.toString() )[ 0 ].split( ':' )
    ip = socketIPAndPort[ 0 ]
    port = parseInt( socketIPAndPort[ 1 ] )

    socketString = `ws://${ip}:${port}`

    return socketString
  },

  onmessage( e ) {
    let data = JSON.parse( e.data )
    if( data.type === 'osc' ) {
      Communication.OSC._receive( e.data );
    }else {
      if( Communication.Socket.receive ) {
        Communication.Socket.receive( data.address, data.parameters  )
      }
    }
  },

  OSC : {
    callbacks: {},
    onmessage: null,

    send( address, parameters ) {
      if( Communication.Socket.readyState === 1 ) {
        if( typeof address === 'string' ) {
          let msg = {
            type : "osc",
            address,
            'parameters': Array.isArray( parameters ) ? parameters : [ parameters ],
          }

          Communication.Socket.send( JSON.stringify( msg ) )
        }else{
          throw Error( 'Invalid osc message:', arguments )   
        }
      }else{
        throw Error( 'Socket is not yet connected; cannot send OSC messsages.' )
      }

    },

    receive( data ) {
      let msg = JSON.parse( data )

      if( msg.address in this.callbacks ) {
        this.callbacks[ msg.address ]( msg.parameters )
      }else{
        for( let panel of Panel.panels ) {
          for( let child of panel ) {
            //console.log( "CHECK", child.key, msg.address )
            if( child.key === msg.address ) {
              //console.log( child.key, msg.parameters )
              child.setValue.apply( child, msg.parameters )
              return
            }
          }
        }

        if( this.onmessage !== null ) { 
          this.receive( msg.address, msg.typetags, msg.parameters )
        }
      }
    }
  }

}

module.exports = Communication
