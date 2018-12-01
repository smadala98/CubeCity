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
                         floor: new Square(),
                         rect_prism: new Prism(),
                       }                       
        this.submit_shapes( context, shapes );
        // JavaScript Player + Board information
        // 1 = valid, 2 = obstacle
        this.board = [
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
            [-1, 1,-1,-1,-2,-2,-1,-1, 1,-1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
            [ 1, 1, 1, 1,-2,-2, 1, 1, 1, 1],
        ];
        this.player1 = {
            x: 0,
            y: 9
        };
        
        this.player2 = {
            x: 9,
            y: 9
        };
        
        this.prism = {
            x: 4,
            y: 2
        };               
        
        this.x_aligned = false;
        this.is_standing = false;        

        // Garett's advice for shadows.
        this.webgl_manager = context;      // Save off the Webgl_Manager object that created the scene.
        this.scratchpad = document.createElement('canvas');
        this.scratchpad_context = this.scratchpad.getContext('2d');     // A hidden canvas for re-sizing the real canvas to be square.
        this.scratchpad.width   = 256;
        this.scratchpad.height  = 256;
        this.texture = new Texture ( context.gl, "", false, false );        // Initial image source: Blank gif file
        this.texture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        this.materials =
          { phong:  context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            boldandbrash: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
            boldandbrasht: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/boldandbrash.jpg", true) }),
            brashandbold: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),
            brashandboldt: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,0.5 ), { ambient: 1, texture: context.get_instance("assets/brashandbold.jpg", true) }),            
            ditto: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/ditto.png", false) }),
            arrow: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance("assets/rgb.jpg", true) }),
            ground: context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ), { ambient: 0.5}),
            shadow: context.get_instance(Phong_Shader).material( Color.of( 0, 0, 0,1 ), { ambient: 1, texture: this.texture } ),
          }

        this.lights = [ new Light( Vec.of(-10,10,10,1 ), Color.of( 0.5,1,1,1 ), 100000000 ) ];
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of(-10,20,25), Vec.of(0,0,0), Vec.of(0,1,0));

        this.position = Mat4.identity(); // Holds the current transformation matrix of shape.
        this.position = this.position.times(Mat4.translation([-8,0,10]));
        this.cur_val = 0;
        this.cur_position = "a";
        this.coords1 = [-8,0,10];
        this.transparent1 = 0;
        
        this.position2 = Mat4.identity();
        this.position2 = this.position2.times(Mat4.translation([10,0,10]));
        this.cur_val2 = 0;
        this.cur_position2 = 'a';
        this.coords2 = [10,0,10];
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
    
    set_rect_coordinates() {
        this.prism.x = this.player1.x < this.player2.x ? this.player1.x : this.player2.x;
        this.prism.y = this.player1.y < this.player2.y ? this.player1.y : this.player2.y;
    }
    
    check_if_adjacent() {
        // If this statement is true, this means the blocks are lined up in the x axis and adjacent.
        if ((Math.abs(this.coords1[0] - this.coords2[0]) === 2) && (this.coords1[2] === this.coords2[2])) {
                let new_coords = [1/2 * (this.coords1[0] + this.coords2[0]), 1/2 * (this.coords1[1] + this.coords2[1]), 1/2 * (this.coords1[2] + this.coords2[2])];
                this.rect_position = this.rect_position.times(Mat4.translation(new_coords));
                this.rect_coords = new_coords;  
                this.combine = 1;
                this.x_aligned = true;
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
                this.x_aligned = false;
        }
        // Set rectangular prism coordinates for future movements + collision detection
        this. set_rect_coordinates();        
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
          // console.log(this.rect_cur_position);
    }     
    
    can_move(x, y) {
      return (y>=0) && (y<this.board.length) && (x >= 0) && (x < this.board[y].length) && (this.board[y][x] == 1);
    }  

    // Direction = [0,1,2,3] for [right, left, up, down], respectively    
    update_rect_coord(direction) {          
        // Right      
        if (direction === 0) {                   
            if (this.x_aligned && !this.is_standing) {                                       
                if (this.can_move(this.prism.x+2,this.prism.y)) {                                            
                    this.is_standing = true;
                    this.prism.x = this.prism.x+2;
                    this.change_position(1, 1, 0, 0);
                }
            }
            else if (!this.x_aligned && !this.is_standing) {
                if (this.can_move(this.prism.x+1,this.prism.y)) {                        
                    this.prism.x = this.prism.x+1;
                    this.change_position(1, 1, 0, 0);
                }
            }
            else { // is_standing === 1
                if (this.can_move(this.prism.x+2, this.prism.y)) {
                    this.is_standing = false;
                    this.x_aligned = true;
                    this.prism.x = this.prism.x+1;
                    this.change_position(1, 1, 0, 0);
                }
            }            
       }
       // Left 
       if (direction === 1) {
            if (this.x_aligned && !this.is_standing) {                                           
                if (this.can_move(this.prism.x-1, this.prism.y)) {                        
                    this.is_standing = true;
                    this.prism.x = this.prism.x-1;
                    this.change_position(1, -1, 1, 0); 
                }                    
            }
            else if (!this.x_aligned && !this.is_standing) {
                if (this.can_move(this.prism.x-1, this.prism.y)) {
                    this.prism.x--;
                    this.change_position(1, -1, 1, 0); 
                }
            }
            else { // is_standing === 1
                if (this.can_move(this.prism.x-2, this.prism.y)) {
                    this.is_standing = false;
                    this.x_aligned = true;
                    this.prism.x = this.prism.x-2;
                    this.change_position(1, -1, 1, 0); 
                }
            }      
       }
       // Up
       if (direction === 2) {
            if (this.x_aligned && !this.is_standing) {
                if (this.can_move(this.prism.x, this.prism.y-1)) {
                    this.prism.y--;
                    this.change_position(0, 1, 2, 0);
                }
            }
            else if (!this.x_aligned && !this.is_standing) {                    
                    if (this.can_move(this.prism.x, this.prism.y-1)) {
                        this.is_standing = true;
                        this.prism.y = this.prism.y-1;
                        this.change_position(0, 1, 2, 0);
                    }
            }
            else { // is_standing === 1
                if (this.can_move(this.prism.x, this.prism.y-2)) {
                    this.is_standing = false;
                    this.x_aligned = false;
                    this.prism.y = this.prism.y-2;
                    this.change_position(0, 1, 2, 0);
                }
            }
       }
       // Down
       if (direction === 3) {
            if (this.x_aligned && !this.is_standing) {
                if (this.can_move(this.prism.x, this.prism.y+1)) {
                    this.prism.y++;
                    this.change_position(0, -1, 3, 0);     
                }
            }
            else if (!this.x_aligned && !this.is_standing) {
                if (this.can_move(this.prism.x, this.prism.y+2)) {
                    this.is_standing = true;
                    this.prism.y = this.prism.y + 2;
                    this.change_position(0, -1, 3, 0); 
                }
            }
            else { // is_standing === 1
                if (this.can_move(this.prism.x, this.prism.y+2)) {
                    this.is_standing = false;
                    this.x_aligned = false;
                    this.prism.y = this.prism.y + 1;
                    this.change_position(0, -1, 3, 0); 
                }
            }
       }
    }          

    make_control_panel()
      {
        this.control_panel.innerHTML += "Player One Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "d" ], () => {                         
            if (this.combine) { this.update_rect_coord(0); }
            else { if (this.can_move(this.player1.x+1,this.player1.y)) { this.player1.x++; this.change_position(1, 1, 0, 0); } }
        });
        this.key_triggered_button( "Left", [ "a" ], ()   => { 
            if (this.combine) { this.update_rect_coord(1); }                       
            else { if (this.can_move(this.player1.x-1,this.player1.y)) { this.player1.x--; this.change_position(1, -1, 1, 0); } }
        });
        this.key_triggered_button( "Up", [ "w" ], ()     => { 
            if (this.combine) { this.update_rect_coord(2); }            
            else { if (this.can_move(this.player1.x,this.player1.y-1)) { this.player1.y--; this.change_position(0, 1, 2, 0); } }
        });
        this.key_triggered_button("Down", [ "s" ], ()    => { 
            if (this.combine) { this.update_rect_coord(3); }            
            else { if (this.can_move(this.player1.x,this.player1.y+1)) { this.player1.y++; this.change_position(0, -1, 3, 0); } }                     
        });          
        this.key_triggered_button("Make Transparent", [ "q" ], () => { this.transparent1 = !this.transparent1; });
        this.new_line();
        this.control_panel.innerHTML += "Player Two Controls";
        this.new_line();
        this.key_triggered_button( "Right",  [ "l" ], () => { 
            if (this.combine) { this.update_rect_coord(0); }
            else { if (this.can_move(this.player2.x+1,this.player2.y)) { this.player2.x++; this.change_position(1, 1, 0, 1); } }
        });
        this.key_triggered_button( "Left", [ "j" ], ()   => { 
            if (this.combine) { this.update_rect_coord(1); }
            else { if (this.can_move(this.player2.x-1,this.player2.y)) { this.player2.x--; this.change_position(1, -1, 1, 1); } }
        });
        this.key_triggered_button( "Up", [ "i" ], ()     => { 
            if (this.combine) { this.update_rect_coord(2); }
            else { if (this.can_move(this.player2.x,this.player2.y-1)) { this.player2.y--; this.change_position(0, 1, 2, 1); } }
        });
        this.key_triggered_button("Down", [ "k" ], ()    => { 
            if (this.combine) { this.update_rect_coord(3); }
            else { if (this.can_move(this.player2.x,this.player2.y+1)) { this.player2.y++; this.change_position(0, -1, 3, 1); } }
        });
        this.key_triggered_button("Make Transparent", [ "u" ], () => { this.transparent2 = !this.transparent2; });
        this.result_img = this.control_panel.appendChild( Object.assign( document.createElement( "img" ), 
                { style:"width:200px; height:" + 200 * this.aspect_ratio + "px" } ) );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // Draw a floor by using multiple cubes. TODO: create an outline for each cube, see assignment 1.
        let horiz_wall_transform = Mat4.identity();
        horiz_wall_transform = horiz_wall_transform.times(Mat4.translation([-10,0,0]));
        for (var i = 0; i < 1; i++) {
              horiz_wall_transform = horiz_wall_transform.times(Mat4.translation([0,0,2]));
              for (var j = 0; j < 10; j++) {
                    horiz_wall_transform = horiz_wall_transform.times(Mat4.translation([2,0,0]));                    
                    if ( j === 1 || j === 8 || j === 4 || j === 5) {
                        continue;
                    }                    
                    this.shapes.box.draw(graphics_state, horiz_wall_transform, this.materials.phong.override( { color: Color.of(0.760,0.413,0.370, 1) }));
              }
              horiz_wall_transform = horiz_wall_transform.times(Mat4.translation([-20,0,0]));
        }
        /*
        let vert_wall_transform = Mat4.identity();
        vert_wall_transform = vert_wall_transform.times(Mat4.translations([-10,0]));
        for (var i = 0; i < 1; i++) {
            vert_wall_transform = vert_wall_transform.times(Mat4.translation([0,0,2]));
            this.shapes.box.draw(graphics_state, )
        }
        */ 
        let model_transform2 = Mat4.identity();
        model_transform2 = model_transform2.times(Mat4.translation([-10,-2,-10]));
        for (var i = 0; i < 10; i++) {
              model_transform2 = model_transform2.times(Mat4.translation([0,0,2]));
              for (var j = 0; j < 10; j++) {
                    model_transform2 = model_transform2.times(Mat4.translation([2,0,0]));
                    if ( (j === 4 || j === 5) && (i > 2) )
                        continue;                    
                    this.shapes.box.draw(graphics_state, model_transform2, this.materials.ditto);
              }
              model_transform2 = model_transform2.times(Mat4.translation([-20,0,0]));
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

//         this.scratchpad_context.drawImage( this.webgl_manager.canvas, 0, 0, 256, 256 );
//         this.texture.image.src = this.result_img.src = this.scratchpad.toDataURL("image/png"); // Clear the canvas and start over, beginning scene 2:
// 		this.webgl_manager.gl.clear( this.webgl_manager.gl.COLOR_BUFFER_BIT | this.webgl_manager.gl.DEPTH_BUFFER_BIT);

//         graphics_state.camera_transform = Mat4.look_at( Vec.of(-25,20,25), Vec.of(0,0,0), Vec.of(0,1,0));
//         model_transform = Mat4.identity();
//         model_transform = model_transform.times(Mat4.translation([-10,-2,-10]));
//         for (var i = 0; i < 10; i++) {
//               model_transform = model_transform.times(Mat4.translation([0,0,2]));
//               for (var j = 0; j < 10; j++) {
//                     model_transform = model_transform.times(Mat4.translation([2,0,0]));
//                     this.shapes.box.draw(graphics_state, model_transform, this.materials.shadow);
//               }
//               model_transform = model_transform.times(Mat4.translation([-20,0,0]));
//         }
//         // Change order in which cubes are drawn to have accurate transparency, based of z value of cube coordinates.
//         if (this.coords2[2] > this.coords1[2]) {
//             this.shapes.box.draw(graphics_state, this.position, this.materials.shadow);
//             this.shapes.box.draw(graphics_state, this.position2, this.materials.shadow);
//         } else {
//             this.shapes.box.draw(graphics_state, this.position2, this.materials.shadow);
//             this.shapes.box.draw(graphics_state, this.position, this.materials.shadow);
//         }
//         graphics_state.camera_transform = Mat4.look_at( Vec.of(-20,10,10), Vec.of(0,0,0), Vec.of(0,1,0));
      }
  }

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


