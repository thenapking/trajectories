let palette = {
  "Gold": {
    "bg_colour": "#303030",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#E0943C",
    "paper_roughness": 0.35
  },
  "Black": {
    "bg_colour": "#000000",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.65
  },
  "Navy": {
    "bg_colour": "#050124",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.75
  },
  "Racing Green": {
    "bg_colour": "#004225",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.65
  },
  "Neutral": {
    "bg_colour": "#F5F3EE",
    "paper_colour": "#4A4847",
    "pen_colour": "#000000",
    "paper_roughness": 0.2
  },
  "Grey": {
    "bg_colour": "#A0A4A2",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.15
  },
  "Slate": {
    "bg_colour": "#8EABC1",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.15
  },
  "Havelock": {
    "bg_colour": "#4AA2D9",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.15
  },
  "Harbour": {
    "bg_colour": "#EEE7E6",
    "paper_colour": "#6B6A68",
    "pen_colour": "#245590",
    "paper_roughness": 0.2
  },
  "Folio": {
    "bg_colour": "#245590",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#E0943C",
    "paper_roughness": 0.3
  },
  "Eden": {
    "bg_colour": "#0C554E",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#FFFFFF",
    "paper_roughness": 0.65
  },
  "Prussian Ink": {
    "bg_colour": "#FDF0D5",
    "paper_colour": "#FFFFFF",
    "pen_colour": "#003049",
    "paper_roughness": 0.3
  },
  
  "Ochre": {
    "bg_colour": "#EFDBD2",
    "paper_colour": "#111111",
    "pen_colour": "#CF4E14",
    "paper_roughness": 0.85
  },
  "Red Ink": {
    "bg_colour": "#FDF0D5",
    "paper_colour": "#111111",
    "pen_colour": "#D83D2A",
    "paper_roughness": 0.3
  }
}


let bg_colour, paper_colour, pen_colour, paper_roughness;
let squares = [];

let svg_canvas, regular_canvas;
let reg_w = 600, reg_h = 600;
let svg_w = 600, svg_h = 600;
let base_width = 7*svg_w/6;
let w, h, d, al;
let n = 60;
let svg_d = 50;
let displayScale;

let n_arr = [8, 12, 16, 24, 32, 40, 60, 80, 90, 100, 120];
let fill_styles = [5];
let fx_features, fx_params;

let border_width, border_offset;
const bw = 10

let max_depth = 2;

$fx.params([
  {
    id: "palette",
    name: "Palette",
    type: "select",
    options: {
      options: Object.keys(palette),
    },
  },
  {
    id: "paper",
    name: "Paper texture",
    type: "number",
    default: 3,
    options: {
      min: 1,
      max: 5,
      step: 1,
    },
  },
  {
    id: "n",
    name: "n",
    type: "select",
    options: {
      options: ["2","3","4","6"],
    },
  },
  {
    id: "crossing",
    name: "Intersect",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "parallel",
    name: "Parallel",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "glancing",
    name: "Glance",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "leaves",
    name: "Avoid",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "straight",
    name: "Straight",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "empty",
    name: "Emptyness",
    type: "number",
    options: {
      min: 0,
      max: 5,
      step: 1,
    },
  },
  {
    id: "dashed",
    name: "Dashed Lines",
    type: "number",
    options: {
      min: 0,
      max: 1,
      step: 0.05,
    },
  },
]);

$fx.features({
  "Paper texture": $fx.getParam("paper"),
  "Intersect": feature_percentage("crossing"),
  "Parallel": feature_percentage("parallel"),
  "Glance": feature_percentage("glancing"),
  "Avoid": feature_percentage("leaves"),
  "Straight": feature_percentage("straight"),
  "Emptyness": feature_percentage("empty"),
})

function feature_percentage(feature_name){
  let feature_names = ["empty", "straight", "leaves", "glancing", "crossing", "parallel"]
  let total = feature_names.reduce((sum, feature_name) => sum + $fx.getParam(feature_name), 0)
  let perc = 10000 * $fx.getParam(feature_name)/total
  return  Math.round(perc)/100 + " %"
}

function setup() {
  fx_params = $fx.getParams();
  n = random_element(n_arr)
  
  set_colours();
  set_divisions();
  createCanvas(w+2*border_width, h+2*border_width);
  regular_canvas = createGraphics(w+2*border_width, h+2*border_width);
  svg_canvas = createGraphics(svg_w+2*border_width, svg_h+2*border_width, SVG);

  log_params()

  recursive_square(0, 0, n)
  noLoop();
}

