$fn=150;

spereDiametr = 7.5;
bodyThickness = 1;
armLength = 15;
arm1Diametr = 4;
arm2Diametr = 6;
arm3Diametr = 6;
arm4Diametr = 6;
diametrOffset = 1.5;
coneLength = 4;
coneOffset = 1;
internalOffset = 1;

//splitAngle = 30;


module bodyOuter() {
    union() {
        
        sphere(d=spereDiametr, center=true);

        translate([0, 0, armLength/1.5]) {
            sphere(d=spereDiametr, center=true);
                rotate([0, 90, 0]) {
            cylinder(armLength,d=arm1Diametr);
            translate([0, 0, armLength-coneLength-coneOffset])
                cylinder(coneLength,d2=arm1Diametr, d1=arm1Diametr+diametrOffset);
            translate([0, 0, armLength-coneLength-coneOffset-coneOffset])
                cylinder(coneOffset,d1=arm1Diametr, d2=arm1Diametr+diametrOffset);
            }
        }


        //rotate([0, splitAngle, 0]) {
        cylinder(armLength/1.5,d=arm4Diametr);
        //translate([0, 0, armLength-coneLength-coneOffset])
        //    cylinder(coneLength,d2=arm1Diametr, d1=arm1Diametr+diametrOffset);
        //translate([0, 0, armLength-coneLength-coneOffset-coneOffset])
        //    cylinder(coneOffset,d1=arm1Diametr, d2=arm1Diametr+diametrOffset);
        //}

        rotate([0, 90, 0]) {
            cylinder(armLength,d=arm2Diametr);
            translate([0, 0, armLength-coneLength-coneOffset])
                cylinder(coneLength,d2=arm2Diametr, d1=arm2Diametr+diametrOffset);
            translate([0, 0, armLength-coneLength-coneOffset-coneOffset])
                cylinder(coneOffset,d1=arm2Diametr, d2=arm2Diametr+diametrOffset);
        }

        rotate([180, 90, 0]) {
            cylinder(armLength,d=arm3Diametr);
            translate([0, 0, armLength-coneLength-coneOffset])
                cylinder(coneLength,d2=arm3Diametr, d1=arm3Diametr+diametrOffset);
            translate([0, 0, armLength-coneLength-coneOffset-coneOffset])
                cylinder(coneOffset,d1=arm3Diametr, d2=arm3Diametr+diametrOffset);
        }
    }
}

module bodyInner() {
    union() {
    sphere(d=spereDiametr-bodyThickness*3, center=true);

        translate([0, 0, armLength/1.5]) {
            sphere(d=spereDiametr-bodyThickness*3, center=true);
            rotate([0, 90, 0]) {
                cylinder(armLength+internalOffset,d=arm1Diametr-bodyThickness*2);
            }
        }
            //rotate([0, splitAngle, 0]) {
    cylinder(armLength/1.5+internalOffset,d=arm4Diametr-bodyThickness*2);
            //}

        rotate([0, 90, 0]) {
            cylinder(armLength+internalOffset,d=arm2Diametr-bodyThickness*2);
        }

    rotate([180, 90, 0])
        cylinder(armLength+internalOffset,d=arm3Diametr-bodyThickness*2);
    }
}

difference() {
    bodyOuter();
    bodyInner();
}

      