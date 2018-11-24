window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( -5,10,15 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new ZoomCube(),
                         axis:  new Axis_Arrows()
                       }
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when 
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          { phong:  context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            bab: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", false) }),
            arrow: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/rgb.jpg", false) })
//             terio: context.get_instance( Texture_Scroll_X ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/terio.png", true)})
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.
        this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
        this.cur_val = 0;
        this.cur_position = "a";
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
      // TODO: Make this into a callable function to replace the stuff inside the control panel. For some reason, get some syntax error. 
//     change_position( is_lateral, sign, index) {
//           if (index < 2) {
//                 let rotation_x = -1 * (this.cur_position === 'i' || this.cur_position === 'm' || this.cur_position === 'q' || this.cur_position === 'u') + 
//                                       (this.cur_position === 'k' || this.cur_position === 'o' || this.cur_position === 's' || this.cur_position === 'w');
//                 let rotation_y = -1 * (this.cur_position === 'l' || this.cur_position === 'p' || this.cur_position === 't' || this.cur_position === 'x') + 
//                                       (this.cur_position === 'j' || this.cur_position === 'n' || this.cur_position === 'r' || this.cur_position === 'v');              
//                 let rotation_z = -1 * (this.cur_position === 'a' || this.cur_position === 'b' || this.cur_position === 'c' || this.cur_position === 'd') + 
//                                       (this.cur_position === 'e' || this.cur_position === 'f' || this.cur_position === 'g' || this.cur_position === 'h');  
//           } else {
//                 let rotation_x = -1 * (this.cur_position === 'a' || this.cur_position === 'g' || this.cur_position === 'j' || this.cur_position === 'p') + 
//                                       (this.cur_position === 'c' || this.cur_position === 'e' || this.cur_position === 'l' || this.cur_position === 'n');
//                 let rotation_y = -1 * (this.cur_position === 'd' || this.cur_position === 'f' || this.cur_position === 'i' || this.cur_position === 'o') + 
//                                       (this.cur_position === 'b' || this.cur_position === 'h' || this.cur_position === 'k' || this.cur_position === 'm');              
//                 let rotation_z = -1 * (this.cur_position === 'q' || this.cur_position === 'r' || this.cur_position === 's' || this.cur_position === 't') + 
//                                       (this.cur_position === 'u' || this.cur_position === 'v' || this.cur_position === 'w' || this.cur_position === 'x');
//           }
//           this.position = this.position.times(Mat4.translation(this.translations_dict[this.cur_position][index]))
//                                        .times(Mat4.rotation(is_positive * Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
//           this.cur_position = this.next_positions_dict[this.cur_position][index];
//     }
    make_control_panel()
      {
        this.key_triggered_button( "Right",  [ "d" ], () => {
//               change_position(1, 1, 0);
              this.position = this.position.times(Mat4.translation(this.translations_dict[this.cur_position][0]));
              // Chooses axis to rotate along based on current position.
              let rotation_x = -1 * (this.cur_position === 'i' || this.cur_position === 'm' || this.cur_position === 'q' || this.cur_position === 'u') + 
                                    (this.cur_position === 'k' || this.cur_position === 'o' || this.cur_position === 's' || this.cur_position === 'w');
              let rotation_y = -1 * (this.cur_position === 'l' || this.cur_position === 'p' || this.cur_position === 't' || this.cur_position === 'x') + 
                                    (this.cur_position === 'j' || this.cur_position === 'n' || this.cur_position === 'r' || this.cur_position === 'v');              
              let rotation_z = -1 * (this.cur_position === 'a' || this.cur_position === 'b' || this.cur_position === 'c' || this.cur_position === 'd') + 
                                    (this.cur_position === 'e' || this.cur_position === 'f' || this.cur_position === 'g' || this.cur_position === 'h');
              this.position = this.position.times(Mat4.rotation(Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
              this.cur_position = this.next_positions_dict[this.cur_position][0];
              });
        this.key_triggered_button( "Left", [ "a" ], () => {
//               change_position(1, -1, 1);
              this.position = this.position.times(Mat4.translation(this.translations_dict[this.cur_position][1]));
              let rotation_x = -1 * (this.cur_position === 'i' || this.cur_position === 'm' || this.cur_position === 'q' || this.cur_position === 'u') + 
                                    (this.cur_position === 'k' || this.cur_position === 'o' || this.cur_position === 's' || this.cur_position === 'w');
              let rotation_y = -1 * (this.cur_position === 'l' || this.cur_position === 'p' || this.cur_position === 't' || this.cur_position === 'x') + 
                                    (this.cur_position === 'j' || this.cur_position === 'n' || this.cur_position === 'r' || this.cur_position === 'v');              
              let rotation_z = -1 * (this.cur_position === 'a' || this.cur_position === 'b' || this.cur_position === 'c' || this.cur_position === 'd') + 
                                    (this.cur_position === 'e' || this.cur_position === 'f' || this.cur_position === 'g' || this.cur_position === 'h');
              this.position = this.position.times(Mat4.rotation(-Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
              this.cur_position = this.next_positions_dict[this.cur_position][1];
        });
        this.key_triggered_button( "Up", [ "w" ], () => {
//               change_position(0, 1, 2);
              this.position = this.position.times(Mat4.translation(this.translations_dict[this.cur_position][2]));
              let rotation_x = -1 * (this.cur_position === 'a' || this.cur_position === 'g' || this.cur_position === 'j' || this.cur_position === 'p') + 
                                    (this.cur_position === 'c' || this.cur_position === 'e' || this.cur_position === 'l' || this.cur_position === 'n');
              let rotation_y = -1 * (this.cur_position === 'd' || this.cur_position === 'f' || this.cur_position === 'i' || this.cur_position === 'o') + 
                                    (this.cur_position === 'b' || this.cur_position === 'h' || this.cur_position === 'k' || this.cur_position === 'm');              
              let rotation_z = -1 * (this.cur_position === 'q' || this.cur_position === 'r' || this.cur_position === 's' || this.cur_position === 't') + 
                                    (this.cur_position === 'u' || this.cur_position === 'v' || this.cur_position === 'w' || this.cur_position === 'x');
              this.position = this.position.times(Mat4.rotation(Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
              this.cur_position = this.next_positions_dict[this.cur_position][2];
        });
        this.key_triggered_button("Down", [ "s" ], () => {
//               change_position(0, -1, 3);
              this.position = this.position.times(Mat4.translation(this.translations_dict[this.cur_position][3]));
              let rotation_x = -1 * (this.cur_position === 'a' || this.cur_position === 'g' || this.cur_position === 'j' || this.cur_position === 'p') + 
                                    (this.cur_position === 'c' || this.cur_position === 'e' || this.cur_position === 'l' || this.cur_position === 'n');
              let rotation_y = -1 * (this.cur_position === 'd' || this.cur_position === 'f' || this.cur_position === 'i' || this.cur_position === 'o') + 
                                    (this.cur_position === 'b' || this.cur_position === 'h' || this.cur_position === 'k' || this.cur_position === 'm');              
              let rotation_z = -1 * (this.cur_position === 'q' || this.cur_position === 'r' || this.cur_position === 's' || this.cur_position === 't') + 
                                    (this.cur_position === 'u' || this.cur_position === 'v' || this.cur_position === 'w' || this.cur_position === 'x');
              this.position = this.position.times(Mat4.rotation(-Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
              this.cur_position = this.next_positions_dict[this.cur_position][3];
        })
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        this.shapes.box.draw(graphics_state, this.position, this.materials.bab);
        this.shapes.axis.draw(graphics_state, this.position, this.materials.arrow);

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