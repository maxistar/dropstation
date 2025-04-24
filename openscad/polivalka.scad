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
body_width = 30;
body_depth = 25;

body_roundness = 10;
body_thickness = 2;

body_y_offset = 63;
body_z_offset = 100;

body_lid_mask_size = 100;


small_offset = 0.01;

  cut_y_offset = 12;
  cut_z_offset = 20;
  clack_offset = 3;  
  
lid_gap = 0.4;

top_lid_z_offset = 26;


    clack_width = 5;
    clack_height = 2;
    clack_length = 15;
    
    clack_spere_radus = 1.1;

module body_outer_outline(outer_offset=0) {
    minkowski() {
      sphere(body_roundness + outer_offset);
      cube([body_width, body_depth, body_height-body_roundness*2], center=true);
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
    
        body_outline_p(outer_offset= - body_thickness/2);
    
        
        translate([0,0,body_lid_mask_size/2+top_lid_z_offset+clack_offset])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
        
        // cutting cube
        translate([0,0,-body_lid_mask_size/2+top_lid_z_offset-small_offset])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}

// top lid 


module top_lid() {
    
    difference() {
        body_outline_p(inner_offset=body_thickness/2+lid_gap);    
    
        translate([0, 0, -body_lid_mask_size/2+top_lid_z_offset+lid_gap])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
    
    difference() {
        body_outline_p();   
        translate([0, 0, -body_lid_mask_size/2+top_lid_z_offset+clack_offset+lid_gap])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}


module body_outer_outline_half() {
    
    difference() {        
        body_outline_p(outer_offset =- body_thickness/2);        
        translate([0,-body_lid_mask_size/2,0])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}

module body_hollow_outline() {

  difference() {
  
    body_outline_p();
    
    translate([0,body_lid_mask_size/2+cut_y_offset,-body_lid_mask_size/2+cut_z_offset ])
    
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
      translate([0,body_y_offset,body_z_offset])
          body_hollow_outline();
      pot();
  }
  
  
  // botton cut  
  difference() {
    translate([0,body_y_offset,body_z_offset]) {
        body_outer_outline_half();
    }
    translate([0,body_y_offset,body_z_offset])
        translate([0,body_lid_mask_size/2+cut_y_offset+clack_offset,-body_lid_mask_size/2+cut_z_offset-clack_offset ])
      body_lid_cut();
  } 
  }
}




module body() {
  
  difference() {
    body_with_size_cut();
  
  
  translate([0,body_y_offset,body_z_offset+top_lid_z_offset])
    translate([0,0,body_lid_mask_size/2])
      cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);

  translate([14,body_y_offset+5,body_z_offset-body_height/2])
    //translate
    cylinder(r=2.5, h=10, center=true);


  translate([0,body_y_offset,body_z_offset])
  translate([0, body_depth - clack_length + clack_spere_radus, -body_height/2 +clack_spere_radus+body_thickness-0.7])
      sphere(r=clack_spere_radus+lid_gap);
        
  }
  

  

    
  translate([0,body_y_offset,body_z_offset])
    body_inner_outline_top_lid();
    
}



module body_outer_outline_half_lid() {

     difference() {
        body_outline_p(inner_offset=body_thickness/2+lid_gap);    

        // cutting cube
        translate([0,-body_lid_mask_size/2,0])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}

module body_inner_outline_half_lid() {
    
    difference() {
        body_outline_p();    
        
        // cutting cube
        translate([0,-body_lid_mask_size/2,0])
            cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }
}


module lid_outer() {
    intersection() {
    
      body_outer_outline_half_lid();
       
      translate([0,body_lid_mask_size/2+cut_y_offset+lid_gap,-body_lid_mask_size/2+cut_z_offset-lid_gap ])
    
          cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }    
}

module lid_inner() {
    intersection() {
    
      body_inner_outline_half_lid();
       
      translate([0,body_lid_mask_size/2+cut_y_offset+lid_gap+clack_offset,-body_lid_mask_size/2+cut_z_offset-lid_gap-clack_offset ])
    
          cube([body_lid_mask_size,body_lid_mask_size,body_lid_mask_size], center = true);
    }    
}

module side_lid() {
    lid_outer();
    lid_inner();
    


    // vertical clack    
    translate([0,cut_y_offset+2, -body_height/2+body_thickness+lid_gap*2+0.7])
      cube([clack_width,clack_length-6,clack_height], center = true);

    // horizontal clack
    translate([7, body_depth-body_thickness-lid_gap*2-2.6, cut_z_offset-5])
      cube([clack_width,clack_height,clack_length], center = true);
    
    translate([0, body_depth - clack_length + clack_spere_radus, -body_height/2 +clack_spere_radus+body_thickness-0.4])
      sphere(r=clack_spere_radus);



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
  holder_thickness = 1;
    
    
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
        cylinder(h=holder_thickness*1.5, r=battery_18500_radius+holder_thickness );
  
      translate([0,0, holder_outer_length - holder_thickness*2])
        cylinder(h=holder_thickness*1.5, r=battery_18500_radius+holder_thickness );
    }
  
    translate([0,0,-battery_18500_length/2])
      cylinder(r = holder_cut_radius, h = battery_18500_length*2);
    
      translate([0, battery_18500_button_radius/2, battery_18500_length + holder_inner_spring_offset - holder_thickness])
    rotate([0,90,0])
        translate([0, 0, -battery_18500_length])
            cylinder(r = wire_cut_radius, h = battery_18500_length*2);
  
  translate([0, -battery_18500_button_radius/2, battery_18500_length + holder_inner_spring_offset - holder_thickness])
    rotate([0,90,0])
        translate([0, 0, -battery_18500_length])
            cylinder(r = wire_cut_radius, h = battery_18500_length*2);
  }
    
  //battery_body();
}


module pumpe() {
  translate([0, 0, 18])
    cube([18, 8, 16], center = true);

  difference() {
  cylinder(h=20, r=5, center=true);
  translate([0,6.5,0])
    cube([15,5,21], center=true);
  translate([0,-6.5,0])
    cube([15,5,21], center=true);
  }

  translate([3,0,26])
    cylinder(h=5, r=2);
  translate([-5,0,26])
    cylinder(h=5, r=2);
}



module body_combined() {
union() {
  body();
  body_inner();
    
  translate([-8, 71, 121]) 
    rotate([0,180,6.5])
      battery();
}
}

//body_combined();


//translate([0,body_y_offset,body_z_offset + 30])
//  top_lid();





//translate([0,body_y_offset+30,body_z_offset])
  side_lid();


// ody_outer_outline_half();

//components


/*
translate([13,70,95]) 
  rotate([0,180,180])
    pumpe();
*/

