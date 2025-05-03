$fn=150;

battery_18500_length = 50;
battery_18500_radius = 9;
battery_18500_button_height = 3;
battery_18500_button_radius = 3;

pot_height = 120; 
pot_radius_top = 60;
pot_radius_bottom = 60;
pot_width = 8;
pot_inner_height = 5;


body_height = 85;
body_width = 45;
body_depth = 53;

body_roundness = 10;
body_thickness = 2;

body_y_offset = 70;
body_z_offset = 100;

body_lid_mask_size = 100;


small_offset = 0.01;

 
  
lid_gap = 0.4;
lid_side_gap = 0.5;
thickness_lid_gap = 0.2;


top_lid_z_offset = 26;
side_lid_spere_z_offset = 0;




clack_offset = 5; 
cut_y_offset =10;
cut_z_offset = 15;


    
clack_spere_radus = 0.8;
    
tube_radius = 2;

// todo
// add clacks
// tune gaps

module body_outer_outline(outer_offset=0) {
    minkowski() {
      sphere(body_roundness + outer_offset);
      cube([body_width-body_roundness*2, body_depth-body_roundness*2, body_height-body_roundness*2], center=true);
    }
}

module body_outline_p(outer_offset=0, inner_offset=0) {
    difference() {
        body_outer_outline(outer_offset);
        
        body_outer_outline(outer_offset=- body_thickness + inner_offset);
        
    }
}

// top lid

module body_inner_outline_top_lid() {
    
    difference() {
    
        body_outline_p(outer_offset= - body_thickness/2+thickness_lid_gap/2);
    
        
        translate([0,0,body_lid_mask_size/2+top_lid_z_offset+clack_offset])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
        
        // cutting cube
        translate([0,0,-body_lid_mask_size/2+top_lid_z_offset-small_offset])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
    
    top_lid_clack_spheres(-thickness_lid_gap);
}

module top_lid_clack_spheres(radius_offset = 0) {
    
    small_clack_sphere = clack_spere_radus;
    
    top_lid_spere_y_offset = body_depth/2 - body_thickness / 2 - 0.2;
    top_lid_spere_z_offset = top_lid_z_offset + clack_offset/2;
    
    translate([0,top_lid_spere_y_offset,top_lid_spere_z_offset])
      sphere(r=small_clack_sphere + radius_offset);
    
    translate([0,-top_lid_spere_y_offset,top_lid_spere_z_offset])
      sphere(r=small_clack_sphere + radius_offset);
    
}

// top lid 


module top_lid() {
    
    // thin part
    difference() {
        body_outline_p(inner_offset=body_thickness/2+thickness_lid_gap/2);    
    
        translate([0, 0, -body_lid_mask_size/2 + top_lid_z_offset + lid_gap])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
        
        top_lid_clack_spheres();
    }
    
    // thick part
    difference() {
        body_outline_p();   
        translate([0, 0, -body_lid_mask_size/2+top_lid_z_offset+clack_offset+lid_gap])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}


module body_outer_outline_half() {
    
    difference() {        
        body_outline_p(inner_offset = body_thickness/2 + thickness_lid_gap/2);        
        translate([0, -body_lid_mask_size/2, 0])
            cube([body_lid_mask_size, body_lid_mask_size, body_lid_mask_size], center = true);
    }
}

module body_hollow_outline() {

