window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )
      { super(   context, control_box );
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( -5,10,15 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { box:   new Cube(),
                         box_2: new ZoomCube(),
                         axis:  new Axis_Arrows(),
                         rect_prism: new Prism(),
                       }
        this.submit_shapes( context, shapes );

        this.materials =
          { phong:  context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            boldandbrash: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", false) }),
            brashandbold: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", false) }),
            arrow: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/rgb.jpg", false) }),
            ground: context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ), { ambient: 0.5})
          }

        this.lights = [ new Light( Vec.of(-5,5,5,1 ), Color.of( 0.5,1,1,1 ), 100000 ) ];

        this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
        this.cur_val = 0;
        this.cur_position = "a";
        this.coords1 = [0,0,0];

        this.position2 = this.position.times(Mat4.translation([0,0,-6]));
        this.cur_val2 = 0;
        this.cur_position2 = 'a';
        this.coords2 = [0,0,-6];
        // Dictionary containing the next orientation of the cube, index into the string where 0 = right, 1 = left, 2 = up, 3 = down, will give you the next orientation.
        this.next_positions_dict = {
              'a': "dbjp",
              'b': "ackm",
              'c': "bdln",
              'd': "caio",
              'e': "fhnl",
              'f': "geoi",
              'g': "hfpj",
              'h': "egmk",
              'i': "qufd",
              'j': "rvga",
              'k': "swhb",
              'l': "txec",
              'm': "uqbh",
              'n': "vrce",
              'o': "wsdf",
              'p': "xtag",
              'q': "mitr",
              'r': "njqs",
              's': "okrt",
              't': "plsq",
              'u': "imvx",
              'v': "jnwu",
              'w': "koxv",
              'x': "lpuw"
        };
        // Dictionary containing the translation to be executed on the current orientation, where the index into the value is the same as for the position dictionary.
        this.translations_dict = {
              'a': [[2,0,0],[-2,0,0],[0,0,-2],[0,0,2]],
              'b': [[0,-2,0],[0,2,0],[0,0,-2],[0,0,2]],
              'c': [[-2,0,0],[2,0,0],[0,0,-2],[0,0,2]],
              'd': [[0,2,0],[0,-2,0],[0,0,-2],[0,0,2]],
              'e': [[-2,0,0],[2,0,0],[0,0,2],[0,0,-2]],
              'f': [[0,2,0],[0,-2,0],[0,0,2],[0,0,-2]],
              'g': [[2,0,0],[-2,0,0],[0,0,2],[0,0,-2]],
              'h': [[0,-2,0],[0,2,0],[0,0,2],[0,0,-2]],
              'i': [[0,2,0],[0,-2,0],[-2,0,0],[2,0,0]],
              'j': [[2,0,0],[-2,0,0],[0,2,0],[0,-2,0]],
              'k': [[0,-2,0],[0,2,0],[2,0,0],[-2,0,0]],
              'l': [[-2,0,0],[2,0,0],[0,-2,0],[0,2,0]],
              'm': [[0,-2,0],[0,2,0],[-2,0,0],[2,0,0]],
              'n': [[-2,0,0],[2,0,0],[0,2,0],[0,-2,0]],
              'o': [[0,2,0],[0,-2,0],[2,0,0],[-2,0,0]],
              'p': [[2,0,0],[-2,0,0],[0,-2,0],[0,2,0]],
              'q': [[0,0,2],[0,0,-2],[-2,0,0],[2,0,0]],
              'r': [[0,0,2],[0,0,-2],[0,2,0],[0,-2,0]],
              's': [[0,0,2],[0,0,-2],[2,0,0],[-2,0,0]],
              't': [[0,0,2],[0,0,-2],[0,-2,0],[0,2,0]],
              'u': [[0,0,-2],[0,0,2],[-2,0,0],[2,0,0]],
              'v': [[0,0,-2],[0,0,2],[0,2,0],[0,-2,0]],
              'w': [[0,0,-2],[0,0,2],[2,0,0],[-2,0,0]],
              'x': [[0,0,-2],[0,0,2],[0,-2,0],[0,2,0]],              
        };
      }
    change_position( is_lateral, sign, index, cube_index) {
          let cur_pos = cube_index ? this.cur_position2 : this.cur_position;
          let pos = cube_index ? this.position2 : this.position;
          let rotation_x = -1 * (cur_pos === 'i' || cur_pos === 'm' || cur_pos === 'q' || cur_pos === 'u') + 
                                (cur_pos === 'k' || cur_pos === 'o' || cur_pos === 's' || cur_pos === 'w');
          let rotation_y = -1 * (cur_pos === 'l' || cur_pos === 'p' || cur_pos === 't' || cur_pos === 'x') + 
                                (cur_pos === 'j' || cur_pos === 'n' || cur_pos === 'r' || cur_pos === 'v');              
          let rotation_z = -1 * (cur_pos === 'a' || cur_pos === 'b' || cur_pos === 'c' || cur_pos === 'd') + 
                                (cur_pos === 'e' || cur_pos === 'f' || cur_pos === 'g' || cur_pos === 'h');  
          if (index >= 2) {
                rotation_x = -1 * (cur_pos === 'a' || cur_pos === 'g' || cur_pos === 'j' || cur_pos === 'p') + 
                                  (cur_pos === 'c' || cur_pos === 'e' || cur_pos === 'l' || cur_pos === 'n');
                rotation_y = -1 * (cur_pos === 'd' || cur_pos === 'f' || cur_pos === 'i' || cur_pos === 'o') + 
                                  (cur_pos === 'b' || cur_pos === 'h' || cur_pos === 'k' || cur_pos === 'm');              
                rotation_z = -1 * (cur_pos === 'q' || cur_pos === 'r' || cur_pos === 's' || cur_pos === 't') + 
                                  (cur_pos === 'u' || cur_pos === 'v' || cur_pos === 'w' || cur_pos === 'x');
          }
          pos = pos.times(Mat4.translation(this.translations_dict[cur_pos][index]))
                   .times(Mat4.rotation(sign * Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
          cur_pos = this.next_positions_dict[cur_pos][index];
          if (!cube_index) {
                this.cur_position = cur_pos;
                this.position = pos;
          } else {
                this.cur_position2 = cur_pos;
                this.position2 = pos;
          }
    }
    make_control_panel()
      {
        this.control_panel.innerHTML += "Player One Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "d" ], () => { this.change_position(1, 1, 0, 0); });
        this.key_triggered_button( "Left", [ "a" ], () => { this.change_position(1, -1, 1, 0); });
        this.key_triggered_button( "Up", [ "w" ], () => {
              this.change_position(0, 1, 2, 0);
              this.coords1[2] -= 2;
        });
        this.key_triggered_button("Down", [ "s" ], () => {
              this.change_position(0, -1, 3, 0);
              this.coords1[2] += 2;
        });
        this.new_line();
        this.control_panel.innerHTML += "Player Two Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "l" ], () => { this.change_position(1, 1, 0, 1); });
        this.key_triggered_button( "Left", [ "j" ], () => { this.change_position(1, -1, 1, 1); });
        this.key_triggered_button( "Up", [ "i" ], () => {
              this.change_position(0, 1, 2, 1);
              this.coords2[2] -= 2;
        });
        this.key_triggered_button("Down", [ "k" ], () => {
              this.change_position(0, -1, 3, 1);
              this.coords2[2] += 2;
        });
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
//         this.shapes.rect_prism.draw(graphics_state, this.position, this.materials.boldandbrash);
        // Draw a floor by using multiple cubes. TODO: create an outline for each cube, see assignment 1.
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation([-10,-2,-10]));
        for (var i = 0; i < 10; i++) {
              model_transform = model_transform.times(Mat4.translation([0,0,2]));
              for (var j = 0; j < 10; j++) {
                    model_transform = model_transform.times(Mat4.translation([2,0,0]));
                    this.shapes.box.draw(graphics_state, model_transform, this.materials.ground);
              }
              model_transform = model_transform.times(Mat4.translation([-20,0,0]));
        }
        // Change order in which cubes are drawn to have accurate transparency, based of z value of cube coordinates.
        if (this.coords2[2] > this.coords1[2]) {
            this.shapes.box.draw(graphics_state, this.position, this.materials.boldandbrash);
            this.shapes.axis.draw(graphics_state, this.position, this.materials.arrow);
            this.shapes.box.draw(graphics_state, this.position2, this.materials.brashandbold);
            this.shapes.axis.draw(graphics_state, this.position2, this.materials.arrow);
        } else {
            this.shapes.box.draw(graphics_state, this.position2, this.materials.brashandbold);
            this.shapes.axis.draw(graphics_state, this.position2, this.materials.arrow);
            this.shapes.box.draw(graphics_state, this.position, this.materials.boldandbrash);
            this.shapes.axis.draw(graphics_state, this.position, this.materials.arrow);
        }
      }
  }

