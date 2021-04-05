$fn = 150;
smallWidth = 10.9;
thingHeight = 40.8;
innerHeight = 20;
radius = 4;

thingWidth = 180;
thingLength = 120;
smallOffset = 1;

tubeRadus = 8;
coverWidth = 25;
coverLength = 80;

module brickOutline(deminish) {
    difference() {
        cube([thingWidth-deminish*2,thingLength-deminish*2,thingHeight-deminish*2], center=true);
        translate([-smallWidth+deminish, 0, -innerHeight])
            cube([thingWidth,thingLength+smallOffset,thingHeight], center=true);
    }
}


//brickOutline(0);

module basementModel() {
    minkowski() {
        brickOutline(radius);
        sphere(r=radius);
    }
}




module coverBrick(deminish) {
    translate([thingWidth/2-coverLength/2+tubeRadus, 0, 0]) {
        difference() {
            cube([coverLength - deminish*2, coverWidth - deminish*2, thingHeight + tubeRadus*2 - deminish*2], center = true);
            translate([-tubeRadus*2-smallWidth+deminish,0,-20]) 
                cube([coverLength, coverWidth+smallOffset, thingHeight+ tubeRadus*2], center = true);
        
        }
    }
}

//coverBrick(0);

module hollowBody() {
  difference() {
    minkowski() {
        coverBrick(radius);
        sphere(r=radius);
    };
    minkowski() {
        coverBrick(radius+1);
        sphere(r=radius-1);
    }
  }
}

//coverBrick(radius);
//hollowBody();

//cube([50,thingLength+smallOffset,thingHeight*2], center=true);

difference() {
    hollowBody();
    basementModel();
    translate([-smallWidth, 0, 0])
            cube([thingWidth+2,thingLength+smallOffset,thingHeight-10], center=true);
    cube([50,thingLength+smallOffset,thingHeight*2], center=true);
    
}



basementModel();
