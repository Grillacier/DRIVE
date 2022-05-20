var canvas, ctx;
var drags; //Tracé section
var robot;
var thickness = 40;
var drawControlPoints = true;
var useSplitCurve = true;
var positions = [];
var coupleControl = [];
var selectPoint = null;
var controlSelect = null;
var mode = "";
var nbrect = 0;
var list_rect = []; //Intersection
var list_cirl = [];
var list_section = [];
var list_control = [];
var list_depot = [];
var list_man = [];
var list_man_intersect = []; //LISTE DES MANOEUVRES POUR UNE INTERSECTION
var list_exp = [];
var drawPoints = true;
var nbManouvers = 0;
var nb_section = 0;
var nb_exp = 0;
var undo = [];

function fill_backup(){
  var backup = {drags:drags, robot:robot, positions: positions, coupleControl: coupleControl, selectPoint:selectPoint, controlSelect:controlSelect, nbrect:nbrect,list_rect:list_rect, list_cirl:list_cirl, list_section:list_section, list_control:list_control, list_depot: list_depot, list_man:list_man, list_man_intersect:list_man_intersect, list_exp:list_exp, nbManouvers: nbManouvers, nb_section:nb_section, nb_exp:nb_exp };
  backup.drags=copy_drags(drags);
  if(robot)
    backup.robot = JSON.parse(JSON.stringify(robot));
  backup.positions=copy_list( positions);
  backup.coupleControl= copy_list(coupleControl);
  backup.selectPoint=selectPoint;
  backup.controlSelect=controlSelect;
  backup.nbrect=nbrect;
  backup.list_rect=copy_list(list_rect);
  backup.list_cirl=copy_list(list_cirl);
  backup.list_section=copy_list(list_section);
  backup.list_control=copy_list(list_control);
  backup.list_depot= copy_list(list_depot);
  backup.list_man=copy_list(list_man);
  backup.list_man_intersect=copy_list(list_man_intersect);
  backup.list_exp=copy_list(list_exp);
  backup.nbManouvers= nbManouvers;
  backup.nb_section=nb_section;
  backup.nb_exp=nb_exp;
  console.log(JSON.stringify(backup));
  undo.push(backup);
}

function export_json(){
  var str="";
  var backup = {drags:drags, robot:robot, positions: positions, coupleControl: coupleControl, selectPoint:selectPoint, controlSelect:controlSelect,nbrect:nbrect, list_rect:list_rect, list_cirl:list_cirl, list_section:list_section, list_control:list_control, list_depot: list_depot, list_man:list_man, list_man_intersect:list_man_intersect, list_exp:list_exp, nbManouvers: nbManouvers, nb_section:nb_section, nb_exp:nb_exp };
  backup.drags=drags;
  if(robot)
    backup.robot = JSON.parse(JSON.stringify(robot));
  backup.positions= positions;
  backup.coupleControl= coupleControl;
  backup.selectPoint=selectPoint;
  backup.controlSelect=controlSelect;
  backup.nbrect=nbrect;
  backup.list_rect=copy_list(list_rect);
  backup.list_cirl=list_cirl;
  backup.list_section=list_section;
  backup.list_control=list_control;
  backup.list_depot= list_depot;
  backup.list_man=list_man;
  backup.list_man_intersect=list_man_intersect;
  backup.list_exp=list_exp;
  backup.nbManouvers= nbManouvers;
  backup.nb_section=nb_section;
  backup.nb_exp=nb_exp;
  str = JSON.stringify(backup);
  return str;
}

function lireFichierTexte(fichier)
{
  //On lance la requête pour récupérer le fichier
  var fichierBrut = new XMLHttpRequest();
  fichierBrut.open("GET", fichier, false);
  //On utilise une fonction sur l'événement "onreadystate"
  fichierBrut.onreadystatechange = function ()
  {
    if(fichierBrut.readyState === 4)
    {
      //On contrôle bien quand le statut est égal à 0
      if(fichierBrut.status === 200 || fichierBrut.status == 0)
      {
        // On peut récupérer puis traiter le texte du fichier
        var texteComplet = fichierBrut.responseText;
        import_json(texteComplet);
      }
    }
  }
}

function import_json(txt){
  var j = JSON.parse(txt);
  drags=j.drags;
  robot = j.robot;
  positions= j.positions;
  coupleControl= j.coupleControl;
  selectPoint=j.selectPoint;
  controlSelect=j.controlSelect;
  nbrect=j.nbrect;
  list_rect=j.list_rect;
  list_cirl=j.list_cirl;
  list_section=j.list_section;
  list_control=j.list_control;
  list_depot= j.list_depot;
  list_man=j.list_man;
  list_man_intersect=j.list_man_intersect;
  list_exp=j.list_exp;
  nbManouvers= j.nbManouvers;
  nb_section=j.nb_section;
  nb_exp=j.nb_exp;
  draw();
}

function copy_list(list){
  var res = [];
  for (let i = 0; i < list.length; i++) {
    res.push(list[i]);
  }
  return res;
}

function copy_drags(list){
  var res = [];
  for (let i = 0; i < list.length; i++) {
    let d = new Drag( ctx, new Vec2D(list[i].pos.x, list[i].pos.y));
    res.push(d);
  }
  return res;
}

function d_undo(){
  if(undo.length >0){
    var last = undo.pop();
    drags=last.drags;
    robot = last.robot;
    positions = last.positions;
    coupleControl=last.coupleControl;
    selectPoint = last.selectPoint;
    controlSelect = last.controlSelect;
    nbrect=last.nbrect;
    list_rect = last.list_rect;
    list_cirl =last.list_cirl;
    list_section = last.list_section;
    list_control = last.list_control;
    list_depot = last.list_depot;
    list_man = last.list_man;
    list_man_intersect = last.list_man_intersect;
    list_exp = last.list_exp;
    nbManouvers = last.nbManouvers;
    nb_section= last.nb_section;
    nb_exp = last.nb_exp;
    draw();
  }
}

function MousePos(event) {
  event = (event ? event : window.event);
  return {
    x: event.pageX - canvas.offsetLeft,
    y: event.pageY - canvas.offsetTop
  };
}

