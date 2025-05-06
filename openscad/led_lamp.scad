$fn=150;

outer_radius = 60;
outer_height = 20;
inner_radius = 40;
small_value = 0.1;
inner_thickness = 3;

holder_tube_radius = 2;
holder_tube_holder_thickness = 4;
holder_tude_distance = 45 + (holder_tube_radius + holder_tube_holder_thickness) * 2;



module holder() {
  difference() {
    cylinder(h=outer_height, r=holder_tube_radius + holder_tube_holder_thickness, center = true);
    
    translate([0, 0, -holder_tube_holder_thickness])
      cylinder(h=outer_height, r=holder_tube_radius, center = true);
  }
}

module outer_body() {


holder_y_offset = 55;


difference() {
cylinder(h=outer_height, r=outer_radius, center=true);

cylinder(h=outer_height+small_value, r=inner_radius, center=true);
}

translate([holder_tude_distance/2, holder_y_offset, 0])
holder();

translate([-holder_tude_distance/2, holder_y_offset, 0])
holder();
    
}

module inner_body() {
  difference() {
  cylinder(r1 = outer_radius - inner_thickness+4, r2 = outer_radius - inner_thickness - 12, h=outer_height, center= true);

  cylinder(r = inner_radius + inner_thickness, h=outer_height+holder_tube_holder_thickness, center= true);
  }
}


difference() {
  outer_body();
  translate([0, 0, -inner_thickness]) {
    inner_body();
  }
  
  wire_cut_y_offset = 5;
ring_width = outer_radius-inner_radius-1;

rotate([0, 0, 27.2])
translate([0, outer_radius-ring_width/2+3, wire_cut_y_offset])
rotate([0, 90, 90])
cylinder(r=holder_tube_radius, h=ring_width, center=true);

rotate([0, 0, -27.2])
translate([0, outer_radius-ring_width/2+3, wire_cut_y_offset])
rotate([0, 90, 90])
cylinder(r=holder_tube_radius, h=ring_width, center=true);
  
}





