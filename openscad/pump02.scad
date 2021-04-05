$fn=100;

podBigDiametr = 235;
podSmallDiametr = 110;
podHeight = 120;
podThickness = 20;
podTorDiametr = 20;
podGroundOffset = 0;
bevelRadius = 2.5;

pumpMotorDiametr = 32;
pumpMotorLength = 22;
pumpMotorOffset = 2;
pumpBodyLength = 20;
pumpBodyDiametr = 43;
pumpMaxWidth = 56;

bodyThikness = 2;
connectionOffset = 0.2;

bodyXOffset = 117;
bodyZOffset = 30;
cutterWidth = 80;
cutterXOffset = 170;
bodyLenth = 25;
bodyWidth = 28;
bodyHeight = 71;

bodyRoundness = 20;

faskaWidth = 8;

rollsDiametr = 3;

tubeDiametr = 5;
wireDiametr = 1.8;
//wireLength = 6;

module pump() {
    union() {
        cylinder(pumpMotorLength, d=pumpMotorDiametr, center=true); 
        translate([pumpMotorOffset, 0, pumpBodyLength]) {
            cylinder(pumpBodyLength, d=pumpBodyDiametr, center=true); 
            cube([10,pumpMaxWidth,5], center = true);
            rotate([0,0,45])
            cube([10,pumpMaxWidth,15], center = true);
            rotate([0,0,-45])
            cube([10,pumpMaxWidth,15], center = true);
        }
    }    
}

module pod() {
    union() {        
        cylinder(podHeight,d2=podBigDiametr, d1=podSmallDiametr, center=true); 
        
        rotate_extrude(convexity = 10) {
            translate([podBigDiametr/2-podTorDiametr/2, podHeight/2, 0])
                circle(d=podTorDiametr+1);
        }
    }
}

module podInner() {
    union() {        
        cylinder(podHeight-0.1,d2=podBigDiametr+bodyThikness*2, d1=podSmallDiametr+bodyThikness*2, center=true); 
        
        rotate_extrude(convexity = 10) {
            translate([podBigDiametr/2-podTorDiametr/2, podHeight/2, 0])
                circle(d=podTorDiametr+bodyThikness*2);
        }
    }
}


module bodyOutlineCutted() {
    difference() {
        translate([bodyXOffset,0,bodyZOffset]) {
            outerOutline(0);
        };
        pod();
        coverCutter(connectionOffset);
    }
}

module coverCutter(offset) {
        translate([167-offset,0,-5+offset]) {
            cube([cutterWidth,130,130], center=true);
        }
        translate([120,0,-72+offset]) {
            cube([cutterWidth,130,130], center=true);
        }
}

module rolls(offset) {
    union() {
        translate([7,bodyWidth+2,20]) {
            sphere(d=rollsDiametr+offset);
        }
        translate([7,bodyWidth+2,-20]) {
            sphere(d=rollsDiametr+offset);
        }
        translate([7,-(bodyWidth+2),20]) {
            sphere(d=rollsDiametr+offset);
        }
        translate([7,-(bodyWidth+2),-20]) {
            sphere(d=rollsDiametr+offset);
        }
        //translate([6,0,-44]) {
        //    sphere(d=rollsDiametr+offset);
        //}
        //translate([6,0,44]) {
        //    sphere(d=rollsDiametr+offset);
        //}

    }
}

module coverCutted() {
    union() {
    //outer sphere
        difference() {
            intersection() {
                translate([bodyXOffset,0,bodyZOffset]) {
                    outerOutline(0);
                };
                coverCutter(0);
            } 
       //translate([cutterXOffset-cutterWidth,0,60]) {
       //    cube([cutterWidth,130,130], center=true);
       //};
       translate([bodyXOffset,0,bodyZOffset]) {
            outerOutline(bodyThikness);
       };
        };
    
    //inner sphere
    difference() {
        intersection() {
            translate([bodyXOffset,0,bodyZOffset]) {
                outerOutline(bodyThikness/2+connectionOffset);
            };
            coverCutter(faskaWidth);
        }
       
       translate([bodyXOffset,0,bodyZOffset]) {
            outerOutline(bodyThikness);
       };
       
       translate([bodyXOffset,0,bodyZOffset]) {
            rolls(connectionOffset);
       };
       //translate([bodyXOffset,0,bodyZOffset]) {
       //     splitters();
       //}; 
    }
    }
}



module splitters() {
    translate([0,6,0])
        cube([19,0.5,100], center=true);
    translate([0,-6,0])
        cube([19,0.5,100], center=true);

    translate([0,0,27])
        cube([19,100,0.5], center=true);
    translate([0,0,14])
        cube([19,100,0.5], center=true);

    translate([0,0,-27])
        cube([19,100,0.5], center=true);
    translate([0,0,-14])
        cube([19,100,0.5], center=true);

}

module innerOutlineCutted() {
    difference() {
        translate([bodyXOffset,0,bodyZOffset]) {
            outerOutline(bodyThikness);
        }
        podInner();
    }
}

module bodyEmpty() {
    union() {
        difference() {
            bodyOutlineCutted();
            innerOutlineCutted();
        
            intersection() {
                translate([bodyXOffset,0,bodyZOffset]) {
                    outerOutline(bodyThikness/2);
                }; 
                coverCutter(faskaWidth+connectionOffset);
            }

        translate([115,-40,25]) {
            rotate([90,0,0]) {        
                cylinder(d=tubeDiametr, h=100, center=true);
            }
        }
        translate([115,0,15]) {
            rotate([90,0,0]) {
                wires();
            }
        }

        };

    
        translate([bodyXOffset,0,bodyZOffset]) {
            intersection() {
                outerOutline(0);
                rolls(0);
            }
        };
    }
}

module wires() {
    linear_extrude() {
    union(height=100) {
    translate([0, wireDiametr+wireDiametr/2, 0])
        circle(d=wireDiametr, center=true);
    translate([0, -wireDiametr-wireDiametr/2, 0])
        circle(d=wireDiametr, center=true);
    square(size=[wireDiametr, wireDiametr+wireDiametr+wireDiametr], center=true);    
    }
    }
}

module outerOutline(thiknessDiff) {
    minkowski(){
        sphere(r=bodyRoundness-thiknessDiff);
        cube([bodyLenth-bevelRadius*2, bodyWidth-bevelRadius*2,bodyHeight-bevelRadius*2], center = true);
    }
}


//translate([130,0,0]) {
//    rotate([0,270,0])
//        pump();
//}

//translate([120,0,35]) {
//    outerOutline();
//}

//bodyEmpty();

coverCutted(); 