function change_mode_to_rect() {
  if( mode != "rect" ){
    mode = "rect";
  }
  else
    mode = "";  
}

function change_mode_to_robot() {
  if( mode != "robot" ){
    mode = "robot";
  }
  else
    mode = "";  
}

function change_mode_to_cirl() {
  if( mode != "cirl" ){
    mode = "cirl";
  }
  else
    mode = "";  
}

function change_mode_to_line() {
  if( mode != "line" ){
    mode = "line";
  }
  else
    mode = "";  
}

function change_mode_to_depot() {
  if( mode != "depot" ){
    mode = "depot";
  }
  else
    mode = "";  
}

function save_canvas() {
  canvas.toBlob((blob) => {
    const timestamp = Date.now().toString();
    console.log(timestamp);
    const a = document.createElement('a');
    document.body.append(a);
    a.download = `export-${timestamp}.png`;
    a.href = URL.createObjectURL(blob);
    a.click();
    a.remove();
  });
}

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  drags = [];

  document.body.appendChild(canvas);
  window.addEventListener('resize', resize );
  window.addEventListener('mousedown', mousedown );
  window.addEventListener('mouseup', mouseup );
  window.addEventListener('mousemove', mousemove );
  canvas.addEventListener('dblclick', dblclick);
  document.getElementById("rect").onclick =  function()  {change_mode_to_rect()};
  document.getElementById("robot").onclick =  function()  {change_mode_to_robot()};
  document.getElementById("cirl").onclick =  function()  {change_mode_to_cirl()};
  document.getElementById("line").onclick =  function()  {change_mode_to_line()};
  document.getElementById("depot").onclick =  function()  {change_mode_to_depot()};
  document.getElementById("save").onclick =  function()  {save_canvas()};
  document.getElementById("graph").onclick =  function() {download_file("test.cql", to_graph("test", list_section, list_man, list_rect), "text/plain")};
  document.getElementById("und").onclick =  function()  {d_undo()};
  document.getElementById("importjs").onclick =  function()  {lireFichierTexte("D:\Downloads 2\editeur ehoa\exp.json")};
  document.getElementById("exportjs").onclick =  function()  {download_file("exp.json",export_json(),"text/plain")};
  document.getElementById('btnControl').addEventListener('click', function(e) { drawControlPoints = !drawControlPoints} );
  document.getElementById('btnSplit').addEventListener('click', function(e) { useSplitCurve = !useSplitCurve} );
  document.getElementById('btnDraw').addEventListener('click', function(e) { drawPoints = !drawPoints } );

  resize();
  draw();
  /*code de la courbe test*/
  positions = [ {x:300, y:250}, {x:450, y:300}, {x:400, y:400} ];

  list_control.push(positions[1]);
  list_man.push({n:"S0M0", pos:positions, white : [], yellow :  [], length:0});

  nb_section = nb_section + 1;

  list_section.push({n:"S0", intersect:[], x:positions[0].x, y:positions[0].y})
  for (var i = 0; i < positions.length; i++) {
    drags.push(new Drag( ctx, new Vec2D(positions[i].x, positions[i].y)));
  }
  fill_backup();
}



function resize() {
  canvas.width = 1535.5;
  canvas.height = 1535.5;
}

function getBezierXY(t, sx, sy, cp1x, cp1y, ex, ey) {
  return {
    x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
    y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey
  };
}

function getListCoords (r, c1 , c2){
  var coords = [];
  var c1_coord;
  var c2_coord;
  var centerRect;

  list_rect.forEach(elem => {
    if (r == elem.n){
      centerRect = {x:elem.x + elem.length/2.0, y:elem.y + elem.length/2.0}
      elem.list_circle.forEach(c => {
        if (c.n.split('-')[1] == c1){
          c1_coord = c;
        }
        if (c.n.split('-')[1] == c2){
          c2_coord = c;
        }
      })
    }
  });
  return getListCoords2(c1_coord,c2_coord,centerRect);
}

function getListCoords2 (c1_coord,c2_coord,centerRect){
  var pas = 0.1;
  var list_central = [];
  var coord;

  for (let i = 0; i < 1; i = i + pas) {
    coord = getBezierXY(i, c1_coord.x, c1_coord.y, centerRect.x, centerRect.y,  c2_coord.x, c2_coord.y);
    list_central.push(coord);
  }
  return list_central;
}

function list_inter_contains( name, reverse_name){
  console.log(list_man_intersect.length);
  for (let index = 0; index < list_man_intersect.length; index++) {
    e = list_man_intersect[index];
    console.log("--------------");
    console.log(e.n);
    console.log(reverse_name);
    console.log(name);
    console.log("--------------");
    if (e.n == name || e.n == reverse_name){
      console.log("true");
      return true;
    }
  }
  console.log("false");
  return false;
}

function getListIntersectMan (list_section) {
  var coords;

  list_section.forEach(s => {
    s.intersect.forEach(i => {
      list_section.forEach(s2 => {
        s2.intersect.forEach(i2 => {
          if (s.n != s2.n && i.split('-')[0] == i2.split('-')[0]){
            //Si les sections ne sont pas les memes mais les intersections sont les memes
            coords = getListCoords(i.split('-')[0], i.split('-')[1], i2.split('-')[1]);
            var length = 0;
            for (let index = 0; index + 1 < coords.length; index = index + 2) {
              //
              const element = coords[index];
              const element2 = coords[index + 1];
              x1 = element.x;
              y1 = element.y;
              x2 = element2.x;
              y2 = element2.y;
              var dist = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
              length += dist;
            }
            if (! list_inter_contains( "I"+i.split('-')[0] + s.n + s2.n, "I"+i.split('-')[0] + s2.n + s.n )) {
              console.log("push " + "I"+i.split('-')[0] + s.n + s2.n );
              list_man_intersect.push({n:"I"+i.split('-')[0] + s.n + s2.n, coords:coords, length:length});
            }
          }
        });
      });
    });
  });
}

