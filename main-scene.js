window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,15 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

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
            terio: context.get_instance( Texture_Scroll_X ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/terio.png", true)})
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.
        this.right = false; // Flag used to indicate right movement needs to occur.
        this.right_val = 1; // Flag used for determining if axes are translated in x or y direction, since rotated cube has different basis.
        this.right_count = 1; // Count used flipping the translation of the basis,.
        this.left = false;
        this.left_val = 1;
        this.left_count = 1;
        this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
        this.cur_val = 0;
      }
    make_control_panel()
      { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button( "Right",  [ "d" ], () => {this.right = true});
        this.key_triggered_button( "Left", [ "a" ], () => {this.left = true});
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        if (this.right) {
        	// When cube is oriented right side up or up side down, the translation occurs in the x direction, otherwise in the y direction, determined by value of this.right_val.
        	// When cube is oriented with x or y positive axis pointing to the original negative basis axes, flip the value so that the translation occurs in the right direction.
        	// This is determined by the value of this.right_count, and this sign switch occurs every two rotations, thanks to the modulo and floor and abs operation..
            this.position = this.position.times(Mat4.translation([(2 * this.right_val * (-1 + (2 * (Math.floor(Math.abs(this.right_count)) % 2) ) ) ), (2 * !this.right_val * (-1 + (2 * (Math.abs(Math.floor(this.right_count)) % 2) ) ) ), 0]))
                                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,0,-1)));
            // Below values need to be changed correspondingly, since the above transformation changed the current basis, so the next rotation, regardless of right or left, must
            // properly deal with this change.
            this.right = false;
            this.right_val = !this.right_val;
            this.right_count += 0.5;
            this.left_val = !this.left_val;
            this.left_count -= 0.5;
        }
        if (this.left) {
        	// Use the same logic as right, but flip the x axis, since we want to move in the opposite direction.
            this.position = this.position.times(Mat4.scale([-1,1,1]));
            this.position = this.position.times(Mat4.translation([(2 * this.left_val * (-1 + (2 * (Math.floor(Math.abs(this.left_count)) % 2) ) ) ), (2 * !this.left_val * (-1 + (2 * Math.abs((Math.floor(this.left_count) % 2)) ) ) ), 0]))
                                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,0,-1)));
            // Scale back so that our cube isn't stuck flipped.
            this.position = this.position.times(Mat4.scale([-1,1,1]));

            this.left = false;
            this.left_val = !this.left_val;
            this.left_count += 0.5;
            this.right_val = !this.right_val;
            this.right_count -= 0.5;
        }
        this.shapes.box.draw(graphics_state, this.position, this.materials.bab);
        this.shapes.axis.draw(graphics_state, this.position, this.materials.phong);

      }
  }

class Texture_Scroll_X extends Phong_Shader
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
            mat4 translate = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,mod(2.*animation_time,1.),0.,0.,1.);
            vec4 new_coord4 = translate * vec4(f_tex_coord, 0., 1.);
            vec2 new_coord2 = new_coord4.xy;
            vec4 tex_color = texture2D( texture, new_coord2);
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          mat4 translate = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0,0.5,0.5,0.,1.);
          mat4 rotate = mat4(cos(mod(animation_time,4.)*3.14159/2.),sin(mod(animation_time,4.)*3.14159/2.),0,0,-sin(mod(animation_time,4.)*3.14159/2.),cos(mod(animation_time,4.)*3.14159/2.),0,0,0,0,1,0,0,0,0,1); 
          mat4 translate2 = mat4(1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0,-0.5,-0.5,0.,1.);
          vec4 new_coord4 = translate * rotate * translate2 * vec4(f_tex_coord, 0., 1.);
          vec2 new_coord2 = new_coord4.xy;
          vec4 tex_color = texture2D( texture, new_coord2 );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}