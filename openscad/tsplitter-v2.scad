$fn = 150;

internalDiametr = 4;
externalDiametr = 5;
coneHeight = 3;
coneOffset = 1.5;
bodyThickness = 1;

jointDiametr = 7;

thingHeight = 25;
tubesOffset = 8;

module thingNoCones(bodyOffset, barellOffset) {
    cylinder(d=internalDiametr-bodyOffset*2, h=thingHeight+bodyOffset, center=true);

    translate([tubesOffset,0,0]) {
        cylinder(d=internalDiametr-bodyOffset*2, h=thingHeight/2+bodyOffset);    
    }

    translate([-internalDiametr/2+bodyOffset,0,0])    
        rotate([0,90,0])
        cylinder(d=jointDiametr-bodyOffset*2+barellOffset, h=tubesOffset+internalDiametr-bodyOffset*2);
}

module thingOutline() {
    thingNoCones(0, 1);
    
    translate([-jointDiametr/4, 0, 0]) {
        sphere(d=jointDiametr+1);
    }

    translate([jointDiametr/4+tubesOffset, 0, 0]) {
        sphere(d=jointDiametr+1);
    }
    
    //cone 3
    translate([0,0,thingHeight/2-coneHeight/2-coneOffset])
    cylinder(d1=externalDiametr, d2=internalDiametr, h=coneHeight, center=true);

    //cone 2
    translate([0,0,-thingHeight/2+coneHeight/2+coneOffset])
    cylinder(d1=internalDiametr, d2=externalDiametr, h=coneHeight, center=true);

    //cone 3
    translate([tubesOffset,0,0]) {
        translate([0,0,thingHeight/2-coneHeight/2-coneOffset])
            cylinder(d1=externalDiametr, d2=internalDiametr, h=coneHeight, center=true);
    }
}

module thingInline() {
    thingNoCones(bodyThickness,0);
}

difference() {
    thingOutline();
    thingInline();
}