function getNameElem (select){
  var name = "";

  list_man.forEach(man => {
    man.pos.forEach(p => {
      if (p.x == select.x && p.y == select.y) {
        name = man.n;
      }
    })
  })
  return name;
}

function set_draw_elem(ctx,c,elem){
  ctx.strokeStyle = '#959595';
  if (c.n.includes("c2")) {
    elem.x = c.x - thickness;
  }
  if (c.n.includes("c3")) {
    elem.y = c.y - thickness;
  }
  if (c.n.includes("c4")) {
    elem.x = c.x + thickness;
  }
  if (c.n.includes("c1")) {
    elem.y = c.y + thickness;
  }
  return elem;
}

function draw_strokeStyle(ctx,c,r,indLeft){
  if (c.n.includes("c3") && r.list_circle[indLeft].n.includes("c2")) {
    ctx.strokeStyle = '#FFFFFF';
  }
  if (c.n.includes("c4") && r.list_circle[indLeft].n.includes("c3")) {
    ctx.strokeStyle = '#FFFFFF';
  }
  if (c.n.includes("c2") && r.list_circle[indLeft].n.includes("c1")) {
    ctx.strokeStyle = '#FFFFFF';
  }
  if (c.n.includes("c1") && r.list_circle[indLeft].n.includes("c4")) {
    ctx.strokeStyle = '#FFFFFF';
  }
}

function draw_fill_rect(ctx,fill,a,b,c,d)
{
  ctx.beginPath();
  ctx.fillStyle = fill;
  ctx.rect(a, b, c, d);
}

function fill_list_circle_empty(c,ctx,r,indLeft)
{
  var elem = {x:c.x, y:c.y};
  var elem2 = {x:r.list_circle[indLeft].x, y:r.list_circle[indLeft].y};
  elem = set_draw_elem(ctx,c,elem);

  if (r.list_circle[indLeft].n.includes("c2")) {
    elem2.x = r.list_circle[indLeft].x - r.list_circle[indLeft].length/2 ;
    elem2.y = r.list_circle[indLeft].y + r.list_circle[indLeft].length/2 - thickness;
  }
  if (r.list_circle[indLeft].n.includes("c3")) {
    elem2.x = r.list_circle[indLeft].x - r.list_circle[indLeft].length/2 + thickness;
    elem2.y = r.list_circle[indLeft].y - r.list_circle[indLeft].length/2 ;
  }
  if (r.list_circle[indLeft].n.includes("c4")) {
    elem2.x = r.list_circle[indLeft].x + r.list_circle[indLeft].length/2;
    elem2.y = r.list_circle[indLeft].y - r.list_circle[indLeft].length/2 + thickness;
  }
  if (r.list_circle[indLeft].n.includes("c1")) {
    elem2.x = r.list_circle[indLeft].x + r.list_circle[indLeft].length/2 - thickness;
    elem2.y = r.list_circle[indLeft].y + r.list_circle[indLeft].length/2;
  }

  draw_strokeStyle(ctx,c,r,indLeft);
  ctx.beginPath();
  ctx.moveTo(elem.x, elem.y);
  ctx.lineWidth = 2;
  ctx.lineTo((elem2.x + elem.x)/2.0, (elem2.y + elem.y)/2.0);
  ctx.stroke();

  draw_strokeStyle(ctx,c,r,indLeft);
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo((elem2.x + elem.x)/2.0, (elem2.y + elem.y)/2.0);
  ctx.lineTo(elem2.x , elem2.y);
  ctx.stroke();
}

function fill_list_circle(c,ctx,r,indLeft,centerRect)
{
  var elem = {x:c.x, y:c.y};
  var elem2 = {x:r.list_circle[indLeft].x, y:r.list_circle[indLeft].y};
  elem = set_draw_elem(ctx,c,elem);

  if (r.list_circle[indLeft].n.includes("c2")) {
    elem2.x = r.list_circle[indLeft].x + thickness;
  }
  if (r.list_circle[indLeft].n.includes("c3")) {
    elem2.y = r.list_circle[indLeft].y + thickness;
  }
  if (r.list_circle[indLeft].n.includes("c4")) {
    elem2.x = r.list_circle[indLeft].x - thickness;
  }
  if (r.list_circle[indLeft].n.includes("c1")) {
    elem2.y = r.list_circle[indLeft].y - thickness;
  }

  ctx.beginPath();
  ctx.moveTo(elem.x, elem.y);
  ctx.lineWidth = 2;
  if(r.list_circle[indLeft].n.includes("c2")|r.list_circle[indLeft].n.includes("c4"))
    ctx.quadraticCurveTo(elem2.x, elem.y,  elem2.x, elem2.y);
  if(r.list_circle[indLeft].n.includes("c1"))
    ctx.quadraticCurveTo(elem.x, elem2.y,  elem2.x, elem2.y);
  if(r.list_circle[indLeft].n.includes("c3"))
    ctx.quadraticCurveTo(elem.x, elem2.y,  elem2.x, elem2.y);

  draw_strokeStyle(ctx,c,r,indLeft);

  ctx.stroke();
}

function draw_dashed_lines(a,b,c)
{
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
}

function draw_lines_to(a,b)
{
  ctx.lineTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
}

function ctx_rect(a,b,r)
{
  ctx.rect(a.x - r, a.y - r, r * 2, r * 2);
  ctx.rect(b.x - r, b.y - r, r * 2, r * 2);
}

function coord_point_Bezier(x, y,z,i){
  coord = getBezierXY(i, x.x, x.y,y.x,y.y, z.x, z.y);
  ctx.fillStyle = "#FFFFFF";
  ctx.rect(coord.x, coord.y, 4, 4);
  ctx.stroke();
  return coord;
}

function draw_robot()
{
  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.moveTo(robot.x - 10,robot.y - 10);
  ctx.lineTo(robot.x + 10 ,robot.y + 10);
  ctx.moveTo(robot.x + 10, robot.y - 10);
  ctx.lineTo(robot.x - 10, robot.y + 10);
  ctx.stroke();
  ctx.strokeStyle = '#959595';
}

