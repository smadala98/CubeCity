window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )
      { super(   context, control_box );
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

//         context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( -5,10,15 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
//         context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of(-10,10,10), Vec.of(0,0,0), Vec.of(0,1,0));


        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { box:   new Cube(),
                         box_2: new ZoomCube(),
                         axis:  new Axis_Arrows(),
                         rect_prism: new Prism(),
                       }
        this.submit_shapes( context, shapes );
        // Garett's advice for shadows.

        this.materials =
          { phong:  context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            boldandbrash: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
            boldandbrasht: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
            brashandbold: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),
            brashandboldt: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),            
            arrow: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/rgb.jpg", true) }),
            ground: context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ), { ambient: 0.5}),
          }

        this.lights = [ new Light( Vec.of(-10,10,10,1 ), Color.of( 0.5,1,1,1 ), 100000000 ) ];
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of(-10,10,10), Vec.of(0,0,0), Vec.of(0,1,0));

        this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
        this.cur_val = 0;
        this.cur_position = "a";
        this.coords1 = [0,0,0];
        this.transparent1 = 0;

        this.position2 = this.position.times(Mat4.translation([0,0,-6]));
        this.cur_val2 = 0;
        this.cur_position2 = 'a';
        this.coords2 = [0,0,-6];
        this.transparent2 = 0;

        this.combine = 0;
        this.along_x = 0;
        this.rect_position = Mat4.identity();
        this.rect_cur_position = 'a';
        this.rect_coords = [0,0,0];
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
        // Dictionary similar to other translation dictionary, but maps out translations for the 2x1 rectangular prism.
        this.prism_translations_dict = {
              'a': [[3,1,0],[-3,1,0],[0,0,-2],[0,0,2]],
              'b': [[-1,-3,0],[-1,3,0],[-1,0,-3],[-1,0,3]], // standing up
              'c': [[-3,-1,0],[3,-1,0],[0,0,-2],[0,0,2]],
              'd': [[1,3,0],[1,-3,0],[1,0,-3],[1,0,3]], // standing up
              'e': [[-3,1,0],[3,1,0],[0,0,2],[0,0,-2]],
              'f': [[-1,3,0],[-1,-3,0],[-1,0,3],[-1,0,-3]], // standing up
              'g': [[3,-1,0],[-3,-1,0],[0,0,2],[0,0,-2]],
              'h': [[1,-3,0],[1,3,0],[1,0,3],[1,0,-3]], // standing up
              'i': [[0,2,0],[0,-2,0],[-3,0,1],[3,0,1]],
              'j': [[3,0,1],[-3,0,1],[0,2,0],[0,-2,0]],
              'k': [[0,-2,0],[0,2,0],[3,0,1],[-3,0,1]],
              'l': [[-3,0,1],[3,0,1],[0,-2,0],[0,2,0]],
              'm': [[0,-2,0],[0,2,0],[-3,0,-1],[3,0,-1]],
              'n': [[-3,0,-1],[3,0,-1],[0,2,0],[0,-2,0]],
              'o': [[0,2,0],[0,-2,0],[3,0,-1],[-3,0,-1]],
              'p': [[3,0,-1],[-3,0,-1],[0,-2,0],[0,2,0]],
              'q': [[0,0,2],[0,0,-2],[-3,-1,0],[3,-1,0]],
              'r': [[1,0,3],[1,0,-3],[1,3,0],[1,-3,0]], // standing up
              's': [[0,0,2],[0,0,-2],[3,1,0],[-3,1,0]],
              't': [[-1,0,3],[-1,0,-3],[-1,-3,0],[-1,3,0]], // standing up
              'u': [[0,0,-2],[0,0,2],[-3,1,0],[3,1,0]],
              'v': [[-1,0,-3],[-1,0,3],[-1,3,0],[-1,-3,0]], // standing up
              'w': [[0,0,-2],[0,0,2],[3,-1,0],[-3,-1,0]],
              'x': [[1,0,-3],[1,0,3],[1,-3,0],[1,3,0]], // standing up             
        };
      }
    check_if_adjacent() {
        // If this statement is true, this means the blocks are lined up in the x axis and adjacent.
        if ((Math.abs(this.coords1[0] - this.coords2[0]) === 2) && (this.coords1[2] === this.coords2[2])) {
                let new_coords = [1/2 * (this.coords1[0] + this.coords2[0]), 1/2 * (this.coords1[1] + this.coords2[1]), 1/2 * (this.coords1[2] + this.coords2[2])];
                this.rect_position = this.rect_position.times(Mat4.translation(new_coords));
                this.rect_coords = new_coords;  
                this.combine = 1;
        // If this statement is true, this means that the blocks are lined up in the z axis and adjacent.
        } else if ((Math.abs(this.coords1[2] - this.coords2[2]) === 2) && (this.coords1[0] === this.coords2[0])) {
                let new_coords = [1/2 * (this.coords1[0] + this.coords2[0]), 1/2 * (this.coords1[1] + this.coords2[1]), 1/2 * (this.coords1[2] + this.coords2[2])];
                this.rect_position = this.rect_position.times(Mat4.translation(new_coords));
                // If its aligned in the z axis, we need to rotate the prism to fit the orientation. This also changes the axis orientation, so we need to change the rect_cur_position to the key in the dictionaries that fit
                // that axis orientation, which is 'u'.
                this.rect_position = this.rect_position.times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));
                this.rect_cur_position = 's';
                this.rect_coords = new_coords;  
                this.combine = 1;
        }
    }
    change_position( is_lateral, sign, index, cube_index) {
          // We are in prism mode, so use a different function.
          if (this.combine) {
                  this.change_rect_position(sign, index);
                  return;
          }
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
          // Change each cube's coordinate correspondingly.
          switch (index) {
                case 0:
                        if (!cube_index) {
                                this.coords1[0] += 2;
                        } else {
                                this.coords2[0] += 2;
                        }
                        break;
                case 1:
                        if (!cube_index) {
                                this.coords1[0] -= 2;
                        } else {
                                this.coords2[0] -= 2;
                        }
                        break;
                case 2:
                        if (!cube_index) {
                                this.coords1[2] -= 2;
                        } else {
                                this.coords2[2] -= 2;
                        }
                        break;
                case 3:
                        if (!cube_index) {
                                this.coords1[2] += 2;
                        } else {
                                this.coords2[2] += 2;
                        }
                        break;
          }
          // Check if our cubes are adjacent, so that we can then combine our blocks into the 2x1 prism.
          this.check_if_adjacent();
    }
    // Works the same as the change_position, but without the cube_index stuff.
    change_rect_position(sign, index) {
          let cur_pos = this.rect_cur_position;
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
          this.rect_position = this.rect_position.times(Mat4.translation(this.prism_translations_dict[cur_pos][index]))
                                       .times(Mat4.rotation(sign * Math.PI/2, Vec.of(rotation_x, rotation_y, rotation_z)));
          this.rect_cur_position = this.next_positions_dict[this.rect_cur_position][index];
          // TODO: figure out how to properly update prism coordinates. Prob need to do something weird with standing up positions.
          console.log(this.rect_cur_position);
    }
    make_control_panel()
      {
        this.control_panel.innerHTML += "Player One Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "d" ], () => { this.change_position(1, 1, 0, 0); });
        this.key_triggered_button( "Left", [ "a" ], () => { this.change_position(1, -1, 1, 0); });
        this.key_triggered_button( "Up", [ "w" ], () => { this.change_position(0, 1, 2, 0); });
        this.key_triggered_button("Down", [ "s" ], () => { this.change_position(0, -1, 3, 0); });
        this.key_triggered_button("Make Transparent", [ "q" ], () => { this.transparent1 = !this.transparent1; });
        this.new_line();
        this.control_panel.innerHTML += "Player Two Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "l" ], () => { this.change_position(1, 1, 0, 1); });
        this.key_triggered_button( "Left", [ "j" ], () => { this.change_position(1, -1, 1, 1); });
        this.key_triggered_button( "Up", [ "i" ], () => { this.change_position(0, 1, 2, 1); });
        this.key_triggered_button("Down", [ "k" ], () => { this.change_position(0, -1, 3, 1); });
        this.key_triggered_button("Make Transparent", [ "u" ], () => { this.transparent2 = !this.transparent2; });
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

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

        // We combined our cubes into the prism.
        if (this.combine) {
            this.shapes.rect_prism.draw(graphics_state, this.rect_position, this.materials.phong);
        } else {
            // Change order in which cubes are drawn to have accurate transparency, based off z value of cube coordinates.
            if (this.coords2[2] > this.coords1[2]) {
                this.shapes.box.draw(graphics_state, this.position,
                        this.transparent1 ? this.materials.boldandbrasht : this.materials.boldandbrash);
                this.shapes.box.draw(graphics_state, this.position2,
                        this.transparent2 ? this.materials.brashandboldt : this.materials.brashandbold);
            } else {
                this.shapes.box.draw(graphics_state, this.position2,
                        this.transparent2 ? this.materials.brashandboldt : this.materials.brashandbold);
                this.shapes.box.draw(graphics_state, this.position,
                        this.transparent1 ? this.materials.boldandbrasht : this.materials.boldandbrash);
            }
        }
      }
  }