// class Texture_Scroll_X extends Phong_Shader
//     {
//       // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
//       return `
//         uniform sampler2D texture;
//         void main()
//         { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
//           { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
//             return;
//           }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
//                                             // Phong shading is not to be confused with the Phong Reflection Model.
//             mat4 translate = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,mod(2.*animation_time,1.),0.,0.,1.);
//             vec4 new_coord4 = translate * vec4(f_tex_coord, 0., 1.);
//             vec2 new_coord2 = new_coord4.xy;
//             vec4 tex_color = texture2D( texture, new_coord2);
//                                                                                       // Compute an initial (ambient) color:
//           if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
//           else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
//           gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
//         }`;
//     }
// }

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
//       return `
//         uniform sampler2D texture;
//         void main()
//         { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
//           { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
//             return;
//           }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
//                                             // Phong shading is not to be confused with the Phong Reflection Model.
//           mat4 translate = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0,0.5,0.5,0.,1.);
//           mat4 rotate = mat4(cos(mod(animation_time,4.)*3.14159/2.),sin(mod(animation_time,4.)*3.14159/2.),0,0,-sin(mod(animation_time,4.)*3.14159/2.),cos(mod(animation_time,4.)*3.14159/2.),0,0,0,0,1,0,0,0,0,1); 
//           mat4 translate2 = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0,-0.5,-0.5,0.,1.);
//           vec4 new_coord4 = translate * rotate * translate2 * vec4(f_tex_coord, 0., 1.);
//           vec2 new_coord2 = new_coord4.xy;
//           vec4 tex_color = texture2D( texture, new_coord2 );                         // Sample the texture image in the correct place.
//                                                                                       // Compute an initial (ambient) color:
//           if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
//           else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
//           gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
//         }`;
    }
}