function draw_depot()
{
  ctx.strokeStyle = 'yellow';

  list_depot.forEach(d => {
    ctx.beginPath();
    ctx.rect(d.x,d.y,10,10);
    ctx.stroke();
  });
  ctx.strokeStyle = '#959595';
}
//This is a temporary function remember to remove it
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function draw() {
  requestAnimationFrame(draw);
  //Filling the background of the canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;

  if (robot)
    draw_robot();

  draw_depot();
  //draw Rectangles (Intersection)
  list_rect.forEach(drawRect);
  for (var i = 0; i < drags.length; i++) {
      //if ( drawPoints){
        drags[i].draw();
      //}
  }
  //drags relate to the section of the road it's the three dragg  ble points
  for (var i = 1; i < drags.length - 1; i = i + 3) {
    var p2 = drags[i - 1].pos;
    var p1 = drags[i + 1].pos;
    var c = drags[i].pos;
    var name = "";
    var index = 0;

    for (let j = 0; j < list_man.length; j++) {
      const element = list_man[j];
      if (element.pos[0].x == drags[i - 1].pos.x && element.pos[0].y == drags[i - 1].pos.y &&
        element.pos[1].x == drags[i].pos.x && element.pos[1].y == drags[i].pos.y &&
        element.pos[2].x == drags[i + 1].pos.x && element.pos[2].y == drags[i + 1].pos.y){
          name = element.n;
          index = j;
      }
    }
    var v1 = c.sub(p1);
    var v2 = p2.sub(c);
    var n1 = v1.normalizeTo(thickness).getPerpendicular();
    var n2 = v2.normalizeTo(thickness).getPerpendicular();
    var p1a = p1.add(n1);
    var p1b = p1.sub(n1);
    var p2a = p2.add(n2);
    var p2b = p2.sub(n2);
    var c1a = c.add(n1);
    var c1b = c.sub(n1);
    var c2a = c.add(n2);
    var c2b = c.sub(n2);
    var line1a = new Line2D(p1a, c1a);
    var line1b = new Line2D(p1b, c1b);
    var line2a = new Line2D(p2a, c2a);
    var line2b = new Line2D(p2b, c2b);
    var split = (useSplitCurve && v1.angleBetween(v2, true) > Math.PI / 2);

    if (!split) {
      var ca = line1a.intersectLine(line2a).pos;
      var cb = line1b.intersectLine(line2b).pos;
    }else {
      var t = MathUtils.getNearestPoint(p1, c, p2);
      var pt = MathUtils.getPointInQuadraticCurve(t, p1, c, p2);
      var t1 = p1.scale(1 - t).add(c.scale(t));
      var t2 = c.scale(1 - t).add(p2.scale(t));
      var vt = t2.sub(t1).normalizeTo(thickness).getPerpendicular();
      var qa = pt.add(vt);
      var qb = pt.sub(vt);
      var lineqa = new Line2D(qa, qa.add(vt.getPerpendicular()));
      var lineqb = new Line2D(qb, qb.add(vt.getPerpendicular()));
      var q1a = line1a.intersectLine(lineqa).pos;
      var q2a = line2a.intersectLine(lineqa).pos;
      var q1b = line1b.intersectLine(lineqb).pos;
      var q2b = line2b.intersectLine(lineqb).pos;
    }
    if (drawControlPoints) {
      // draw control points
      var r = 2;
      ctx.beginPath();
      if (!split)
        ctx_rect(ca,cb,r);
      else {
        // ctx.rect(pt.x - r, pt.y - r, r * 2, r * 2);
        ctx_rect(p1a,p1b,r);
        ctx_rect(q1a,q1b,r);
        ctx_rect(p2a,p2b,r);
        ctx_rect(q2a,q2b,r);
        ctx_rect(qa,qb,r);
        ctx.moveTo(qa.x, qa.y);
        ctx.lineTo(qb.x, qb.y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#0072bc';
      ctx.stroke();
      ctx.fillStyle = '#0072bc';
      ctx.fill();
      // draw dashed lines
      ctx.beginPath();
      if (!split) {
        draw_dashed_lines(p1a,ca,p2a);
        draw_dashed_lines(p1b,cb,p2b);
      } else {
        draw_dashed_lines(p1a,q1a,qa);
        draw_lines_to(q2a,p2a);
        draw_dashed_lines(p1b,q1b,qb);
        draw_lines_to(q2b,p2b);
      }
      ctx.setLineDash([2,4]);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    }
    // central line
    ctx.stroke();
    if (drawPoints){
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
      ctx.strokeStyle = '#959595';
      ctx.stroke();
    }
    var pas = 0.2;
    var list_central = [];
    var coord;

    for (let i = 0; i < 1; i = i + pas) {
      coord = getBezierXY(i, p1.x, p1.y, c.x, c.y, p2.x, p2.y);
      list_central.push(coord);
    }
    var length = 0;
    for (let index = 0; index + 1 < list_central.length; index = index + 2) {
      const element = list_central[index];
      const element2 = list_central[index + 1];
      x1 = element.x;
      y1 = element.y;
      x2 = element2.x;
      y2 = element2.y;
      var dist = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
      length += dist;
    }
    var list_yellow = [];
    var list_white = [];
    // offset curve a
    ctx.beginPath();
    ctx.moveTo(p1a.x, p1a.y);
    if (!split) {
      ctx.quadraticCurveTo(ca.x, ca.y, p2a.x, p2a.y);
      if (drawPoints) {
        for (let i = 0; i < 1; i = i + pas) {
          coord = coord_point_Bezier(p1a,ca,p2a,i);
          list_white.push(coord);
        }
      }
    }else {
      ctx.quadraticCurveTo(q1a.x, q1a.y, qa.x, qa.y);
      ctx.quadraticCurveTo(q2a.x, q2a.y, p2a.x, p2a.y);
      if (drawPoints){
        for (let i = 0; i < 1; i = i + pas) {
          coord = coord_point_Bezier(p1a,q1a,qa,i);
          list_white.push(coord);
        }
        for (let i = 0; i < 1; i = i + pas) {
          coord = coord_point_Bezier(qa,q2a,p2a,i);
          list_white.push(coord);
        }
      }
    }
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    // offset curve b
    ctx.beginPath();
    ctx.moveTo(p1b.x, p1b.y);
    if (!split) {
      ctx.quadraticCurveTo(cb.x, cb.y, p2b.x, p2b.y);
      if(drawPoints){
        for (let i = 0; i < 1; i = i + pas) {
          coord =coord_point_Bezier(p1b,cb,p2b,i);
          list_yellow.push(coord);
        }
      }
    }else {
      ctx.quadraticCurveTo(q1b.x, q1b.y, qb.x, qb.y);
      ctx.quadraticCurveTo(q2b.x, q2b.y, p2b.x, p2b.y);
      if(drawPoints){
        for (let i = 0; i < 1; i = i + pas) {
          coord = coord_point_Bezier(p1b,q1b,qb,i);
          list_yellow.push(coord);
        }
        for (let i = 0; i < 1; i = i + pas) {
          coord = coord_point_Bezier(qb,q2b,p2b,i);
          list_yellow.push(coord);
        }
      }
    }
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    if(drawPoints){
      for (let index = 0; index < list_yellow.length; index++) {
        const element = list_yellow[index];
        const element2 = list_white[index];
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element2.x, element2.y);
        ctx.strokeStyle = '#00008B';
        ctx.stroke();
      }
    }
    list_man[index].white = list_white;
    list_man[index].yellow = list_yellow;
    list_man[index].length = length;
  }
}
function drawRect(r){
  draw_fill_rect(ctx,'#000000',r.x, r.y, r.length, r.length);
  ctx.fill();

  for (let index = 0; index < r.list_circle.length; index++) {
    const c = r.list_circle[index];
    if(drawPoints){
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI, true);
      ctx.stroke();
    }
    for (let index = 0; index < list_man_intersect.length; index++) {
      const element = list_man_intersect[index];
      for (let index = 0; index < element.coords.length; index++) {
        const coord = element.coords[index];
        draw_fill_rect(ctx,'#FFFFFF',coord.x, coord.y, 1, 1);
        ctx.stroke();
      }
    }
    var centerRect = {x:r.x + r.length/2.0, y:r.y + r.length/2.0}
    var indLeft = (index - 1)%r.list_circle.length;
    if (indLeft == -1){
      indLeft = 3;
    }
    if((!c.empty )){
      if(!r.list_circle[indLeft].empty)
        fill_list_circle(c,ctx,r,indLeft,centerRect);
    }
    if(r.list_circle[indLeft].empty)
      fill_list_circle_empty(c,ctx,r,indLeft);
  }
}