class Shadow_Shader extends Phong_Shader
{ shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
        const int N_LIGHTS = 2;             // We're limited to only so many inputs in hardware.  Lights are costly (lots of sub-values).
        uniform float ambient, diffusivity, specularity, smoothness, animation_time, attenuation_factor[N_LIGHTS];
        uniform bool GOURAUD, COLOR_NORMALS, USE_TEXTURE;               // Flags for alternate shading methods
        uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
        varying vec3 N, E;                    // Specifier "varying" means a variable's final value will be passed from the vertex shader 
        varying vec2 f_tex_coord;             // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the 
        varying vec4 VERTEX_COLOR;            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 L[N_LIGHTS], H[N_LIGHTS];
        varying float dist[N_LIGHTS];
        
        vec3 phong_model_lights( vec3 N )
          { vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++)
              {
                float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                float diffuse  =      max( dot(N, L[i]), 0.0 );
                float specular = pow( max( dot(N, H[i]), 0.0 ), smoothness );
                result += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * specularity * specular );
              }
            return result;
          }
        `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos, normal;
        attribute vec2 tex_coord;
        uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
        uniform mat3 inverse_transpose_modelview;
        void main()
        { gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);     // The vertex's final resting place (in NDCS).
          N = normalize( inverse_transpose_modelview * normal );                             // The final normal vector in screen space.
          f_tex_coord = tex_coord;                                         // Directly use original texture coords and interpolate between.
          
          if( COLOR_NORMALS )                                     // Bypass all lighting code if we're lighting up vertices some other way.
          { VERTEX_COLOR = vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In "normals" mode, 
                                 N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],             // rgb color = xyz quantity.
                                 N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 );     // Flash if it's negative.
            return;
          }
                                                  // The rest of this shader calculates some quantities that the Fragment shader will need:
          vec3 screen_space_pos = ( camera_model_transform * vec4(object_space_pos, 1.0) ).xyz;
          E = normalize( -screen_space_pos );
          for( int i = 0; i < N_LIGHTS; i++ )
          {            // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
            L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * screen_space_pos );
            H[i] = normalize( L[i] + E );
            
            // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
            dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, screen_space_pos)
                                                : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
          }
        }`;
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {                            // A fragment is a pixel that's overlapped by the current triangle.
                                 // Fragments affect the final image or get discarded due to depth.
      return `
        uniform sampler2D texture;
        void main()
        {
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
          if( USE_TEXTURE && tex_color.w < .01 ) discard;
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}