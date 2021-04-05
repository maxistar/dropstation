$fn=150;

pumpDiametr = 60;
pumpHeight = 85;

podBigDiametr = 235;
podSmallDiametr = 100;
podHeight = 120;
podThickness = 20;
podTorDiametr = 20;
podGroundOffset = 0;
bevelRadius = 2.5;

wallThikness = 2;

podYOffset = 30;
podXOffset = 25;

cutter1XOffset = 10;
cutter1ZOffset = 30;
cutter2ZOffset = 35;

cutWidth = 5;

cutOffset = 0.3;

clackWidth = 15;
rollsRaduis = 1;


module cut() {
    intersection() {
        difference() {
            minkowski(){
                sphere(r=bevelRadius-wallThikness/2);
                    cylinder(pumpHeight,d=pumpDiametr, center=true); 
            };
            minkowski(){
                sphere(r=bevelRadius-wallThikness);
                    cylinder(pumpHeight,d=pumpDiametr, center=true); 
            };
            innerCutter(0);
            rolls(cutOffset);
        };
        outerCutter(0);
    };
}

module coverOutline() {
    intersection() {
      difference() {
        minkowski(){
            sphere(r=bevelRadius);
            cylinder(pumpHeight,d=pumpDiametr, center=true); 
        };
        minkowski(){
            sphere(r=bevelRadius-wallThikness);
                cylinder(pumpHeight,d=pumpDiametr-cutOffset, center=true); 
        };
      };
      outerCutter(cutOffset);
    }
}

module bodyOutline() {
    difference() {
        minkowski(){
            sphere(r=bevelRadius);
            cylinder(pumpHeight,d=pumpDiametr, center=true); 
        };
        translate([podBigDiametr/2,-podYOffset,-podHeight/2+podXOffset])
        pod();
    }
}

module bodyInline() {
    difference() {
        minkowski(){
            sphere(r=bevelRadius-wallThikness);
                cylinder(pumpHeight,d=pumpDiametr, center=true); 
        };
        translate([podBigDiametr/2,-podYOffset,-podHeight/2+podXOffset])
            podInner();
    } 
}

module bodyCutted() {
    difference() {
        bodyOutline();
        outerCutter(0);
        bodyInline();
    }
}

module innerCutter(someOffset) {
     translate([-podHeight/2-cutter1XOffset-cutWidth-someOffset, 0,-podHeight/2+cutter1ZOffset-cutWidth-someOffset])
            cube([podHeight, podHeight, podHeight], center=true);

        translate([0, 0,-podHeight/2-cutter2ZOffset-cutWidth-someOffset])
            cube([podHeight, podHeight, podHeight], center=true);
}

module outerCutter(someOffset) {
     translate([-podHeight/2-cutter1XOffset-someOffset, 0,-podHeight/2+cutter1ZOffset-someOffset])
            cube([podHeight, podHeight, podHeight], center=true);

        translate([0, 0,-podHeight/2-cutter2ZOffset-someOffset])
            cube([podHeight, podHeight, podHeight], center=true);
}

module pod() {
    union() {        
        cylinder(podHeight,d2=podBigDiametr, d1=podSmallDiametr, center=true); 
        
        rotate_extrude(convexity = 10) {
            translate([podBigDiametr/2-podTorDiametr/2, podHeight/2, 0])
                circle(d=podTorDiametr);
        }
    }
}


module podInner() {
    union() {        
        cylinder(podHeight-0.1,d2=podBigDiametr+bevelRadius*2-wallThikness*2, d1=podSmallDiametr+bevelRadius*2-wallThikness*2, center=true); 
        
        rotate_extrude(convexity = 10) {
            translate([podBigDiametr/2-podTorDiametr/2, podHeight/2, 0])
                circle(d=podTorDiametr+bevelRadius*2-wallThikness);
        }
    }
}

module bodyWithCut() {
    union() {
       bodyCutted();
       cut();
    }
}

module coverCutted() {
  difference() {
    coverOutline();
        difference() {
            minkowski(){
                sphere(r=bevelRadius-wallThikness/2+cutOffset);
                    cylinder(pumpHeight,d=pumpDiametr, center=true); 
            };
            innerCutter(cutOffset);
        };
  }
}

module coverClack() {
    intersection() {
    difference() {
        cylinder(pumpHeight,d=pumpDiametr+bevelRadius*2-wallThikness*2-cutOffset/2, center=true);
        cylinder(pumpHeight,d=pumpDiametr+bevelRadius*2-wallThikness*2-cutOffset/2-wallThikness*2, center=true);
    };
    translate([-30,0,25])
        cube([clackWidth, clackWidth, clackWidth/1.5], center=true);
    }
}

module rolls(cutOffset) {
    union() {
    translate([-13,-29.1,20])
        sphere(r=rollsRaduis+cutOffset, center=true);
    translate([-13,-29.1,-25])
        sphere(r=rollsRaduis+cutOffset, center=true);
    translate([-13,29.1,20])
        sphere(r=rollsRaduis+cutOffset, center=true);
    translate([-13,29.1,-25])
        sphere(r=rollsRaduis+cutOffset, center=true);
    };
}

module coverWithClack() {
    union() {
       coverCutted();
       coverClack();
       intersection() {
           rolls(0);
           cylinder(pumpHeight,d=pumpDiametr+bevelRadius*2, center=true);
       };
    }
}


//coverWithClack();


bodyWithCut();