function changeControlPoint (coupleControl) {
  for (let index = 0; index < coupleControl.length; index++) {
    const element = coupleControl[index];
    var diffX;
    var diffY;

    diffX =  (2* element.point.x ) - element.a.x ;
    diffY =  (2* element.point.y ) - element.a.y ;

    var newD = new Vec2D(diffX, diffY);
    element.b.x = newD.x;
    element.b.y = newD.y;
    var couple = {point : element.point, a : element.a, b: element.b, diffX : diffX, diffY : diffY};
    coupleControl[index] = couple;
  }
}

function dblclick(e) {
  //e.preventDefault();
  fill_backup();
  pos = MousePos(e);
  var m = new Vec2D( parseFloat(pos.x),  parseFloat(pos.y));
  var diff = new Vec2D(0,0);
  var l = 150.0;

  if (mode == "rect")
    return  dblclickrect(e,l);
  if (mode == "depot")
      return  dblclickdepot(e);
  if (mode == "robot")
    return  dblclickrobot(e);
  if (mode == "cirl")
    return  dblclickcirl(e,l);
  if(selectPoint != null){
    var control;
    var name = getNameElem(selectPoint);

    if(name == "")
      name = affectname();
    if(controlSelect != null){
      diff = diffxy(diff, selectPoint, controlSelect);
      control = new Vec2D(diff.x, diff.y);
    }
    
    list_rect.forEach(r => {
      r.list_circle.forEach(c => {
        //pos = MousePos(e);
        var p = {x:0, y:0, dx:0, dy: 0};
        p = p_rect(p,pos, c);

        //This block technically allow us to connect 2 section, however the drawing doesn't adjust itself to show this connection (+ we still have 2 draggable points instead of one)
        if ((p.dx * p.dx) + (p.dy * p.dy) < 25.0) {
          
          c.empty = false;
          m = new Vec2D(c.x, c.y);// Create new vector2d
          var centerRect = {x:r.x + r.length/2.0, y:r.y + r.length/2.0}//Compute center of circle to have new control point
          diff = diffxy(diff, c, centerRect);
          control = new Vec2D(diff.x, diff.y);

          list_section.forEach(s => {
            if (s.n == name.split("M")[0]) {
              s.intersect.push(c.n);
              c.section = s.n;
            }
          });
        }
        var p2 = {x:0, y:0, dx:0, dy: 0};
        p2 = p_rect(p2,selectPoint,c);

        if((p2.dx * p2.dx) + (p2.dy * p2.dy) < 25.0){
          //The selected point is part of an intersection
          var centerRect = {x:r.x + r.length/2.0, y:r.y + r.length/2.0};
          controlSelect = new Vec2D(centerRect.x, centerRect.y);
          diff = diffxy(diff, c, centerRect);
          control = new Vec2D(diff.x, diff.y);
          list_section.forEach(s => {
            if (s.n == name.split("M")[0]) {
              s.intersect.push(c.n);
              s.origin = "I"+c.n.split('-')[0];
              c.section = s.n;
              console.log(s.intersect);
            }
          });
        }
      });
    });
    var couple = {point : selectPoint, a : controlSelect, b: control, diffX : diff.x, diffY : diff.y}

    coupleControl.push(couple);
    list_control.push(control);
    //changeControlPoint(coupleControl);
    var num = parseInt(name.split('M')[1]);
    num = num + 1;
    list_man.push( { n:(name.split('M')[0])+"M"+num, pos:[m, control, selectPoint],  white : [], yellow :  [], length:0 } );
    drags.push(new Drag(ctx, m));
    drags.push(new Drag(ctx, control));
    drags.push(new Drag(ctx, selectPoint));
    selectPoint = null;
    return;
  }

  list_rect.forEach(r => {
    r.list_circle.forEach(c => {
      pos = MousePos(e);
      var p = {x:0, y:0, dx:0, dy: 0};
      p = p_rect(p,pos,c);

      if ((p.dx * p.dx) + (p.dy * p.dy) < 25.0) {
        c.empty = false;
        selectPoint = new Vec2D(c.x, c.y);
      }
    });
  });

  for (var i = 0; i < drags.length; i++) {
    var d = drags[i];
    pos = MousePos(e);
    var p_x = parseFloat(pos.x);
    var p_y = parseFloat(pos.y);
    dx = d.pos.x - p_x;
    dy = d.pos.y - p_y;
    if ((dx * dx) + (dy * dy) < 25.0) {
      if (i % 3 == 0){
        controlSelect = drags[i + 1].pos;
        selectPoint = d.pos;
      }
      if (i % 3 == 2){
        controlSelect = drags[i - 1].pos;
        selectPoint = d.pos;
      }
    }
  }
}