function draw() {
  draw_regular();
  image(regular_canvas, 0, 0);

  $fx.preview();
}

function draw_regular(){
  regular_canvas.background(bg_colour);
  paper_texture(paper_colour);

  regular_canvas.blendMode(BLEND);
  regular_canvas.rectMode(CORNER);
  regular_canvas.stroke(pen_colour);
  regular_canvas.noFill();
  regular_canvas.strokeWeight(1.5*w/svg_w)

  draw_squares(regular_canvas); 
}

function draw_svg(){
  svg_canvas.clear();
  svg_canvas.background(255);
  svg_canvas.stroke(0);

  svg_canvas.rectMode(CORNER);
  svg_canvas.noFill();
  svg_canvas.strokeWeight(1);

  draw_squares(svg_canvas);
}

function recursive_square(i0, j0, k, depth = 0){
  let divs = [2,3,4]
  if(k > 11) divs.push(6)

  let div = depth > 0 ? random_element(divs) : int(fx_params["n"])

  let remainder = k % div

  let likelihood = $fx.rand() > 0.15
  let should_divide = (remainder == 0) && likelihood && (depth < max_depth)
  let should_divide_unevenly = (div == 3) && likelihood && (depth < 2) && (depth > 0)
  if(depth == 0) { should_divide = true }
  
  if (should_divide_unevenly) { 
    divide_unevenly(i0, j0, k, div, depth)
  } else if (should_divide){
    divide_evenly(i0, j0, k, div, depth)
  } else {
    squares.push({i: i0, j: j0, k: k, styles: choose_style(k)})
  }
}