  difference() {
  
    body_outline_p();
    
    translate([0, body_lid_mask_size/2 + cut_y_offset - clack_offset - lid_gap, -body_lid_mask_size/2 + cut_z_offset + clack_offset + lid_side_gap ])     
      body_lid_cut();
  }  
}

module body_lid_cut() {
    cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
}


module pot_inner() {
  difference() {
    difference() {
      cylinder(r1=pot_radius_bottom+body_thickness, r2=pot_radius_top+body_thickness, h=pot_height+body_thickness);
      
      translate([0,0,-small_offset])
        cylinder(r1=pot_radius_bottom-pot_width-body_thickness, r2=pot_radius_top-pot_width-body_thickness, h=pot_height+body_thickness+small_offset*2);
    }
  
    difference() {
      cylinder(r1=pot_radius_bottom, r2=pot_radius_top, h=pot_height);
      
      translate([0,0,-small_offset])
        cylinder(r1=pot_radius_bottom-pot_width, r2=pot_radius_top-pot_width, h=pot_height+small_offset*2);
    }
  
  }
}

module body_inner() {
  // inner body part
  difference() {
    intersection() {  
        translate([0,body_y_offset,body_z_offset])
        body_outer_outline();    
    pot_inner();
    
    }
    cylinder(r1=pot_radius_bottom, r2=pot_radius_top, h=pot_height-pot_inner_height);
  }
}


module body_with_size_cut() {
  union() {  
    difference() {
      translate([0, body_y_offset, body_z_offset])
          body_hollow_outline();
      pot();
    }
  
  
    // botton cut  
    difference() {
      translate([0, body_y_offset, body_z_offset]) {
        body_outer_outline_half();
      }
      translate([0, body_y_offset, body_z_offset]) {
        translate([0, body_lid_mask_size/2 + cut_y_offset, -body_lid_mask_size/2 + cut_z_offset ])
          body_lid_cut();

          side_lid_clack_spheres(thickness_lid_gap);
          
      }
      
    }
     
  }
}




module body() {
  
  difference() {
    body_with_size_cut();
  
  
  translate([0, body_y_offset, body_z_offset + top_lid_z_offset])
    translate([0, 0, body_lid_mask_size / 2])
      cube([body_lid_mask_size, body_lid_mask_size, body_lid_mask_size], center = true);

    // tube for water input
  translate([-23,body_y_offset+1,body_z_offset-body_height/2+12])
    //translate
    rotate([0, 90, 0])
    cylinder(r=tube_radius, h=10, center=true);

    // tube for water input
  translate([-23,body_y_offset+1,body_z_offset-body_height/2+40])
    //translate
    rotate([0, 90, 0])
    cylinder(r=tube_radius, h=10, center=true);


  }
  
  
    
  translate([0,body_y_offset,body_z_offset])
    body_inner_outline_top_lid();
    
}



module side_body_outer_outline_half_lid() {

     difference() {
        body_outline_p();    

        // cutting cube
        translate([0, -body_lid_mask_size/2, 0])
            cube([body_lid_mask_size, body_lid_mask_size, body_lid_mask_size], center = true);
    }
}

module side_body_inner_outline_half_lid() {
    
    difference() {
        body_outline_p(outer_offset = - body_thickness/2 - thickness_lid_gap/2);    
        
        // cutting cube
        translate([0, -body_lid_mask_size/2, 0])
            cube([body_lid_mask_size, body_lid_mask_size, body_lid_mask_size], center = true);
    }
    
}


module side_lid_outer() {
    intersection() {
    
      side_body_outer_outline_half_lid();
       
      translate([0, body_lid_mask_size/2 + cut_y_offset + lid_gap, -body_lid_mask_size/2 + cut_z_offset - lid_side_gap ])
    
          cube([body_lid_mask_size, body_lid_mask_size, body_lid_mask_size], center = true);
    }    
}

module side_lid_inner() {
    intersection() {
    
      side_body_inner_outline_half_lid();
       
      translate([0, body_lid_mask_size/2 + cut_y_offset + lid_side_gap - clack_offset,-body_lid_mask_size/2 + cut_z_offset + clack_offset - lid_side_gap ])
    
          cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
    
}







// side_lid_vertical_clack();

module side_lid_clack_spheres(radius_offset = 0, side_offset = 0) {
    
    spheres_bottom_shift = 30;
    additional_side_offset = -0.4;
    
    small_clack_sphere = clack_spere_radus;
    
    top_lid_spere_x_offset = body_width/2 - body_thickness / 2;
    top_lid_spere_z_offset = top_lid_z_offset + clack_offset/2;
    
    translate([top_lid_spere_x_offset+side_offset+additional_side_offset, cut_y_offset - clack_offset / 2, side_lid_spere_z_offset-spheres_bottom_shift])
      sphere(r=small_clack_sphere + radius_offset);
    