function dist_to_point (pos1,pos2){
  return Math.sqrt(Math.pow(Math.abs(pos2.x - pos1.x)) + Math.pow(Math.abs(pos2.y - pos1.y)));
}

function dblclickrobot(e)
{
  pos = MousePos(e);
  let rb   = {x: parseFloat(pos.x), y: parseFloat(pos.y), link:""};
  robot = rb;
  return;
}

function dblclickdepot(e)
{
  pos = MousePos(e);
  var dep   = {x: parseFloat(pos.x), y: parseFloat(pos.y), name:"pharma"};
  list_depot.push(dep);
  return;
}

function dblclickrect(e,l) {
  pos = MousePos(e);
  var p_x = parseFloat(pos.x);
  var p_y = parseFloat(pos.y);
  var rect = {n:nbrect,x: p_x, y: p_y, length:l, list_circle : [
    {n: nbrect+"-c1", x: p_x , y: p_y + l/2.0, length:150, empty:true, section:""},
    {n: nbrect+"-c2",x: p_x + l/2.0 , y: p_y , length:150, empty:true, section:""},
    {n: nbrect+"-c3",x: p_x + l, y: p_y + l/2.0, length:150, empty:true, section:""},
    {n: nbrect+"-c4",x: p_x + l/2.0 , y: p_y + l, length:150, empty:true, section:""} ]
  };
  nbrect++;
  list_rect.push(rect);
  return;
}

function dblclickcirl(e,l) {
  pos = MousePos(e);
  var p_x = parseFloat(pos.x);
  var p_y = parseFloat(pos.y);
  var cirl = {n:nbcirl,x: p_x, y: p_y, length:l, list_circle : [
    {n: nbcirl+"-c1", x: p_x , y: p_y + l/2.0, length:150, empty:true, section:""},
    {n: nbcirl+"-c2",x: p_x + l/2.0 , y: p_y , length:150, empty:true, section:""},
    {n: nbcirl+"-c3",x: p_x + l, y: p_y + l/2.0, length:150, empty:true, section:""},
    {n: nbcirl+"-c4",x: p_x + l/2.0 , y: p_y + l, length:150, empty:true, section:""},
    {n: nbcirl+"-c5", x: p_x + l/8.0, y: p_y + l/8.0, length:150, empty:true, section:""},
    {n: nbcirl+"-c6", x: p_x+0.875*l , y: p_y + l/8.0, length:150, empty:true, section:""},
    {n: nbcirl+"-c7", x: p_x + l/8.0 , y: p_y + l*0.875, length:150, empty:true, section:""},
    {n: nbcirl+"-c8", x: p_x+l*0.875 , y: p_y + l*0.875, length:150, empty:true, section:""}]
  };
  nbcirl++;
  list_cirl.push(cirl);
  return;
}

function affectname(){
  list_section.push({n:"S"+ nb_section, intersect:[], x : selectPoint.x, y:selectPoint.y, origin : ""});
  console.log("add section");
  nb_section = nb_section + 1;
  return "S"+ nb_section + "M0";
}

function  diffxy(diff, pointA, pointB){
  if (pointA == null || pointB == null)
    return diff;
  diff.x = (2* pointA.x)- pointB.x ;
  diff.y =(2* pointA.y)- pointB.y ;
  return diff;
}

function p_rect(p, pos, c){
  p.x = parseFloat(pos.x);
  p.y = parseFloat(pos.y);
  p.dx = c.x - p.x;
  p.dy = c.y - p.y;
  return p;
}

function mousedown(e) {
  e.preventDefault();
  var pos = MousePos(e);
  var p_x = parseFloat(pos.x);
  var p_y = parseFloat(pos.y);
  var dx, dy;
  var m = new Vec2D(pos.x, pos.y);

  for (var i = 0; i < drags.length; i++) {
    var d = drags[i];
    dx = d.pos.x - p_x;
    dy = d.pos.y - p_y;
    if ((dx * dx) + (dy * dy) < 25.0) {
      d.down = true;
      break;
    }
  }
}

function mouseup() {
  for (var i = 0; i < drags.length; i++) {
    var d = drags[i];
      d.down = false;
    }
}

function mousemove(e) {
  pos = MousePos(e);
  var m = new Vec2D( parseFloat(pos.x),  parseFloat(pos.y));
  //var m = new Vec2D(e.clientX, e.clientY);
  for (var i = 0; i < drags.length; i++) {
    var d = drags[i];
    if (d.down) {
      d.pos.x = m.x;
      d.pos.y = m.y;
    }
  }
  changeControlPoint(coupleControl);
}

function Drag(ctx, pos) {
  this.ctx = ctx;
  this.pos = pos;
  this.radius = 6;
  this.hitRadiusSq = 900;
  this.down = false;
}

Drag.prototype = {
  draw: function() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.strokeStyle = '#959595'
    this.ctx.stroke();
  }
}

// http://toxiclibs.org/docs/core/toxi/geom/Vec2D.html
function Vec2D(a,b) {
  this.x = a;
  this.y = b;
}

