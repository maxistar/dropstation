// Watering

$fn = 100;

body_thickness = 2;

box_length = 104-15;
box_width = 29;
box_height = 40;
sensor_thickness = 1.5;
sensor_width = 22;

round_radius = 5;

cut_position = 20;
fitting_gap = 0.3;
horisontal_gap = 8;

sensor_offset_1 = 27;
sensor_offset_2 = 15;

tube_radius = 2;




module box_outline(side_offset=0) {

  minkowski() {
    cube([box_length-round_radius*2-side_offset, box_width-round_radius*2-side_offset, box_height-round_radius*2-side_offset], center=true);
    sphere(r=round_radius);
  }

}

module outer_outline(side_offset=0) {
    box_outline(side_offset);
}

module inner_outline(inner_offset=0) {
    box_outline(body_thickness*2-inner_offset);
}

module hollow_shell(side_offset=0, inner_offset=0) {
    difference() {
        outer_outline(side_offset);
        inner_outline(inner_offset);
    }   
}

module upper_part() {
    
    difference() {
      hollow_shell(0, 0);
      translate([-box_length-box_length/2+cut_position, 0, 0]) {
        cube([box_length*2, box_length*2, box_length*2], center=true);
      }
    }
    
    difference() {
      hollow_shell(0, body_thickness+fitting_gap);
      translate([-box_length-box_length/2+cut_position-horisontal_gap, 0, 0]) {
        cube([box_length*2, box_length*2, box_length*2], center=true);
      }
    }
    
}

module bottom_outer_part() {
    intersection() {
        hollow_shell();
        translate([-box_length-box_length/2+cut_position, 0, 0]) {
          cube([box_length*2, box_length*2, box_length*2], center=true);
        }
    }
    
    intersection() {
        hollow_shell(body_thickness);
        translate([-box_length-box_length/2+cut_position+horisontal_gap, 0, 0]) {
          cube([box_length*2, box_length*2, box_length*2], center=true);
        }
    }
    
        translate([-box_length/2+2, 0, box_height/2 - (box_height/2)*(sensor_offset_1 / sensor_offset_2)/2])
        cube([2, sensor_width+2, sensor_thickness+3], center=true);
}


module bottom_part() {
    
    difference() {
      bottom_outer_part();
      translate([-box_length/2, 0, box_height/2 - (box_height/2)*(sensor_offset_1 / sensor_offset_2)/2])
        cube([box_length, sensor_width, sensor_thickness], center=true);


    translate([-40, 0, 12]) {  
      rotate([90, 0, 0])
        cylinder(r=tube_radius, h=box_height, center=true);
    }
    }
  
    




}





bottom_part();

//translate([50, 0, 0]) {
//  upper_part();  
//}