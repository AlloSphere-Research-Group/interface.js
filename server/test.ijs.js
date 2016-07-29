var p = Interface.Panel.create(),
    s = Interface.Joystick.create({
      width:1, height:1, target:'osc', address:'/test'
    })

p.add( s )