Vec2D.prototype = {
  add: function(a) {
    return new Vec2D(this.x + a.x, this.y + a.y);
  },
  angleBetween: function(v, faceNormalize) {
    if(faceNormalize === undefined){
      var dot = this.dot(v);
      return Math.acos(this.dot(v));
    }
    var theta = (faceNormalize) ? this.getNormalized().dot(v.getNormalized()) : this.dot(v);
    return Math.acos(theta);
  },
  distanceToSquared: function(v) {
    if (v !== undefined) {
      var dx = this.x - v.x;
      var dy = this.y - v.y;
      return dx * dx + dy * dy;
    } else {
      return NaN;
    }
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  getNormalized: function() {
    return new Vec2D(this.x, this.y).normalize();
  },
  getPerpendicular: function() {
    return new Vec2D(this.x, this.y).perpendicular();
  },
  interpolateTo: function(v, f) {
    return new Vec2D(this.x + (v.x -this.x) * f, this.y + (v.y - this.y) * f);
  },
  normalize: function() {
    var mag = this.x * this.x + this.y * this.y;
    if (mag > 0) {
      mag = 1.0 / Math.sqrt(mag);
      this.x *= mag;
      this.y *= mag;
    }
    return this;
  },
  normalizeTo: function(len) {
    var mag = Math.sqrt(this.x * this.x + this.y * this.y);
    if (mag > 0) {
      mag = len / mag;
      this.x *= mag;
      this.y *= mag;
    }
    return this;
  },
  perpendicular: function() {
    var t = this.x;
    this.x = -this.y;
    this.y = t;
    return this;
  },
  scale: function(a) {
    return new Vec2D(this.x * a, this.y * a);
  },
  sub: function(a,b){
    return new Vec2D(this.x -a.x, this.y - a.y);
  },
}

// http://toxiclibs.org/docs/core/toxi/geom/Line2D.html
function Line2D(a, b) {
  this.a = a;
  this.b = b;
}

Line2D.prototype = {
  intersectLine: function(l) {
    var isec,
    denom = (l.b.y - l.a.y) * (this.b.x - this.a.x) - (l.b.x - l.a.x) * (this.b.y - this.a.y),
    na = (l.b.x - l.a.x) * (this.a.y - l.a.y) - (l.b.y - l.a.y) * (this.a.x - l.a.x),
    nb = (this.b.x - this.a.x) * (this.a.y - l.a.y) - (this.b.y - this.a.y) * (this.a.x - l.a.x);
    if (denom !== 0) {
      var ua = na / denom,
      ub = nb / denom;
      if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
        isec =new Line2D.LineIntersection(Line2D.LineIntersection.Type.INTERSECTING,this.a.interpolateTo(this.b, ua));
      } else {
        isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.NON_INTERSECTING, this.a.interpolateTo(this.b, ua));
      }
    } else {
      if (na === 0 && nb === 0) {
        isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.COINCIDENT, undefined);
      } else {
        isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.COINCIDENT, undefined);
      }
    }
    return isec;
  }
}


Line2D.LineIntersection = function(type, pos) {
  this.type = type;
  this.pos = pos;
}

Line2D.LineIntersection.Type = { COINCIDENT: 0, PARALLEL: 1, NON_INTERSECTING: 2, INTERSECTING: 3};

window.MathUtils = {
  getPointInQuadraticCurve: function(t, p1, pc, p2) {
    var x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pc.x + t * t * p2.x;
    var y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pc.y + t * t * p2.y;
    return new Vec2D(x, y);
  },
  // http://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
  // http://www.math.vanderbilt.edu/~schectex/courses/cubic/
  getNearestPoint: function (p1, pc, p2) {
    var v0 = pc.sub(p1);
    var v1 = p2.sub(pc);
    var a = v1.sub(v0).dot(v1.sub(v0));
    var b = 3 * (v1.dot(v0) - v0.dot(v0));
    var c = 3 * v0.dot(v0) - v1.dot(v0);
    var d = -1 * v0.dot(v0);
    var p = -b / (3 * a);
    var q = p * p * p + (b * c - 3 * a * d) / (6 * a * a);
    var r = c / (3 * a);
    var s = Math.sqrt(q * q + Math.pow(r - p * p, 3));
    var t = MathUtils.cbrt(q + s) + MathUtils.cbrt(q - s) + p;
    return t;
  },
  // http://stackoverflow.com/questions/12810765/calculating-cubic-root-for-negative-number
  cbrt: function (x) {
    var sign = x === 0 ? 0 : x > 0 ? 1 : -1;
    return sign * Math.pow(Math.abs(x), 1/3);
  }
}

function download_file(name, contents, mime_type) {
  mime_type = mime_type || "text/plain";
  var blob = new Blob([contents], {type: mime_type});
  var dlink = document.createElement('a');
  dlink.download = name;
  dlink.href = window.URL.createObjectURL(blob);
  dlink.onclick = function(e) {
  // revokeObjectURL needs a delay to work properly
    var that = this;
    setTimeout(function() {
      window.URL.revokeObjectURL(that.href);
    }, 1500);
  };
  dlink.click();
  dlink.remove();
}


// Function related to Cypher Export

function createNodeCypher (nodeID, nodeLabels, stringAttributes, numberAttributes) {
  if (!Array.isArray(nodeLabels)) {
    nodeLabels = [nodeLabels];
  }
  if (stringAttributes === undefined) {
    stringAttributes = {};
  }
  if (numberAttributes === undefined) {
    numberAttributes = {};
  }
  var declarationPart = nodeID + ":" + nodeLabels.join(':');
  var attributes = [];
  var attributesPart = '';
  var i;
  var strKeys = Object.keys(stringAttributes);
  var numberKeys = Object.keys(numberAttributes);

  for (i = 0; i < strKeys.length; i++) {
    attributes.push(strKeys[i] + ' : "' + stringAttributes[strKeys[i]] + '"');
  }
  for (i = 0; i < numberKeys.length; i++) {
    attributes.push(numberKeys[i] + ' : ' + numberAttributes[numberKeys[i]]);
  }

  if (attributes.length > 0) {
    attributesPart = "{" + attributes.join(',') + "}";
  }
  return '(' + declarationPart + attributesPart + ')';
};