    translate([-top_lid_spere_x_offset-side_offset-additional_side_offset, cut_y_offset - clack_offset / 2,side_lid_spere_z_offset-spheres_bottom_shift])
      sphere(r=small_clack_sphere + radius_offset);
    
}




module side_lid() {
    side_lid_outer();
    side_lid_inner();
    
    side_lid_clack_spheres(-thickness_lid_gap);
    
}

module lid_cutted() {
    difference() {
    lid();
    
    translate([body_lid_mask_size/2,0,0])
    cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
    
}


// pot

module pot() {
  difference() {
    cylinder(r1=pot_radius_bottom, r2=pot_radius_top, h=pot_height);
    translate([0,0,pot_height-pot_inner_height+small_offset])
    cylinder(r1=pot_radius_top-pot_width, r2=pot_radius_top-pot_width, h=pot_inner_height);
  }    
}


// parts

module battery_body() {
    cylinder(h=battery_18500_length-battery_18500_button_height ,r=battery_18500_radius);
    
  translate([0,0,battery_18500_length-battery_18500_button_height])
  cylinder(h=battery_18500_button_height ,r=battery_18500_button_radius);
}

module battery() {
    
  holder_inner_side_offset = 0.5;
  holder_inner_spring_offset = 5;
  holder_thickness = 1.5;
    
    
  holder_inner_width = battery_18500_radius*2 + holder_inner_side_offset*2;
  holder_inner_length = battery_18500_length + holder_inner_spring_offset;
  holder_inner_depth = battery_18500_radius*1.3;
    
    
  holder_outer_width = holder_inner_width + holder_thickness * 2;
  holder_outer_length = holder_inner_length + holder_thickness * 2;
  holder_outer_depth = holder_inner_depth + holder_thickness;
    
  holder_cut_radius = 1.5;
  wire_cut_radius = 0.7;
    
  difference() {
    union() {  
      difference() {
        translate([-holder_outer_width/2,-battery_18500_radius-holder_thickness-small_offset,-holder_thickness])  
          cube([holder_outer_width, holder_outer_depth, holder_outer_length]);

        translate([-holder_inner_width/2,-battery_18500_radius,0])  
          cube([holder_inner_width, holder_inner_depth, holder_inner_length]);
      }
  
      translate([0,0, -holder_thickness])
        cylinder(h=holder_thickness, r=battery_18500_radius+holder_thickness );
  
      translate([0,0, holder_outer_length - holder_thickness*2])
        cylinder(h=holder_thickness, r=battery_18500_radius+holder_thickness );
    }
  
    translate([0,0,-battery_18500_length/2])
      cylinder(r = holder_cut_radius, h = battery_18500_length*2);
    
      translate([0, battery_18500_button_radius/3, battery_18500_length + holder_inner_spring_offset - holder_thickness])
    rotate([0,90,0])
        translate([0, 0, -battery_18500_length])
            cylinder(r = wire_cut_radius, h = battery_18500_length*2);
  
  translate([0, -battery_18500_button_radius/3, battery_18500_length + holder_inner_spring_offset - holder_thickness])
    rotate([0,90,0])
        translate([0, 0, -battery_18500_length])
            cylinder(r = wire_cut_radius, h = battery_18500_length*2);
  }
    
  //battery_body();
}

module peritstalic_pumpe() {
    
    intersection() {
      cube([40, 15, 28], center = true);
      cylinder(h=28, r=10, center = true);
    }
    
    translate([0, 0, 10])
    cylinder(h=50, r=3, center = true);
    
    translate([17,0,28])
    rotate([0, 90, 0])
    cylinder(h=12, r=13, center = true);
    
    translate([5,0, 28])
    cube([13, 35, 30], center = true);
    
    
}



module body_combined() {
  union() {
    body();
    body_inner();
    
    //translate([-8, 71, 123]) 
    //  rotate([0,180,6.5])
    //    battery();
  }
}

//body_combined();

vertical_tech_offset = 20;
horisontal_tech_offset = 20;


//translate([0, body_y_offset, body_z_offset + vertical_tech_offset])
//  top_lid();



translate([0, body_y_offset + horisontal_tech_offset, body_z_offset])
  side_lid();





//translate([0,75,105]) 
//  rotate([0,180-15,270])
//    peritstalic_pumpe();

