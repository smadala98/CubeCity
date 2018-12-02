# term-project-group-46
## This is a README Markdown file containing all of the information about CubeCity, a 3D animated game created in WebGL for the final term project of CS 174A at UCLA under the instruction of Scott Friedman.

CubeCity 

by 
Ben Huang UID: 204625583  benthuang@g.ucla.edu
Anderson Ju  UID: 504606314 anderson.ju9797@gmail.com
Subhodh Madala UID: 804766612 smadala98@gmail.com
Zachary Prong  UID: 304958784 prongzachary@gmail.com



Introduction:

CubeCity is a three dimensional platforming game in which two players, playing as cubes, work together in order to reach the goal at the end of each level. The game features custom-made levels which include obstacles such as barriers that must be activated by switches. In order to complete each level, the two players must link up to become a rectangular prism and reach the goal in order to conquer Cube City. 
The game involves many different graphics features, including a toggle for transparency, which allows the user to see the level layout from any angle, unit collision, which allows implementation of walls to allow for more diverse puzzle design, and projectile physics, which provides challenging obstacles to avoid in each level. 


Roles:

Ben: 
	My main role was to help code and display the levels that we have in the game. This involved learning how to create and display the maps, including the walls/obstacles that obstruct the players, and laying out the levels such that they can be completed without getting stuck. One of the biggest obstacles I faced was approaching one of our advanced topics, shadows, because we could not figure out how to get the masking to work and create a reliable shadow with our resources. We decided to rely on the use of the tiny graphics library, which made a lot of things simple, but the shadows feature became harder to implement, so we decided not to implement it and decided to try something else (projectile physics).

Anderson: 
	My main role involved designing levels to traverse and providing input on the different types of obstacles that could be involved in the game. We came up with ideas for the game to be multiplayer instead of single player, and then fleshed this idea out into a cooperative game where the multiple players can link up to complete the level.

Subhodh:
	 My main role was to help implement the basic movement functions of each player, as well as implement the advanced features of transparency and projectile physics. The collision demo and inertia demos that were provided by Garrett both helped in implementing this function. I was able to implement the transparency function in order to view the map and cubes from multiple perspectives, and implemented the projectile physics using the demos as inspiration. I wanted to have blocks that fell at a constant rate to make the game a little more challenging for each player. I worked to try and get the shadow effects to work, but despte many different efforts I discovered that the tiny graphics library, something that we relied on for a large portion of our project, made it more difficult to implement shadow effects so I decided to work on the projectiles/collision instead. I also implemented the function that allowed the two players to join together and move as one player.

Zachary:
	 My main role involved implementing the collision detection and movement of the cubes through the level. I was able to create the walls and include switches that had to be pressed in order to proceed in each level, as well as create barriers for the blocks so that the user cannot freely move off the terrain. Additionally, if the blocks tried to move off when they combined into a rectangular prism, but there wasn't space to move in that direction, the game would prevent the user from moving. I also helped implement the objective space which the user has to land on in order to complete each level.




Advanced Features:

Collision (and collision detection): 
	The blocks in our game have collision detection, so that each block cannot pass through another. The player blocks additionally detect for collision from outside projectiles, which can 'kill' the player if they collide. 

Projectile Physics: 
	We implemented projectile physics in our game by having rocks that fall at a rapid rate in each level. The projectiles fall and strike a specific spot, and if the user steps on that spot as the projectile strikes it, the user will die and have to start over. The physics were implemented with assistance from the demos and slides provided by the TA team.
 
Transparency: Transparency was implemented by 