function createLinkCypher (fromID, toID, label, isOriented) {
  if (isOriented === undefined) {
    isOriented = false;
  }
  var link = '(' + fromID + ')-[:' + label + ']-';
  if (isOriented) {
    link += '>';
  }
  link += '(' + toID + ')';
  return link;
};

function intersectManeuversToCypher (maneuvers) {
  var id = maneuvers.n;

  coords = [];

  maneuvers.coords.forEach(c => {
    val_x = (((c.x/1535.5) * 4) - 2);
    val_y = - (((c.y/1535.5) * 4) - 2);
    coords.push('"'+val_x+','+val_y+'"');
  })
  var creationPart = createNodeCypher(
    id,
    "Maneuvers",
    {name: maneuvers.n},
    {
      list_coords: "["+coords+"]",
      length : maneuvers.length
    }
  );
  var link1 = createLinkCypher(maneuvers.n.split("S")[0], maneuvers.n, "SUB", true);
  return [creationPart, link1].join(',');
}

function maneuversToCypher (maneuvers) {
  var id = maneuvers.n.split("M")[0]+maneuvers.n.split("M")[1];
  tab_white = [];

  maneuvers.white.forEach(c => {
    val_x = (((c.x/1535.5) * 4) - 2);
    val_y = -(((c.y/1535.5) * 4) - 2);
    tab_white.push('"'+val_x+','+val_y+'"');
  })
  tab_yellow = [];
  maneuvers.yellow.forEach(c => {
    val_x = (((c.x/1535.5) * 4) - 2);
    val_y = -(((c.y/1535.5) * 4) - 2);
    tab_yellow.push('"'+val_x+','+val_y+'"');
  })
  var creationPart = createNodeCypher(
    id,
    "Maneuvers",
    {name: maneuvers.n},
    {
      white: "["+tab_white+"]",
      yellow: "["+tab_yellow+"]",
      length : maneuvers.length * 2
    }
  );
  var link1 = createLinkCypher(maneuvers.n.split("M")[0], maneuvers.n.split("M")[0]+maneuvers.n.split("M")[1], "SUB", true);
  return [creationPart, link1].join(',');
}

function experienceToCypher (elem) {
  var id = "E"+nb_exp++;
  var link_id;
  if (String(elem.n).includes("S")) {
    link_id = elem.n;
    var length = 0;
    list_man.forEach (m => {
      if (elem.n == m.n.split('M')[0]) {
        length = length +  m.length;
      }
    })
    duration = 0.2 *  length;
  }
  else {
    link_id = "I"+elem.n;
    duration = 0.2 *  10;
  }
  var creationPart = createNodeCypher(
    id,
    "Experience",
    {name: id},
    {
      beginTime: " '"+ new Date().toISOString().slice(0,-5)+"'",
      passageTime: duration,
      actionType : "'move'",
      state : "'SUCCES'",
      achieve : 71
    }
  );
  var link1 = createLinkCypher(link_id, id, "FROM", true);
  return [creationPart, link1].join(',');
};

function intersectionToCypher (intersection) {
  var id = "I"+intersection.n;
  var creationPart = createNodeCypher(
    id,
    "Intersection",
    {name: "I"+intersection.n},
    {
      radius: 6,
      x: intersection.x * 2,
      y: intersection.y * 2,
    }
  );
  return creationPart;
};

function sectionToCypher (section) {
  var idSection = section.n;
  var length = 0;

  list_man.forEach (m => {
    if (section.n == m.n.split('M')[0]) {
      length = length +  m.length;
    }
  })
  var creationPart = createNodeCypher(
    idSection,
    "Section",
    {name: section.n},
    {
      x:section.x * 2 ,
      y:section.y * 2 ,
      origin: "\""+section.origin+"\"",
      radius: 6 * 2 ,
      length:length * 2
    }
  );
  var query = creationPart;
  for (let index = 0; index < section.intersect.length; index++) {
    const element = section.intersect[index];
    var link = createLinkCypher(section.n, "I"+element.split('-')[0], "LINK", true);
    query = [query, link].join(',');
  }
  return query;
};

function robotToCypher (){
  return "(r:Robot{name : 'rHoA'}),(w:Wheels{amount : 2}),(c:Camera),(o:Odometry{x : 0,y : 0,z : 0}),(r)-[:CONF]->(w),(r)-[:CONF]->(c),(r)-[:STATE]->(o),(I0)-[:CONTAINS]->(r)"
}

function depotToCypher (){
  return "(d:Depot{name : 'D1'}),(I3)-[:CONTAINS]->(d)"
}

  /**
 * Converts the GridMap to an XML understandable by Gazebo
 * @returns {string}
 */
 function to_graph(name,list_section, list_man, list_rect) {
   var i;
   var cypher = 'CREATE ';
   var nodesCreationCypher = [];
   // Converting the intersections
   for (i = 0; i < list_rect.length; i++) {
     nodesCreationCypher.push(intersectionToCypher(list_rect[i]));
   }
   for (i = 0; i < list_section.length; i++) {
     nodesCreationCypher.push(sectionToCypher(list_section[i]));
   }
   for (let index = 0; index < list_man.length; index++) {
     nodesCreationCypher.push(maneuversToCypher(list_man[index]));
   }
   getListIntersectMan(list_section);
   for (let index = 0; index < list_man_intersect.length; index++) {
     nodesCreationCypher.push(intersectManeuversToCypher(list_man_intersect[index]));
   }
   for (i = 0; i < list_rect.length; i++) {
     nodesCreationCypher.push(experienceToCypher(list_rect[i]));
   }
   for (i = 0; i < list_section.length; i++) {
     nodesCreationCypher.push(experienceToCypher(list_section[i]));
   }
   nodesCreationCypher.push(robotToCypher());
   nodesCreationCypher.push(depotToCypher());
   cypher += nodesCreationCypher.join(',');
   return cypher;
 };

init();