function divide_unevenly(i0, j0, k, div, depth) {
  const wn = k / div;
  const orients = [0, 1, 2, 3];
  const orient = random_element(orients);

  const coordinates = [
      [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }], 
      [{ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], 
      [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 
      [{ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]  
  ];

  for (let i = 0; i < 6; i++) {
      const { x, y } = coordinates[orient][i];
      // first square is twice the size
      recursive_square(i0 + x * wn, j0 + y * wn, (i==0) ? 2*wn : wn, depth + 1);
  }
}

function divide_evenly(i0, j0, k, div, depth){
  let new_width = k/div

  for(let i=0; i < div; i++){
    for(let j=0; j< div; j++){
      recursive_square(i0 + i*new_width, j0 + j*new_width, new_width, depth + 1)
    }
  }
}

function draw_squares(cnv){
  for(let s = 0; s < squares.length; s++){
    draw_square(squares[s].i*d+border_width, squares[s].j*d+border_width, squares[s].k, squares[s].styles, cnv)
  }
}

function draw_square(x, y, k, styles, cnv = regular_canvas){
  // draw the top and left side of the square
  let sw = k * d;

  cnv.line(x, y, x + sw, y)
  cnv.line(x, y, x, y + sw)
  // if we are at the edge of the grid draw the right or bottom side
  if(x+sw >= w) { cnv.line(x + sw, y, x + sw, y + sw) }
  if(y+sw >= h) { cnv.line(x, y + sw, x + sw, y + sw) }

  switch(styles.style){
    case 1:
      draw_lines(x, y, sw, styles, cnv)
      break;
    case 2:
      draw_glancing_arcs(x, y, sw, styles, cnv)
      break;
    case 3:
      draw_leaf_arcs(x, y, sw, styles, cnv)
      break;
    case 4:
      draw_parallel_arcs(x, y, sw, styles, cnv)
      break;
    case 5:
      draw_crossed_arcs(x, y, sw, styles, cnv)
      break;
    case 6:
      break;
  }
}

function choose_style(k){
  let direction, divs, div; 
  let dashed_lines = false, size_changes = false;
  let svg_width = svg_d * 7/6; // total border width is 1/6 of w
  let svg_sw = k * svg_width / n;
  let fs = random_element(fill_styles);
  let directions = [0,1,2,3]

  switch(fs){
    // lines
    case 1:
      directions = [0, 1]
      divs = [2,4,4,4,4,4]
      break;
    // glancing arcs
    case 2:
      divs = [1]  
      break;
    //leaves
    case 3:
      divs =[1]  
      break;
    // parallel arcs
    case 4: 
      divs =[1,2,2,2,2,2,2,2,4,4]  
      size_changes = true
      break;
    // crossed arcs
    case 5:
      divs =[1,1,2,2,2,2,2,2,2]  
      size_changes = $fx.rand() > 0.5
      break;
    // empty
    case 6:
      divs =[1]  
      break;
  }

  direction = random_element(directions);
  div = random_element(divs)
  dashed_lines = (svg_sw > svg_width/10) && ($fx.rand() > 0.95 - fx_params["dashed"])
  
  return {  style: fs, 
            direction: direction, 
            div: div, 
            dashed_lines: dashed_lines, 
            size_changes: size_changes,
        }
}

function draw_lines(x, y, sw, styles, cnv = regular_canvas){
  let lw = sw / styles.div

  for(let i = lw; i < sw; i+=lw){
    if (styles.direction){
      cnv.line(x, y + i, x + sw, y + i)
    } else {
      cnv.line(x + i, y, x + i, y + sw)
    }
  }
}

function draw_glancing_arcs(x, y, sw, styles, cnv = regular_canvas){
  let ark = set_arc(x, y, 1, sw, sw/2, styles.direction)
  draw_arc(ark, styles.dashed_lines, cnv)

  ark = set_arc(x, y, 1, sw, sw/2, (styles.direction+2)%4)
  draw_arc(ark, styles.dashed_lines, cnv)
}

function draw_leaf_arcs(x, y, sw, styles, cnv = regular_canvas){
  let ark = set_arc(x, y, 1, sw, sw, styles.direction)
  draw_arc(ark, styles.dashed_lines, cnv)

  ark = set_arc(x, y, 1, sw, sw, (styles.direction+2)%4)
  draw_arc(ark, styles.dashed_lines, cnv)
}

function draw_crossed_arcs(x, y, sw, styles, cnv = regular_canvas){
  let lw = sw / styles.div
  let ark = set_arc(x, y, 1, sw, lw, styles.direction, true)
  draw_arc(ark, styles.dashed_lines, cnv)

  if (!styles.size_changes){
    ark = set_arc(x, y, 1, sw, lw, (styles.direction+1)%4, true)
    draw_arc(ark, styles.dashed_lines, cnv)
  } else if(styles.div > 1){
    ark = set_arc(x, y, 2, sw, lw, styles.direction, true)
    draw_arc(ark, styles.dashed_lines, cnv)
  } 

}

function draw_parallel_arcs(x, y, sw, styles, cnv = regular_canvas){
  let ark;
  let lw = sw / styles.div

  for(let i = 1; i <= styles.div; i++){
    ark = set_arc(x, y, i, sw, lw, styles.direction, false)
    
    draw_arc(ark, styles.dashed_lines, cnv)
  }
}

function draw_arc(ark, dashed_lines, cnv){
  if(dashed_lines){
    let ag = al/ark.r

    for(let j = ark.a; j < ark.a + PI/2; j+=3*ag){
      // fix end to ensure the arc is terminated on the line
      let end = j + 2*ag
      if(end >= ark.a + PI/2) { end = ark.a + PI/2 }
      cnv.arc(ark.x, ark.y, ark.r, ark.r, j, end)
    }
  } else {
    cnv.arc(ark.x, ark.y, ark.r, ark.r, ark.a, ark.a + PI/2)
  }
}

function set_arc(x, y, i, sw, lw, direction, direction_changes = false){
  let xi = x, yi = y;

  if((i==2) && direction_changes) { 
    direction = (direction + 1) % 4 
  }
  
  if(direction == 1 || direction == 2){
    xi = x + sw;
  }

  if(direction == 2 || direction == 3){
    yi = y + sw;
  }

  let a = direction * PI/2

  return {x: xi, y: yi, a: a, r: i*lw*2}
}

function set_colours(){
  palette_name = fx_params["palette"]
  bg_colour = palette[palette_name].bg_colour
  paper_colour = palette[palette_name].paper_colour
  pen_colour = palette[palette_name].pen_colour
  paper_roughness = palette[palette_name].paper_roughness

  fill_styles = Array(fx_params["straight"]).fill(1).
                concat(Array(fx_params["glancing"]).fill(2)).
                concat(Array(fx_params["leaves"]).fill(3)).
                concat(Array(fx_params["parallel"]).fill(4)).
                concat(Array(fx_params["crossing"]).fill(5)).
                concat(Array(fx_params["empty"]).fill(6))
  if(fill_styles.length == 0) { fill_styles = [5] }
}

function paper_texture(colour) {
  const segments = Math.floor(random_between(0.12*w, 0.24*w))
  const segment_w = width / segments;
  const grain_density = random_between(1.2,1.6);
  const angle = random_between(-0.05,  0.05)
  const paper_strength = 1 + fx_params["paper"] 
  

  regular_canvas.strokeWeight(0.7); 
  regular_canvas.stroke(red(colour), blue(colour), green(colour), paper_strength);
  regular_canvas.blendMode(ADD)
  regular_canvas.noFill();
  regular_canvas.ellipseMode(CORNERS)

  for (let i = 0; i < height; i += grain_density) {
    let x1 = Math.random(w) //non-deterministic
    let y1 = max_from_min(i + height * Math.tan(angle), height)
    
    for (let j = 0; j <= segments; j+=random_between(0.97,1.02)) {
      let x4 = j * segment_w;
      let y4 = i;

      if(random_between(0,1) > paper_roughness){
        let x2 = random_point_from(x1);
        let y2 = random_point_from(y1);

        let x3 = random_point_from(x4);
        let y3 = max_from_min(i + random_point_from(), height);
  
        regular_canvas.bezier(x1, y1, x2, y2, x3, y3, x4, y4)
      } else {
        regular_canvas.ellipse(x1,y1,x4,y4)
      }

      x1 = x4;
      y1 = y4;
    }
  }
  regular_canvas.ellipseMode(CENTER)
}

function random_point_from(z = 0){
  const curviness = 25; // from 2 to 25
  return z + random(-curviness, curviness);
}

function random_between(a,b){
  return $fx.rand()*(b-a) + a
}

function max_from_min(a,b){
  return Math.max(Math.min(a, b), 0);
}

function random_index(arr){
  return Math.floor($fx.rand() * arr.length)
}

function random_element(arr){
  return arr.at(random_index(arr))
}

function windowResized() {
  set_divisions()
  draw();
}

function set_divisions(displayScale){
  if (!displayScale) {
    displayScale = (windowWidth >= windowHeight) ? windowHeight/base_width : windowWidth/base_width
    displayScale *= 0.99
  }

  w = Math.round((svg_w)*displayScale)
  h = Math.round((svg_h)*displayScale)

  d = w/n;
  border_width = w/12;
  border_offset = d/2 + border_width
  al = w/60 // dashed line width
  svg_d = svg_w / n

  regular_canvas = createGraphics(w+2*border_width, h+2*border_width);
  resizeCanvas(w+2*border_width, h+2*border_width);
}

function keyPressed() {
  file_name = `Electric_Word_Trajectories_${$fx.iteration}_${$fx.hash}`;
  let output_format;

  if (key.toLowerCase() === "s") {
    clear();
    set_divisions(1)
    draw_svg();
    output_format = 'svg'
    save(svg_canvas, file_name.concat(".", output_format));
    clear();
    set_divisions()
    draw()
  } else if (Number(key) > 0 && Number(key) < 4) {
    set_divisions(Number(key))
    draw_regular();
    image_size = width
    output_format = 'jpg';
    save(regular_canvas, file_name.concat("_", width,".", output_format));
    set_divisions()
    draw()
  }
}

function log_params(){
  let description = 'Trajectories by The Electric Word\n'+
                    '------------------------------------------------------------------\n'+
                    'No one knows how life will turn out'
                    '------------------------------------------------------------------\n'+
                    'Key Commands:\n'+
                    's: save svg at 700x700 for plotting on A4\n'+
                    '1: save jpeg at 1400x1400\n'+
                    '2: save jpeg at 2800x2800\n'+
                    '3: save jpeg at 5400x5400\n'+
                    '------------------------------------------------------------------\n'+
                    'Made with p5js and p5.svg libraries\n'+
                    '------------------------------------------------------------------\n'+
                    'License: CC BY-NC-SA';
  console.log(description);
  console.log(`Palette: ${fx_params["palette"]}`)
  console.log(`Paper: ${fx_params["paper"]}`)
  console.log(`n: ${fx_params["n"]}`)
  console.log(`Crossing: ${fx_params["crossing"]}`)
  console.log(`Parallel: ${fx_params["parallel"]}`)
  console.log(`Glancing: ${fx_params["glancing"]}`)
  console.log(`Leaves: ${fx_params["leaves"]}`)
  console.log(`Straight: ${fx_params["straight"]}`)
  console.log(`Empty: ${fx_params["empty"]}`)
  console.log(`Dashed: ${fx_params["dashed"]}`)


  console.log(fx_params)

}
