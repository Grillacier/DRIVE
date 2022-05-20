var canvas, ctx;

var thickness = 40;
//The App is currently designed through global variables however a DP singleton would be more appropriate
let app = [];
let undo = [];


//Stolen 
function parseXmlToJson(xml, end = true ) {
    const json = {};
    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
        const key = res[1] || res[3];
        const value = res[2] && parseXmlToJson(res[2],false);
        json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;

    }
    if(end){
        console.log(json)
    }
    return json;
}

class Selected {
    constructor(drag, containingObject = null, controlPoint = null) {
        this.drag = drag;
        this.containingObject = containingObject; // The object which the selected Point is part of
        this.controlPoint = controlPoint; // The control point associated to this Drag
        this.name = "";
    }
    isDraggable() {
        if (this.drag) {
            return this.drag.isDraggable();
        }
    }
}
function diffxy(diff, pointA, pointB) {
    if (pointA == null || pointB == null) return diff;
    diff.x = 2 * pointA.x - pointB.x;
    diff.y = 2 * pointA.y - pointB.y;
    return diff;
}

//Allow us to get the position of the mouse inside of the canvas
function MousePos(event) {
    event = event ? event : window.event;
    return {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop,
    };
}
// This function is supposed to modify the position of all control points so that every road stay connected
function changeControlPoint(coupleControl) {
    for (let index = 0; index < coupleControl.length; index++) {
        const element = coupleControl[index];
        var diffX;
        var diffY;

        diffX = 2 * element.point.x - element.a.x;
        diffY = 2 * element.point.y - element.a.y;

        var newD = new Vec2D(diffX, diffY);
        element.b.x = newD.x;
        element.b.y = newD.y;
        var couple = { point: element.point, a: element.a, b: element.b, diffX: diffX, diffY: diffY };
        coupleControl[index] = couple;
    }
}
/**
 * Function used to readjust the position of the controle point so that the road feels natural
 * @param {Curves} curve 
 * @returns 
 */
function tmp(curve){
    let diffX
    let diffY
    if(curve.controlPoint1 != null){

        diffX = 2 * curve.listDrag[0].pos.x - curve.controlPoint1.pos.x 
        diffY = 2 * curve.listDrag[0].pos.y - curve.controlPoint1.pos.y 
    }else if(curve.controlPoint2 != null){
        diffX = 2 * curve.controlPoint2.pos.x - curve.listDrag[2].pos.x
        diffY = 2 * curve.controlPoint2.pos.y - curve.listDrag[2].pos.y
    }
    else{
        return null
    }
    return {x : diffX,y : diffY}
}
//TODO Modify element a and b so that they are Vec2D when Line2D use them
// Rename this function to a non lame 
function actualReadjustfunct(curve ){
    let firstLine
    let secondline
    let retVal
    let start = new Vec2D(curve.listDrag[0].pos.x,curve.listDrag[0].pos.y)
    let end = new Vec2D(curve.listDrag[2].pos.x,curve.listDrag[2].pos.y)
    let control = new Vec2D(curve.listDrag[1].pos.x,curve.listDrag[1].pos.y)
    if(curve.controlPoint1 != null){
        let controlPoint1 = new Vec2D(curve.controlPoint1.pos.x,curve.controlPoint1.pos.y)
        firstLine = new Line2D(controlPoint1,start)
        if(curve.controlPoint2 != null){
            let controlPoint2 = new Vec2D(curve.controlPoint2.pos.x,curve.controlPoint2.pos.y)
            secondline = new Line2D(end,controlPoint2)
        }
        else{
            secondline = new Line2D(control,end)
            
        }
    }else if(curve.controlPoint2 != null){
        let controlPoint2 = new Vec2D(curve.controlPoint2.pos.x,curve.controlPoint2.pos.y)
        firstLine = new Line2D(start,control)
        secondline = new Line2D(end,controlPoint2)
    }
    else{
        return null
    }
        retVal = firstLine.intersectLine(secondline) 
    if((retVal.type == Line2D.LineIntersection.Type.INTERSECTING || retVal.type == Line2D.LineIntersection.Type.NON_INTERSECTING  )
        && withinBounds(retVal.pos))
            return retVal.pos
        else
            return null
}
function createSection (e,selected) { //TODO Add it as a static method to Section once it's made as a proper object 
    
	let point1 = selected.drag
	let point2 = new Vec2D(selected.drag.getX(), e.offsetY);
	let point3 = new Vec2D(e.offsetX, e.offsetY);
	if (selected.containingObject != undefined){
		if(selected.containingObject instanceof Intersect){
            // let x = point1.pos.x - selected.containingObject.getCenterRect().pos.x + point1.pos.x
            // let y = point1.pos.y - selected.containingObject.getCenterRect().pos.y + point1.pos.y 
            // point2 = new Vec2D(x,y)
			return new Section([point1, point2, point3],selected.containingObject,null,null,"",selected.containingObject.getCenterRect(),null)
		}
		if(selected.containingObject instanceof Section){
			selected.containingObject.addCurve(e,selected.drag)
			return selected.containingObject
		}
	}
	else
		return new Section([point1, point2, point3]);
}
function withinBounds(element){
    return element.x > 0 && element.x < 1536 && element.y > 0 && element.y < 1536
}
//doubleclick related utils
function dblclickrobot(e) {
    let pos = MousePos(e);
    let rb = { x: parseFloat(pos.x), y: parseFloat(pos.y), link: "" };
    app.robot = rb;
    return;
}

function dblclickdepot(e) {
    let pos = MousePos(e);
    let dep = { x: parseFloat(pos.x), y: parseFloat(pos.y), name: "pharma" };
    app.listDepot.push(dep);
    return;
}

function dblclickrect(e, l) {
    let pos = MousePos(e);
    let p_x = parseFloat(pos.x);
    let p_y = parseFloat(pos.y);
    app.addIntersection(new Intersect(p_x, p_y, l));
    return;
}

function dblclickcirl(e, l) {
    let pos = MousePos(e);
    let p_x = parseFloat(pos.x);
    let p_y = parseFloat(pos.y);
    let cirl = {
        n: nbcirl,
        x: p_x,
        y: p_y,
        length: l,
        list_circle: [
            { n: nbcirl + "-c1", x: p_x, y: p_y + l / 2.0, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c2", x: p_x + l / 2.0, y: p_y, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c3", x: p_x + l, y: p_y + l / 2.0, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c4", x: p_x + l / 2.0, y: p_y + l, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c5", x: p_x + l / 8.0, y: p_y + l / 8.0, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c6", x: p_x + 0.875 * l, y: p_y + l / 8.0, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c7", x: p_x + l / 8.0, y: p_y + l * 0.875, length: 150, empty: true, section: "" },
            { n: nbcirl + "-c8", x: p_x + l * 0.875, y: p_y + l * 0.875, length: 150, empty: true, section: "" },
        ],
    };
    nbcirl++;
    list_cirl.push(cirl);
    return;
}

function dblclickline(e) {
    if (app.hasSelect()) {
		let newSect = createSection(e,app.getSelected())
        app.addSection(newSect);
        app.selected = null;
    } else {
        app.selectPointAt(e.offsetX, e.offsetY);
    }
}

//Draw related utils not commented because I don't understand what they do
function draw_robot() {
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(app.robot.x - 10, app.robot.y - 10);
    ctx.lineTo(app.robot.x + 10, app.robot.y + 10);
    ctx.moveTo(app.robot.x + 10, app.robot.y - 10);
    ctx.lineTo(app.robot.x - 10, app.robot.y + 10);
    ctx.stroke();
    ctx.strokeStyle = "#959595";
}

function draw_fill_rect(ctx, fill, a, b, c, d) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.rect(a, b, c, d);
}

function fill_list_circle_empty(c, ctx, r, indLeft) {
    var elem = { x: c.x, y: c.y };
    var elem2 = { x: r.list_circle[indLeft].x, y: r.list_circle[indLeft].y };
    elem = set_draw_elem(ctx, c, elem);

    if (r.list_circle[indLeft].n.includes("c2")) {
        elem2.x = r.list_circle[indLeft].x - r.list_circle[indLeft].length / 2;
        elem2.y = r.list_circle[indLeft].y + r.list_circle[indLeft].length / 2 - thickness;
    }
    if (r.list_circle[indLeft].n.includes("c3")) {
        elem2.x = r.list_circle[indLeft].x - r.list_circle[indLeft].length / 2 + thickness;
        elem2.y = r.list_circle[indLeft].y - r.list_circle[indLeft].length / 2;
    }
    if (r.list_circle[indLeft].n.includes("c4")) {
        elem2.x = r.list_circle[indLeft].x + r.list_circle[indLeft].length / 2;
        elem2.y = r.list_circle[indLeft].y - r.list_circle[indLeft].length / 2 + thickness;
    }
    if (r.list_circle[indLeft].n.includes("c1")) {
        elem2.x = r.list_circle[indLeft].x + r.list_circle[indLeft].length / 2 - thickness;
        elem2.y = r.list_circle[indLeft].y + r.list_circle[indLeft].length / 2;
    }

    draw_strokeStyle(ctx, c, r, indLeft);
    ctx.beginPath();
    ctx.moveTo(elem.x, elem.y);
    ctx.lineWidth = 2;
    ctx.lineTo((elem2.x + elem.x) / 2.0, (elem2.y + elem.y) / 2.0);
    ctx.stroke();

    draw_strokeStyle(ctx, c, r, indLeft);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo((elem2.x + elem.x) / 2.0, (elem2.y + elem.y) / 2.0);
    ctx.lineTo(elem2.x, elem2.y);
    ctx.stroke();
}

function fill_list_circle(c, ctx, r, indLeft, centerRect) {
    var elem = { x: c.x, y: c.y };
    var elem2 = { x: r.list_circle[indLeft].x, y: r.list_circle[indLeft].y };
    elem = set_draw_elem(ctx, c, elem);

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
    if (r.list_circle[indLeft].n.includes("c2") | r.list_circle[indLeft].n.includes("c4")) ctx.quadraticCurveTo(elem2.x, elem.y, elem2.x, elem2.y);
    if (r.list_circle[indLeft].n.includes("c1")) ctx.quadraticCurveTo(elem.x, elem2.y, elem2.x, elem2.y);
    if (r.list_circle[indLeft].n.includes("c3")) ctx.quadraticCurveTo(elem.x, elem2.y, elem2.x, elem2.y);

    draw_strokeStyle(ctx, c, r, indLeft);

    ctx.stroke();
}
function set_draw_elem(ctx, c, elem) {
    ctx.strokeStyle = "#959595";
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
function draw_strokeStyle(ctx, c, r, indLeft) {
    if (c.n.includes("c3") && r.list_circle[indLeft].n.includes("c2")) {
        ctx.strokeStyle = "#FFFFFF";
    }
    if (c.n.includes("c4") && r.list_circle[indLeft].n.includes("c3")) {
        ctx.strokeStyle = "#FFFFFF";
    }
    if (c.n.includes("c2") && r.list_circle[indLeft].n.includes("c1")) {
        ctx.strokeStyle = "#FFFFFF";
    }
    if (c.n.includes("c1") && r.list_circle[indLeft].n.includes("c4")) {
        ctx.strokeStyle = "#FFFFFF";
    }
}
function p_rect(p, c) {
    return {dx : c.x - p.x,dy : c.y - p.y};
}
function export_json() {
    let str = JSON.stringify(app);
    return str;
}

function newExportJSON(app ){
    let newJSON = {}
    newJSON.listSection = app.list_section.map((value) => value.toJSON())
    newJSON.listIntersection = app.list_intersection
    newJSON.listDepot = app.listDepot
    newJSON.robot = app.robot
    return JSON.stringify(newJSON)
}


function import_json(txt, app) {
    let newApp = JSON.parse(txt);
    app = app.setApp(newApp);
}

function d_undo() {
    if (undo.length > 0) {
        app = app.setApp(undo.pop());
        app.draw();
    }
}
/**
 * Set the  type to the saved objects
 * @param {*} newApp
 * @param {*} savedApp
 */
function setApp(newApp, savedApp) {}

function download_file(name, contents, mime_type) {
    mime_type = mime_type || "text/plain";
    var blob = new Blob([contents], { type: mime_type });
    var dlink = document.createElement("a");
    dlink.download = name;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function (e) {
        // revokeObjectURL needs a delay to work properly
        var that = this;
        setTimeout(function () {
            window.URL.revokeObjectURL(that.href);
        }, 1500);
    };
    dlink.click();
    dlink.remove();
}
function save_canvas(canvas, name) {
    canvas.toDataURL();
    canvas.toBlob(tmptoBlob(blob), name);
}

function tmptoBlob(blob, name) {
    const timestamp = Date.now().toString();
    const a = document.createElement("a");
    document.body.append(a);
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
    a.remove();
}

function robotToCypher() {
    return "(r:Robot{name : 'rHoA'}),(w:Wheels{amount : 2}),(c:Camera),(o:Odometry{x : 0,y : 0,z : 0}),(r)-[:CONF]->(w),(r)-[:CONF]->(c),(r)-[:STATE]->(o),(I0)-[:CONTAINS]->(r)";
}

function depotToCypher() {
    return "(d:Depot{name : 'D1'}),(I3)-[:CONTAINS]->(d)";
}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    app = new App();
    canvas.width = 1536;
    canvas.height = 1536;
    document.body.appendChild(canvas);
    //window.addEventListener('resize', resize );
    canvas.addEventListener("mousedown", app.mouseDown);
    canvas.addEventListener("mouseup", app.mouseUp);
    canvas.addEventListener("mousemove", app.mouseMove);
    canvas.addEventListener("dblclick", app.dblclick);
    document.getElementById("rect").onclick = function () {
        app.changeModeTo("rect");
    };
    document.getElementById("robot").onclick = function () {
        app.changeModeTo("robot");
    };
    document.getElementById("cirl").onclick = function () {
        app.changeModeTo("cirl");
    };
    document.getElementById("line").onclick = function () {
        app.changeModeTo("line");
    };
    document.getElementById("depot").onclick = function () {
        app.changeModeTo("depot");
    };
    document.getElementById("save").onclick = function () {
        const timestamp = Date.now().toString();
        save_canvas(canvas, `export-${timestamp}.png`);
    };
    document.getElementById("graph").onclick = function () {
        download_file("test.cql", app.to_graph(), "text/plain");
    };
    document.getElementById("und").onclick = function () {
        d_undo();
    };
    document.getElementById("importjs").onclick = function () {
        lireFichierTexte("D:Downloads 2editeur ehoaexp.json");
    };
    document.getElementById("exportjs").onclick = function () {
        download_file("exp.json", export_json(), "text/plain");
    };
    document.getElementById("exportxml").onclick = function () {
        download_file("exp.xml", createXMLRoad(app,document.implementation.createDocument("", "", null)), "text/plain");
    };
    // document.getElementById('toPrint').onclick=  function() {app.toPrint(297,210,canvas)};
    document.getElementById("btnControl").addEventListener("click", function (e) {
        app.drawControlPoints = !app.drawControlPoints;
        app.draw();
    });
    document.getElementById("btnSplit").addEventListener("click", function (e) {
        app.useSplitCurve = !app.useSplitCurve;
        app.draw();
    });
    document.getElementById("btnDraw").addEventListener("click", function (e) {
        app.drawPoints = !app.drawPoints;
        app.draw();
    });
    // document.getElementById('next').addEventListener('click', function(e) { app.drawPoints = !app.drawPoints; app.draw() } );

    /*code de la courbe test*/
    // positions = [ {pos :{x:300, y:250}}, {pos :{x:200, y:325}}, {pos :{x:401, y:400}} ];
    // app.addSection( new Section(positions,[]))
    // positions2 = [ {x:400+300, y:400+250}, {x:400+200, y:400+325}, {x:400+401, y:400+400} ];
    // let testSection = new Section(positions2,[]);
    // app.tmp = testSection;
    //app.coupleControl.push(positions[1]);
    // fill_backup();
    app.draw(ctx, app);
    ctx.beginPath();
    // ctx.moveTo(positions[0].x+100,positions[0].y);
    // ctx.quadraticCurveTo(positions[1].x +100,positions[1].y,positions[2].x +100,positions[2].y);
    ctx.stroke();
}
//End of Utils section

class App {
    constructor() {
        this.tmp; //If it's still there remove it
        this.list_section = [];
        this.list_intersection = [];
        //TODO : Implement getter and setter for theses element
        this.thickness = 40; //Normalized vector size (Used for draw methods)
        this.useSplitCurve = true; //Can we split the Bezier function used to draw the curves (allow us to have more accurate curves)
        this.drawPoints = true; //Draw control points for curves
        this.drawControlPoints = true;
        this.selected = null; //selected point
        this.controlSelect = [];
        this.selectPoint;
        this.coupleControl = [];
        this.mode = "";
        this.robot = { x: -5, y: -5 };
        this.listDepot = [];
        this.mouseisDown = false; //Is the user still clicking
        this.mouseMoved = false; //Did the user move the mouse after pressing it
        
    }
    /**
     * get the stringified version of the object and properly set the proper type for it and each object contained in it
     * @param {String} txt Name of the file containing a saved JSON of the app
     * @returns {App}
     */
    setApp(savedApp) {
        let newApp = new App();
        newApp.list_intersection = [];
        newApp.list_section = [];
        newApp.useSplitCurve = savedApp.useSplitCurve; //Can we split the Bezier function used to draw the curves (allow us to have more accurate curves)
        newApp.drawPoints = savedApp.drawPoints; //Draw control points for curves
        newApp.drawControlPoints = savedApp.drawControlPoints;
        newApp.coupleControl = savedApp.coupleControl;
        newApp.mode = "";
        newApp.robot = savedApp.robot;
        newApp.listDepot = savedApp.listDepot;

        for (let i = 0; i < savedApp.list_intersection.length; i++) {
            const element = savedApp.list_intersection[i];
            newApp.list_intersection.push(new Intersect(element.x, element.y, element.l, element.nb, element.list_circle));
        }
        Intersect.nb = newApp.list_intersection.length - 1;

        for (let i = 0; i < savedApp.list_section.length; i++) {
            const element = savedApp.list_section[i];
            newApp.list_section.push(new Section(element.pos, element.intersect, element.n, JSON.parse(JSON.stringify(element.drag)), element.origin));
        }
        Section.nb = newApp.list_section.length - 1;
        return newApp;
    }
    mouseDown(e) {
        if (app.mode != "") {
            return;
        }
        //Prevent from making a road starting and ending at the same point
        // if (app.hasSelect()) {
            // const dx = app.getSelected().drag.pos.x - e.offsetX;
            // const dy = app.getSelected().drag.pos.y - e.offsetY;
            // if (dx * dx + dy * dy < 25.0) {
                // app.selected = null;
                // return;
            // }
        // }

        app.mouseisDown = true;
        // console.log(e);
        // e.preventDefault();

        app.selectPointAt(e.offsetX,e.offsetY)
    }
    mouseMove(e) {
        let pos = MousePos(e); //NOTE : app != app

        // console.log(app);
        if (app.mouseisDown && app.hasSelect() && app.getSelected().isDraggable()) {
            app.mouseMoved = true;
            let m = new Vec2D(parseFloat(pos.x), parseFloat(pos.y));
            let d = app.getSelected().drag;
            d.pos.x = m.x;
            d.pos.y = m.y;
            //changeControlPoint(app.coupleControl);
        }
        app.draw();
        app.list_section.forEach(element => {
            element.readjustCurves()
        });
    }
    mouseUp(e) {
        if (app.mouseMoved) {
            app.selected = null;
            app.mouseMoved = false;
        }
        //x
        app.mouseisDown = false;
        app.draw();
    }
    dblclick(e) {
        switch (app.mode) {
            case "rect":
                dblclickrect(e, 150.0);
                break;
            case "depot":
                dblclickdepot(e);
                break;
            case "robot":
                dblclickrobot(e);
                break;
            case "cirl":
                dblclickcirl(e, 150.0);
                break;
            case "line":
                dblclickline(e);
                break;
        }
        app.draw();
    }
    changeModeTo(mode) {
        //TODO Find a way to make this affect the DOM
        if (mode == this.mode) {
            app.mode = "";
        } else app.mode = mode;
        console.log(this.mode);
    }
    draw() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.list_section.forEach((section) => {
			section.draw()
        });
        this.list_intersection.forEach((intersection) => {
            intersection.draw(ctx, app);
        });
        draw_robot();
        app.drawDepot();
        // newDrawSect(app.tmp);
    }
    drawDepot() {
        ctx.strokeStyle = "yellow";

        app.listDepot.forEach((d) => {
            ctx.beginPath();
            ctx.rect(d.x, d.y, 10, 10);
            ctx.stroke();
        });
        ctx.strokeStyle = "#959595";
    }
    addSection(section) {
		let tmp = app.list_section.findIndex((element)=>(element == section))
		if( tmp == -1)
        app.list_section.push(section);
        // undo.push(app.copy());
    }
    addIntersection(section) {
        app.list_intersection.push(section);
        // undo.push(app.copy());
    }
    copy() {
        let list_section = [];
        let savedState = new App();
        for (let index = 0; index < this.list_section.length; index++) {
            savedState.list_section.push(this.list_section[index].copy());
        }
        for (let i = 0; i < this.list_intersection.length; i++) {
            savedState.list_intersection.push(this.list_intersection[i].copy());
        }
        savedState.useSplitCurve = app.useSplitCurve; //Can we split the Bezier function used to draw the curves (allow us to have more accurate curves)
        savedState.drawPoints = app.drawPoints; //Draw control points for curves
        savedState.drawControlPoints = app.drawControlPoints;
        //I'm not sure if thoses need to be ported
        // savedState.selected       =  app.selected;//selected point
        // savedState.controlSelect  =  app.controlSelect;
        // savedState.selectPoint    =  app.selectPoint;
        savedState.coupleControl = app.coupleControl;
        savedState.mode = "";
        savedState.robot = app.robot;
        savedState.listDepot = app.listDepot;
        console.log(savedState);
        return savedState;
    }
    /**
     * Select a choosen point
     * @param {*} drag
     * @param {*} containingObject
     * @param {*} controlPoint
     */
    select(selected) {
        app.selected = selected

    }

    selectPointAt(x, y) {
        app.select(this.getDragAt(x,y))
    }
    getDragAt(x,y){
        let retVal = null
        let indice = 0;
        while(retVal == null && indice < app.list_section.length  ){
            const drag = app.list_section[indice].findDrags(x, y);// TODO Reformat FindDrags so that the next check is unnecessary
            if (drag != null) {
                retVal = new Selected(drag.drag,app.list_section[indice],drag.controlPoint)
            }
            indice++
        }
        indice = 0;
        while(retVal == null && indice < app.list_intersection.length  ){
            const circle = app.list_intersection[indice].findCircle(x, y);
            if (circle) {
                circle.empty = false;
                retVal = new Selected(new Drag(ctx, circle,false), app.list_intersection[indice], app.list_intersection[indice].getCenterRect());
            }
            indice++
        }
        if(retVal == null){
          retVal = new Selected(new Drag(ctx, new Vec2D(x, y)))
        }
        return retVal;
    }
    hasSelect() {
        return app.selected != null;
    }
    getSelected() {
        return this.selected;
    }
    //This function should allow us to get maneuveurs for traversal of intersection 
    getListIntersectMan() {
        //TODO: Properly implement this function
        let coords;
        for (let i = 0; i < this.list_section.length; i++) {
            const element = this.list_section[i];
        }
        this.list_section;
    }
    /**
     * Use this function to print the canvas
     * pageHeight and page refer to the size of the paper that will be used in mm
     * @param {Number} pageHeight
     * @param {Number} pageWidth
     * @param {} canvas
     */
    toPrint(pageHeight, pageWidth, canvas) {
        //The road used for precedent testing was 20cm wide IRL and is 80units wide in the test so thats the constant we'll be using
        let unitWidth = pageWidth * 0.4;
        let unitHeight = pageHeight * 0.4;
        let hiddenCtx = hiddenCanvas.getContext("2d");
        hiddenCanvas.width = unitWidth;
        hiddenCanvas.height = unitHeight;
        for (let i = 0; i < canvas.height; i += unitHeight) {
            for (let j = 0; j < canvas.width; j += unitWidth) {
                hiddenCtx.drawImage(canvas, j, i, unitWidth, unitHeight, 0, 0, unitWidth, unitHeight);
                save_canvas(hiddenCanvas, "(" + j + "," + i + ")");
            }
        }
        hiddenCanvas.width = 0;
        hiddenCanvas.height = 0;
    }
    /**
     * Export the canvas to a new Cypher file
     * @param {*} name
     * @param {*} list_section
     * @param {*} list_man
     * @param {*} list_rect
     * @returns
     */
    to_graph() {
        var i;
        var cypher = "CREATE ";
        var nodesCreationCypher = [];
        // Converting the intersections
        for (i = 0; i < app.list_intersection.length; i++) {
            nodesCreationCypher.push(this.list_intersection[i].toCypher());
        }
        for (i = 0; i < app.list_section.length; i++) {
            nodesCreationCypher.push(this.list_section[i].toCypher());
        }
        // for (let index = 0; index < list_man.length; index++) {  // TODO Implement this function
        // nodesCreationCypher.push(maneuversToCypher(list_man[index]));
        // }
        // getListIntersectMan(this.list_section); //TODO : Implement this function
        // for (let index = 0; index < list_man_intersect.length; index++) {
        // // nodesCreationCypher.push(intersectManeuversToCypher(list_man_intersect[index]));
        // }
        for (i = 0; i < app.list_section.length; i++) {
            nodesCreationCypher.push(this.list_section[i].experienceToCypher());
        }
        for (i = 0; i < app.list_section.length; i++) {
            nodesCreationCypher.push(this.list_section[i].maneuversToCypher());
        }
        nodesCreationCypher.push(robotToCypher());
        nodesCreationCypher.push(depotToCypher());
        cypher += nodesCreationCypher.join(",");
        return cypher;
    }
    toXML(){
        let xmlfile = document.implementation.createDocument("","",null)
        let geometry = createGeometry(xmlfile)

    }
}
//Class Variable App
App.alpha = 0.1745329
function createGeometry(xmlFile){
    let geometry = xmlFile.createElement("geometry")
    let scale = xmlFile.createElement("scale")
    scale.setAttribute("unit1","20") // width of a road in cm
    scale.setAttribute("unit2","80") // width of a road in the model
    let type = xmlFile.createElement("type")
    type.innerHTML = "haut-gauche"
    let referencePoint = xmlFile.createElement("refpoint")
    referencePoint.setAttribute("x","0")
    referencePoint.setAttribute("y","0")
    referencePoint.setAttribute("z","0")// We will probably need to add a few more parameters
    let visibleZone = xmlFile.createElement("visibleZone")
    let rectPointHl = xmlFile.createElement("RectPoint\-HL")
    rectPointHl.setAttribute("x","0")
    rectPointHl.setAttribute("y","0")
    rectPointHl.setAttribute("z","0")
    
    let rectPointLR = xmlFile.createElement("RectPoint\-LR")
    rectPointLR.setAttribute("x",canvas.width)
    rectPointLR.setAttribute("y",canvas.height)
    rectPointLR.setAttribute("z","0")

    visibleZone.appendChild(rectPointHl)
    visibleZone.appendChild(rectPointLR)

    geometry.appendChild(scale)
    geometry.appendChild(type)
    geometry.appendChild(referencePoint)
    geometry.appendChild(visibleZone)

    return geometry
    

}
function isLeft(point1, point2, toGuess){
    return ((point2.x - point1.x)*(toGuess.y - point1.y) < (point2.y - point1.y)*(toGuess.x - point1.x)) ;
}


function createXMLRoad(app , xmlFile){
    let map = xmlFile.createElement("map")
    let roads = xmlFile.createElement("roads")
    let sections = xmlFile.createElement("sections")
    for (let index = 0; index < app.list_section.length; index++) {
    let sectionXML = xmlFile.createElement("section".concat(index))
        const section  = app.list_section[index];
        
        //Possibly need to add some part which check if the Section is present in the BDD
        let name = xmlFile.createElement("name")
        name.setAttribute("n",section.n)
        let type = xmlFile.createElement("type")


        let curvesXML = xmlFile.createElement("curves")
        for (let j = 0; j < section.listCurves.length; j++) {
            const curve = section.listCurves[j];
            let curveXML = xmlFile.createElement("curve".concat(j))
            let controlPoints = xmlFile.createElement("bezierPoints")
            let left = (isLeft(curve.listDrag[0].pos,curve.listDrag[1].pos,curve.listDrag[2].pos)) ? curve.listDrag[2] : curve.listDrag[0]
            let right = (isLeft(curve.listDrag[0].pos,curve.listDrag[1].pos,curve.listDrag[2].pos)) ? curve.listDrag[0] : curve.listDrag[2]
            
            let leftPoint = xmlFile.createElement("leftPoint")
            leftPoint.setAttribute("x",left.pos.x)
            leftPoint.setAttribute("y",left.pos.y)
            leftPoint.setAttribute("z","0")
            
            let rightPoint = xmlFile.createElement("rightPoint")
            rightPoint.setAttribute("x",right.pos.x)
            rightPoint.setAttribute("y",right.pos.y)
            rightPoint.setAttribute("z","0")
            
            let curvePoint = xmlFile.createElement("curvePoint")
            curvePoint.setAttribute("x",curve.listDrag[1].pos.x)
            curvePoint.setAttribute("y",curve.listDrag[1].pos.y)
            curvePoint.setAttribute("z","0")

            controlPoints.appendChild(rightPoint)
            controlPoints.appendChild(leftPoint)
            controlPoints.appendChild(curvePoint)

            let curveDescription = xmlFile.createElement("curveDescription")
            if(right == curve.listDrag[0])
            curveDescription.setAttribute("StartSegment","r")
            else
            curveDescription.setAttribute("StartSegment","l")
            
            curveXML.appendChild(controlPoints)
            curveXML.appendChild(curveDescription)


            let segments = xmlFile.createElement("segments")
            //TODO the Inner and Outer Line are currently incorect
            for (let k = 0; k < curve.listSegment.length; k++) {
                const segment = curve.listSegment[k];
                let segmentXML = xmlFile.createElement("segment".concat(k))
                let innerPoint = xmlFile.createElement("InnerPoint") // Add a function here so that we can easily pass the correct inner and outer Point
                innerPoint.setAttribute("x",segment.white.x)
                innerPoint.setAttribute("y",segment.white.y)
                innerPoint.setAttribute("z","0")

                let outerPoint = xmlFile.createElement("OuterPoint")
                outerPoint.setAttribute("x",segment.yellow.x)
                outerPoint.setAttribute("y",segment.yellow.y)
                outerPoint.setAttribute("z","0")

                let innerOffset = xmlFile.createElement("InnerOffset")
                innerOffset.innerHTML = 15

                let outerOffset = xmlFile.createElement("OuterOffset")
                outerOffset.innerHTML = 15

                let segmentprops = xmlFile.createElement("segment-props")

                const middlePoint = {x: Math.abs( (segment.yellow.x + segment.white.x  )/ 2 ) ,y: Math.abs( (segment.yellow.y + segment.white.y) / 2 )}

                let centralPoint = xmlFile.createElement("MiddleWayPoint")
                centralPoint.setAttribute("x", middlePoint.x)
                centralPoint.setAttribute("y",middlePoint.y)
                centralPoint.setAttribute("z","0")
                let directionalAngle = xmlFile.createElement("directionAngle")
                directionalAngle.innerHTML = app.alpha // Angle choosed to create the subsection
                segmentprops.appendChild(centralPoint)
                segmentprops.appendChild(directionalAngle)

                

                segmentXML.appendChild(innerPoint)
                segmentXML.appendChild(innerOffset)
                segmentXML.appendChild(outerPoint)
                segmentXML.appendChild(outerOffset)
                segmentXML.appendChild(segmentprops)
                
                segments.appendChild(segmentXML)
                if(k < curve.listSegment.length -1){
                    const nextSegment = curve.listSegment[k+1]
                    const slotprops = xmlFile.createElement("slot-props")
                    let slotLength = xmlFile.createElement("slotLength")
                    const lengthWtW = Math.sqrt(Math.pow(segment.white.x - nextSegment.white.x,2)+Math.pow(segment.white.y - nextSegment.white.y,2))
                    const lengthYtY = Math.sqrt(Math.pow(segment.yellow.x - nextSegment.yellow.x,2)+Math.pow(segment.yellow.y - nextSegment.yellow.y,2))
                    const outer =  Math.max(lengthWtW,lengthYtY)
                    const inner = Math.min(lengthWtW,lengthYtY)

                    const nextMiddlePoint = {x: Math.abs( (nextSegment.yellow.x + nextSegment.white.x  )/ 2 ) ,y: Math.abs( (nextSegment.yellow.y + nextSegment.white.y) / 2 )}
                    const lengthMiddletoMiddle = Math.sqrt(Math.pow(middlePoint.x - nextMiddlePoint.x,2)+Math.pow(middlePoint.y - nextMiddlePoint.y,2))
                    slotLength.setAttribute("inner",inner)
                    slotLength.setAttribute("outer",outer)
                    slotLength.setAttribute("mean",lengthMiddletoMiddle)
                    const slopeAngle = xmlFile.createElement("slopeAngle")
                    slopeAngle.setAttribute("inner",inner)
                    slopeAngle.setAttribute("outer",outer)
                    slopeAngle.setAttribute("mean",lengthMiddletoMiddle)

                    

                    const middleWhite = {x: Math.abs( (segment.white.x + nextSegment.white.x  )/ 2 ) ,y: Math.abs( (segment.white.y + nextSegment.white.y) / 2 )}
                    const middleYellow = {x: Math.abs( (segment.yellow.x + nextSegment.yellow.x  )/ 2 ) ,y: Math.abs( (segment.yellow.y + nextSegment.yellow.y) / 2 )}
                    let top = curve.getTop()
                    let distanceLeft = distanceBetween(top,middleWhite)
                    let distanceRight = distanceBetween(top,middleYellow)
                    let distance = xmlFile.createElement("distance")
                    distance.setAttribute("leftDistance2top",distanceLeft)
                    distance.setAttribute("rightDistance2top",distanceRight)


                    slotprops.appendChild(slotLength)
                    slotprops.appendChild(slopeAngle)
                    slotprops.appendChild(distance)
                    segments.appendChild(slotprops)
                    
                }

            }

            let curveProps = xmlFile.createElement("curve-props")
            curveProps.setAttribute("LeftDistance",distanceBetween(left.pos,curve.listDrag[1].pos))
            curveProps.setAttribute("RightDistance",distanceBetween(right.pos,curve.listDrag[1].pos))
            curveProps.setAttribute("BaseDistance",distanceBetween(right.pos,left.pos))
            curveXML.appendChild(segments)
            curveXML.appendChild(curveProps)

            curvesXML.appendChild(curveXML)
            
        }

        sectionXML.appendChild(name)
        sectionXML.appendChild(type)
        sectionXML.appendChild(curvesXML)

        sections.appendChild(sectionXML)
    }


    roads.appendChild(sections)
    map.appendChild(roads)
    const serializer = new XMLSerializer
    return  serializer.serializeToString(map)
}

// Everything below this is related to the objects that constitute the app (To use modular Js you need to use a server starting one with the app may be fairly simple but I haven't done it)
// Nell Flaharty 27/07/21
 
class Intersect {
    static nb = 0;
    constructor(x, y, l, nb = null, list_circle = null) {
        this.x = x;
        this.y = y;
        if (nb == null) {
            this.nbrect = Intersect.nb++;
        } else this.nbrect = nb;
        if (list_circle == null) {
            this.list_circle = [
                { n: this.nbrect + "-c1", x: x, y: y + l / 2.0, length: 150, empty: true, section: "" },
                { n: this.nbrect + "-c2", x: x + l / 2.0, y: y, length: 150, empty: true, section: "" },
                { n: this.nbrect + "-c3", x: x + l, y: y + l / 2.0, length: 150, empty: true, section: "" },
                { n: this.nbrect + "-c4", x: x + l / 2.0, y: y + l, length: 150, empty: true, section: "" },
            ];
        } else {
            this.list_circle = list_circle;
        }

        this.length = 150.0;
    }
    draw(ctx, app) {
        draw_fill_rect(ctx, "#000000", this.x, this.y, this.length, this.length);
        ctx.fill();

        for (let index = 0; index < this.list_circle.length; index++) {
            //Iterate on circle
            const c = this.list_circle[index];
            if (app.drawPoints) {
                ctx.beginPath();
                ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI, true);
                ctx.stroke();
            }
            /*for (let index = 0; index < list_man_intersect.length; index++) {
        const element = list_man_intersect[index];
        for (let index = 0; index < element.coords.length; index++) {
          const coord = element.coords[index];
          draw_fill_rect(ctx,'#FFFFFF',coord.x, coord.y, 1, 1);
          ctx.stroke();
        }
      }*/
            var centerRect = this.getCenterRect().pos;
            var indLeft = (index - 1) % this.list_circle.length;
            if (indLeft == -1) {
                indLeft = 3;
            }
            if (!c.empty) {
                if (!this.list_circle[indLeft].empty) fill_list_circle(c, ctx, this, indLeft, centerRect);
            }
            if (this.list_circle[indLeft].empty) fill_list_circle_empty(c, ctx, this, indLeft);
        }
    }
    copy() {
        return new Intersect(this.x, this.y, this.length, this.nbrect, this.list_circle);
    }
    /**
     * Return the circle at the specified position if it's part of this intersection null otherwise
     * @param (x:number,y:number):position
     * @returns
     */
    findCircle(x,y) {
        for (let i = 0; i < this.list_circle.length; i++) {
            let circle = this.list_circle[i];
            let  difference = p_rect(circle,{x:x,y:y})
            if (difference.dx * difference.dx + difference.dy * difference.dy < 25.0) {
                return circle;
            }
        }
        return null;
    }
    toCypher() {
        let id = "I" + this.nbrect;
        let creationPart = createNodeCypher(
            id,
            "Intersection",
            { name: "I" + this.nbrect },
            {
                radius: 6,
                x: this.x * 2,
                y: this.y * 2,
            }
        );
        return creationPart;
    }
    experienceToCypher() {
        var id = "E" + nb_exp++;
        var link_id;
        link_id = "I" + this.nbrect;
        duration = 0.2 * 10;
        var creationPart = createNodeCypher(
            id,
            "Experience",
            { name: id },
            {
                beginTime: " '" + new Date().toISOString().slice(0, -5) + "'",
                passageTime: duration,
                actionType: "'move'",
                state: "'SUCCES'",
                achieve: 71,
            }
        );
        var link1 = createLinkCypher(link_id, id, "FROM", true);
        return [creationPart, link1].join(",");
    }
    //TODO Refactor the function below so that it can fit the new architecture
    /**
     * This function is used to assure every road stay consistent
     * @param {*} pointIntersec 
     * @param {*} otherPoint 
     * @param {*} controlPoint 
     * @returns 
     */
    setPoints(pointIntersec, otherPoint, controlPoint = null) {
        let centerRect = this.getCenterRect();
        let diff = new Vec2D(0, 0);
        let circle = this.findCircle(pointIntersec);
        let point1;
        let point2;
        let point3;
        diff = diffxy(diff, circle, centerRect);
        if (controlPoint != null) {
            let line1 = new Line2D(new Vec2D(centerRect.x, centerRect.y), new Vec2D(pointIntersec.x, pointIntersec.y));
            let line2 = new Line2D(new Vec2D(otherPoint.x, otherPoint.y), new Vec2D(controlPoint.x, controlPoint.y));
            point2 = line1.intersectLine(line2).pos;
        } else point2 = diff; //This part isn't accurate the selected control point should be at the intersection of the line passing centerrect and PointIntersec and other point and controlSelect
        point1 = pointIntersec;
        point3 = otherPoint;
        return { point1, point2, point3, circle };
    }
    getCenterRect() {
        return {pos:{ x: this.x + this.length / 2.0, y: this.y + this.length / 2.0 }};
    }
    getName(){
        return "I"+this.nbrect
    }
}

//This Section concerns the object and method declaration associated to the Section object

Section.nbSection = 0;
/*position :the position of the 3 control points used to draw the bezier road the points can be either pos{x,y} or Vec2D
  intersect : Intersection connected to this section*/
function Section(position, intersect = null, n = null, listDrag = null, origin = "", controlPoint0 = null, controlPoint2 = null) {
    this.n = (n == null) ? "S" + Section.nbSection++ : n //TODO Refactor this attribute as name
    this.pos = position.map((value) => (value instanceof Drag ? value.pos : value));
    if(intersect == null){
        this.intersect = []
    }
    else{
        this.intersect = [intersect]
    }
    this.origin = origin;
    this.man = { n: this.n + "M0", pos: position, white: [], yellow: [], length: 0 };
    this.x = this.pos[0].x; //TODO Rethink wether an XY position on a Section make sense
    this.y = this.pos[0].y;
    this.nb_exp = 0;
	this.listCurves =[new Curves(position,controlPoint0,controlPoint2,listDrag)];
}
Section.prototype = {
    draw: function () {
        this.man.white = []
        this.man.yellow = []
		this.listCurves.forEach((value)=>(value.draw(this)))
	},
    /**
     *  Return the drag at the position (x,y) and null if no drag is present there
     * @param {Number} x
     * @param {Number} y
     * @returns {Drag}
     */
    findDrags: function (x, y) {
        let drag = null
        let i = 0
        while( drag == null && i < this.listCurves.length ){
            drag = this.listCurves[i].findDrags(x,y)
            i++;
        }
        return drag
    },
    copy: function () {
        let listPosition = [];
        for (let i = 0; i < this.pos.length; i++) {
            const element = this.pos[i];
            listPosition.push({ x: element.x, y: element.y });
        }
        return new Section(listPosition, this.intersect, this.n, null, this.origin);
    },
    toJSON () {
        let name = this.n
        return {name : this.n , curves : this.listCurves.map((value,indice)=>(value.toJSON(indice)))}
    },
    toCypher() {
        var creationPart = createNodeCypher(
            this.n,
            "Section",
            { name: this.n },
            {
                x: this.x * 2,
                y: this.y * 2,
                origin: '"' + this.origin + '"',
                radius: 6 * 2,
                length: length * 2,
            }
        );
        var query = creationPart;
        for (let index = 0; index < this.intersect.length; index++) {
            const element = this.intersect[index];
            var link = createLinkCypher(this.n, element.getName(), "LINK", true);
            query = [query, link].join(",");
        }
        return query;
    },
    experienceToCypher: function () {
        var id = "E" + this.nb_exp;
        var link_id;
        link_id = this.n;
        var length = 0;
        length = length + this.man.length;
        duration = 0.2 * length;
        var creationPart = createNodeCypher(
            id,
            "Experience",
            { name: id },
            {
                beginTime: " '" + new Date().toISOString().slice(0, -5) + "'",
                passageTime: duration,
                actionType: "'move'",
                state: "'SUCCES'",
                achieve: 71,
            }
        );
        var link1 = createLinkCypher(link_id, id, "FROM", true);
        return [creationPart, link1].join(",");
    },
    maneuversToCypher: function () {
        var id = this.man.n.split("M")[0] + this.man.n.split("M")[1];
        tab_white = [];

        this.man.white.forEach((c) => {
            val_x = (c.x / 1535.5) * 4 - 2;
            val_y = -((c.y / 1535.5) * 4 - 2);
            tab_white.push('"' + val_x + "," + val_y + '"');
        });
        tab_yellow = [];
        this.man.yellow.forEach((c) => {
            val_x = (c.x / 1535.5) * 4 - 2;
            val_y = -((c.y / 1535.5) * 4 - 2);
            tab_yellow.push('"' + val_x + "," + val_y + '"');
        });
        var creationPart = createNodeCypher(
            id,
            "Maneuvers",
            { name: this.man.n },
            {
                white: "[" + tab_white + "]",
                yellow: "[" + tab_yellow + "]",
                length: this.man.yellow.length * 2,
            }
        );
        var link1 = createLinkCypher(this.man.n.split("M")[0], this.man.n.split("M")[0] + this.man.n.split("M")[1], "SUB", true);
        return [creationPart, link1].join(",");
    },
	addCurve(e,selectedDrag){
		let newCurve
        if(selectedDrag.containingObject instanceof Intersect){
            this.intersect.push(selectedDrag.containingObject)
        }
        let eDrag = app.getDragAt(e.offsetX,e.offsetY)
        if(eDrag.containingObject instanceof Intersect){
            this.intersect.push(eDrag.containingObject)
        }
		if(selectedDrag == this.listCurves[0].listDrag[0]){
			point1 = eDrag.drag
			point2 = {x : e.offsetX , y : selectedDrag.pos.y }
			point3 = selectedDrag
			newCurve = new Curves([point1,point2,point3],eDrag.controlPoint,this.listCurves[0].listDrag[1])
			this.listCurves[0].setControlPoint1(newCurve.listDrag[1])
            this.listCurves.unshift(newCurve)
		}
		else if(selectedDrag == this.listCurves[this.listCurves.length-1].listDrag[2]){
			point1 = selectedDrag
			point2 = {x : e.offsetX , y : selectedDrag.pos.y }
			point3 = eDrag.drag
			newCurve = new Curves([point1,point2,point3],this.listCurves[this.listCurves.length-1].listDrag[1],eDrag.controlPoint)
			this.listCurves[this.listCurves.length-1].setControlPoint2(newCurve.listDrag[1])
			this.listCurves.push(newCurve)
		}
		else{
			console.error("Error in inserting new Curve")
			console.error("SelectedDrag :")
			console.dir(selectedDrag)
		}
	},
    getManeuvers(){
        let tmp
        for (const curve in object) {
            tmp.append(curve)
        }
    },
    readjustCurves(){
        for (let index = 1; index <= this.listCurves.length; index++) {
            const element = this.listCurves[this.listCurves.length - index];
            element.readjust()
        }
    }
};

class Curves {
    constructor(positions, controlPoint1, controlPoint2,listDrag) {
        this.pos = positions.map((value) => (value instanceof Drag ? value.pos : value));
        if (controlPoint1 != null && controlPoint1 != undefined){
            let x = this.pos[0].x - controlPoint1.pos.x + this.pos[0].x
            let y = this.pos[0].y - controlPoint1.pos.y + this.pos[0].y
            positions[1] = {x:  x , y: y }
        }
        this.controlPoint1 = controlPoint1;
        this.controlPoint2 = controlPoint2;
        this.listDrag = [];
        this.listSegment = []

        positions.forEach((element) => {
            if (element instanceof Vec2D) this.listDrag.push(new Drag(ctx, element));
            else if (element instanceof Drag) {
                this.listDrag.push(element);
            } else this.listDrag.push(new Drag(ctx, new Vec2D(element.x, element.y)));
        });
		if (listDrag == null) {
			this.listDrag = positions.map((value) => {
				if (value instanceof Vec2D) return new Drag(ctx, value);
				else {
					if (value instanceof Drag) {
						return value;
					} else return new Drag(ctx, new Vec2D(value.x, value.y));
				}
			});
		} else this.listDrag = listDrag;
    }
	draw(section){
		this.listDrag.forEach((value)=>(value.draw()))
		let list_yellow = [];
		let list_white = [];
		let r = 2;
		let p1 = new Vec2D(this.listDrag[0].pos.x, this.listDrag[0].pos.y);
		let p2 = new Vec2D(this.listDrag[2].pos.x, this.listDrag[2].pos.y);
		let c = new Vec2D(this.listDrag[1].pos.x, this.listDrag[1].pos.y);
		let leftCurve = calcNewCurve(p1, c, p2, 1);
		let rightCurve = calcNewCurve(p1, c, p2, -1);
		// console.log("angle = " + angle(p1, c, p2));
		if ((p1.x == c.x && p2.x == c.x) || (p1.y == c.y && p2.y == c.y)) {
			// If the this is a line rather than a curve
			ctx.beginPath();
			for (let i = 0; i < leftCurve.length - 1; i++) {
				drawLine(leftCurve[i], leftCurve[i + 1]);
				drawLine(rightCurve[i], rightCurve[i + 1]);
			}
			ctx.strokeStyle = "#FFFFFF";
			ctx.stroke();
		}
		if (app.useSplitCurve) {
			let tmp1 = subdivide(p1, c, p2);
			leftCurve = calcNewCurve(tmp1[0], tmp1[1], tmp1[2], 1).concat(calcNewCurve(tmp1[2], tmp1[3], tmp1[4], 1));
			rightCurve = calcNewCurve(tmp1[0], tmp1[1], tmp1[2], -1).concat(calcNewCurve(tmp1[2], tmp1[3], tmp1[4], -1));
			leftCurve.splice(2, 1);
			rightCurve.splice(2, 1);
		}
		if (app.drawControlPoints) {
			for (let i = 0; i < leftCurve.length - 1; i++) {
				ctx.beginPath();
	
				drawLine(leftCurve[i], leftCurve[i + 1]);
				drawLine(rightCurve[i], rightCurve[i + 1]);
				ctx.closePath();
				ctx.strokeStyle = "#0072bc";
				ctx.stroke();
				ctx.fillStyle = "#0072bc";
				ctx.fill();
			}
		}
		if (app.drawPoints) {
			ctx.beginPath();
			list_yellow = createYellow_White(tmpName(p1, c, p2, 0.1745329), 1);
			list_white = createYellow_White(tmpName(p1, c, p2, 0.1745329), -1);
			for (let index = 0; index < list_yellow.length; index++) {
				const element = list_yellow[index];
				const element2 = list_white[index];
				ctx.beginPath();
				ctx.rect(element.x - r, element.y - r, r * 2, r * 2);
				ctx.rect(element2.x - r, element2.y - r, r * 2, r * 2);
				ctx.fillStyle = "#FFFFFF";
				ctx.strokeStyle = "#FFFFFF";
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(element.x, element.y);
				ctx.lineTo(element2.x, element2.y);
				ctx.strokeStyle = "#00008B";
				ctx.stroke();
			}
			drawCurve([p1, c, p2], "#959595");
		}
		drawCurve(leftCurve, "#FFFFFF");
		drawCurve(rightCurve, "#FFFFFF");
		//TODO thoses elements need to be added to Section find a way to get them back
        // console.log(list_white)
        this.listSegment = list_white.map((value,number)=>({white :value,yellow :list_yellow[number]}))
	}
    readjust(){ // TODO Add something to prevent the production of a curve which make the subdivide function exceed the recursion depth
        let diff = actualReadjustfunct(this)
        // Rename this function to a real lame 
        if(diff != null){
            this.listDrag[1].pos =  diff            
        }
    }
    findDrags(x, y) {
        for (let i = 0; i < this.listDrag.length; i++) {
            const drag = this.listDrag[i];
            const diff = p_rect(drag.pos,{x:x,y:y})
            if (diff.dx * diff.dx + diff.dy * diff.dy < 25.0) {
                return {drag : drag,controlPoint : this.listDrag[1]};
            }
        }
        return null;
    }
    setControlPoint1(controlPoint){
        this.controlPoint1 = controlPoint
    }
    setControlPoint2(controlPoint){
        this.controlPoint2 = controlPoint
    }
    getTop(){
        //https://math.stackexchange.com/questions/3005127/how-to-calculate-the-value-of-t-for-the-highest-point-in-a-quadratic-bezier-cu
        const tMax = (this.listDrag[0].pos.y - this.listDrag[1].pos.y) / (this.listDrag[0].pos.y + this.listDrag[2].pos.y -  2 *this.listDrag[1].pos.y)
        return window.MathUtils.getPointInQuadraticCurve(tMax,this.listDrag[0].pos,this.listDrag[1].pos,this.listDrag[2].pos)

    }
    toJSON(indice){
        let mutatedcurve = {}
        mutatedcurve.name = "curve_" + indice
        let left = (isLeft(this.listDrag[0].pos,this.listDrag[1].pos,this.listDrag[2].pos)) ? this.listDrag[2] : this.listDrag[0]
        let right = (isLeft(this.listDrag[0].pos,this.listDrag[1].pos,this.listDrag[2].pos)) ? this.listDrag[0] : this.listDrag[2]
        
        mutatedcurve.leftPoint = {x: left.pos.x ,y: left.pos.y ,z:0}
        mutatedcurve.rightPoint = {x: right.pos.x ,y: right.pos.y ,z:0}
        mutatedcurve.controlPoint = {x:this.listDrag[1].x ,y:this.listDrag[1].y ,z: 0}
        // mutatedcurve.curveDescription = xmlFile.createElement("curveDescription")
        mutatedcurve.startSegment = (right == this.listDrag[0])  ? "r" :  "l"
        let helper = {}
        helper.angle = app.alpha
        helper.whiteIsInner = (left == this.listDrag[2])
        mutatedcurve.list_segment = this.listSegment.map(this.mutateSegment,helper)
        return mutatedcurve
    }
    mutateSegment(value,indice){
        let inner = (this.whiteIsInner) ? value.white : value.yellow 
        let outer = ( ! this.whiteIsInner) ? value.white : value.yellow
        let angle = this.angle
        let segment = {}
        segment.name = "segment_" +  indice
        segment.innerpoint = { x :inner.x,y:inner.y,z:0}
        segment.outerpoint = { x :outer.x,y:outer.y,z:0}
        segment.inneroffset = 15
        segment.outerOffset = 15
        segment.directionalAngle = angle
        return segment
    }
}

//function related to Bezier curves

//This is the method used to trace a bezier curve, this function compute the position of 1 point from the curve
/**
 *  Compute the position of the point of value t in the bezier curve such that point1 = (sx,sy),controlPoint = (cp1x,cp1y) and point2 =(ex,ey)
 * @param {number} t
 * @param {number} sx
 * @param {number} sy
 * @param {number} cp1x
 * @param {number} cp1y
 * @param {number} ex
 * @param {number} ey
 * @returns
 */
function getBezierXY(t, sx, sy, cp1x, cp1y, ex, ey) {
    return {
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey,
    };
}
/**
 * Compute and draw the position of the point of value t in the bezier curve defined by point1 , controlPoint and point2
 * @param {Vec2D} point1
 * @param {Vec2D}controlPoint
 * @param {Vec2D} point2
 * @param {number} t
 * @returns {x:number,y:number}
 */
function coord_point_Bezier(point1, controlPoint, point2, t) {
    coord = getBezierXY(t, point1.x, point1.y, controlPoint.x, controlPoint.y, point2.x, point2.y);
    ctx.fillStyle = "#FFFFFF";
    ctx.rect(coord.x, coord.y, 4, 4);
    ctx.stroke();
    return coord;
}

function draw_dashed_lines(a, b, c) {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.stroke();
}

function draw_lines_to(a, b) {
    ctx.lineTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
}
function ctx_rect(a, r) {
    ctx.rect(a.x - r, a.y - r, r * 2, r * 2);
}
//Function related to saving

// external Libraries used for this project
function Drag(ctx, pos, draggable = true) {
    this.ctx = ctx;
    this.pos = pos;
    this.radius = 6;
    this.hitRadiusSq = 900;
    this.down = false;
    this.draggable = draggable; //Can we interact directly with this point
}

Drag.prototype = {
    draw: function () {
        this.ctx.beginPath();
        this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.strokeStyle = "#959595";
        this.ctx.stroke();
    },
    isDraggable: function () {
        return this.draggable == true;
    },
    getX: function () {
        return this.pos.x;
    },
    getY: function () {
        return this.pos.y;
    },
};

// http://toxiclibs.org/docs/core/toxi/geom/Vec2D.html
function Vec2D(x, y) {
    this.x = x;
    this.y = y;
}

Vec2D.prototype = {
    add: function (a) {
        return new Vec2D(this.x + a.x, this.y + a.y);
    },
    angleBetween: function (v, faceNormalize) {
        if (faceNormalize === undefined) {
            var dot = this.dot(v);
            return Math.acos(this.dot(v));
        }
        var theta = faceNormalize ? this.getNormalized().dot(v.getNormalized()) : this.dot(v);
        return Math.acos(theta);
    },
    distanceToSquared: function (v) {
        if (v !== undefined) {
            var dx = this.x - v.x;
            var dy = this.y - v.y;
            return dx * dx + dy * dy;
        } else {
            return NaN;
        }
    },
    dot: function (v) {
        return this.x * v.x + this.y * v.y;
    },
    getNormalized: function () {
        return new Vec2D(this.x, this.y).normalize();
    },
    getPerpendicular: function () {
        return new Vec2D(this.x, this.y).perpendicular();
    },
    interpolateTo: function (v, f) {
        return new Vec2D(this.x + (v.x - this.x) * f, this.y + (v.y - this.y) * f);
    },
    normalize: function () {
        var mag = this.x * this.x + this.y * this.y;
        if (mag > 0) {
            mag = 1.0 / Math.sqrt(mag);
            this.x *= mag;
            this.y *= mag;
        }
        return this;
    },
    normalizeTo: function (len) {
        var mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag > 0) {
            mag = len / mag;
            this.x *= mag;
            this.y *= mag;
        }
        return this;
    },
    perpendicular: function () {
        var t = this.x;
        this.x = -this.y;
        this.y = t;
        return this;
    },
    scale: function (a) {
        return new Vec2D(this.x * a, this.y * a);
    },
    sub: function (a, b) {
        return new Vec2D(this.x - a.x, this.y - a.y);
    },
};

// http://toxiclibs.org/docs/core/toxi/geom/Line2D.html
function Line2D(a, b) {
    this.a = a;
    this.b = b;
}

Line2D.prototype = {
    intersectLine: function (l) {
        var isec,
            denom = (l.b.y - l.a.y) * (this.b.x - this.a.x) - (l.b.x - l.a.x) * (this.b.y - this.a.y),
            na = (l.b.x - l.a.x) * (this.a.y - l.a.y) - (l.b.y - l.a.y) * (this.a.x - l.a.x),
            nb = (this.b.x - this.a.x) * (this.a.y - l.a.y) - (this.b.y - this.a.y) * (this.a.x - l.a.x);
        if (denom !== 0) {
            var ua = na / denom,
                ub = nb / denom;
            if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
                isec = new Line2D.LineIntersection(Line2D.LineIntersection.Type.INTERSECTING, this.a.interpolateTo(this.b, ua));
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
    },
};

Line2D.LineIntersection = function (type, pos) {
    this.type = type;
    this.pos = pos;
};

Line2D.LineIntersection.Type = { COINCIDENT: 0, PARALLEL: 1, NON_INTERSECTING: 2, INTERSECTING: 3 };

window.MathUtils = {
    getPointInQuadraticCurve: function (t, p1, pc, p2) {
        var x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pc.x + t * t * p2.x;
        var y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pc.y + t * t * p2.y;
        return new Vec2D(x, y);
    },
    //
    // http://www.math.vanderbilt.edu/~schectex/courses/cubic/

    /**
     * Compute the point in the curve closest to pc
     * @param {Vec2D} p1
     * @param {Vec2D} pc
     * @param {Vec2D} p2
     * @returns {number}
     */
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
        let tmp = Math.pow(r - p * p, 3);
        var s = Math.sqrt(q * q + tmp);
        var t = MathUtils.cbrt(q + s) + MathUtils.cbrt(q - s) + p;
        return t;
    },
    // http://stackoverflow.com/questions/12810765/calculating-cubic-root-for-negative-number
    cbrt: function (x) {
        var sign = x === 0 ? 0 : x > 0 ? 1 : -1;
        return sign * Math.pow(Math.abs(x), 1 / 3);
    },
};
/**
 * This function let us assign the points needed to create the side curve corresponding to the side of the road
 * @param {Vec2D} point1
 * @param {Vec2D} controlPoint
 * @param {Vec2D} point2
 * @param {number} side
 * @returns {Array[Vec2D]}
 */
function calcNewCurve(point1, controlPoint, point2, side) {
    let newCurve = [];
    let v1 = controlPoint.sub(point1);
    let v2 = point2.sub(controlPoint);
    let n1 = v1.normalizeTo(thickness).getPerpendicular();
    let n2 = v2.normalizeTo(thickness).getPerpendicular();
    let newPoint1;
    let newPoint2;
    let tmpcontrol1;
    let tmpcontrol2;
    let newcontrolPoint;
    if (side > 0) {
        newPoint1 = point1.add(n1);
        newPoint2 = point2.add(n2);
        tmpcontrol1 = controlPoint.add(n1);
        tmpcontrol2 = controlPoint.add(n2);
    } else {
        newPoint1 = point1.sub(n1);
        newPoint2 = point2.sub(n2);
        tmpcontrol1 = controlPoint.sub(n1);
        tmpcontrol2 = controlPoint.sub(n2);
    }
    if (newcontrolPoint === undefined) {
        newcontrolPoint = new Line2D(newPoint1, tmpcontrol1).intersectLine(new Line2D(newPoint2, tmpcontrol2)).pos;
    }
    newCurve.push(newPoint1);
    newCurve.push(newcontrolPoint);
    newCurve.push(newPoint2);
    return newCurve;
}
function drawLine(a, b) {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
}
function drawCurve(array, color) {
    ctx.beginPath();
    for (let i = 0; i + 2 < array.length; i = i + 2) {
        ctx.moveTo(array[i].x, array[i].y);
        ctx.quadraticCurveTo(array[i + 1].x, array[i + 1].y, array[i + 2].x, array[i + 2].y);
        ctx.strokeStyle = color;
    }
    ctx.stroke();
}

/**
 *  Subdivide a Bezier curve according to the method in http://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
 * @param {Vec2D} point1
 * @param {Vec2D} controlPoint
 * @param {Vec2D} point2
 * @returns
 */
function subdivide(point1, controlPoint, point2) {
    // The subdivide function will probably need to keep all the composant of the Section, since a subdivision must occur on both side of the road
    let t = MathUtils.getNearestPoint(point1, controlPoint, point2);
    let pt = getBezierXY(t, point1.x, point1.y, controlPoint.x, controlPoint.y, point2.x, point2.y);
    pt = new Vec2D(pt.x, pt.y);
    let t1 = point1.scale(1 - t).add(controlPoint.scale(t));
    let t2 = controlPoint.scale(1 - t).add(point2.scale(t));
    let vt = t1.sub(t2).normalizeTo(thickness);
    let linea = new Line2D(pt, pt.add(vt));
    let newControl1 = new Line2D(point1, controlPoint).intersectLine(linea).pos;
    let newControl2 = new Line2D(point2, controlPoint).intersectLine(linea).pos;
    return [point1, newControl1, pt, newControl2, point2];
}

/**
 *  Compute a vector orthogonal to the one from point to otherPoint it's size can be normalized to length
 * @param {Vec2D} point
 * @param {Vec2D} otherpoint
 * @param {number} length
 * @returns
 */
function get2pointPerpendicular(point, otherpoint, length) {
    let pt = new Vec2D(point.x, point.y);
    let pt2 = new Vec2D(otherpoint.x, otherpoint.y);
    return length === undefined ? pt.sub(pt2).getPerpendicular() : pt.sub(pt2).getPerpendicular().scale(length);
}

/**
 * Compute the value of the alpha angle as described by the Quadratic Bezier offseting paper
 * @param {Vec2D} prevpoint
 * @param {Vec2D} point
 * @param {Vec2D} nextpoint
 * @returns {Number}
 */
function angle(prevpoint, point, nextpoint) {
    let tmp1 = get2pointPerpendicular(point, prevpoint, 2);
    let tmp2 = get2pointPerpendicular(nextpoint, point, 2);
    return tmp1.angleBetween(tmp2, true);
}

//This temporary function is made to be able to draw the control points and fill the yellow and white line
//There's probably a way to make it more general by passing a function related to the criteria we want to match
function tmpName(point1, point2, point3, ceil = 2) {
    if (angle(point1, point2, point3) < ceil) {
        return [point1, point2, point3];
    }
    let retval = [];
    let newPoint = subdivide(point1, point2, point3); //Produce 5 points in newPoint featuring two smaller bezier curves
    let tmp = tmpName(newPoint[0], newPoint[1], newPoint[2], ceil);
    retval = retval.concat(tmp);
    retval.pop(); //Remove the central (third ) point which will be present twice otherwise due to the next recursive call
    tmp = tmpName(newPoint[2], newPoint[3], newPoint[4], ceil);
    retval = retval.concat(tmp);
    return retval;
}

function createYellow_White(middlelane, side) {
    let newYellow = [];
    let tmp;
    for (let i = 0; i + 2 < middlelane.length; i = i + 2) {
        tmp = calcNewCurve(middlelane[i], middlelane[i + 1], middlelane[i + 2], side);
        newYellow = newYellow.concat(tmp);
    }
    // newYellow.push(tmp[2]);
    return newYellow;
}

function newDrawSect(section) {
	// Variable names were chosen according to the paper at  : http://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
	// Refer to it if you have any question
    section.listDrag.forEach((element) => {
        element.draw();
    });
    let list_yellow = [];
    let list_white = [];
    let coord, coord2;
    let r = 2;
    let p1 = new Vec2D(section.listDrag[0].pos.x, section.listDrag[0].pos.y);
    let p2 = new Vec2D(section.listDrag[2].pos.x, section.listDrag[2].pos.y);
    let c = new Vec2D(section.listDrag[1].pos.x, section.listDrag[1].pos.y);
    let leftCurve = calcNewCurve(p1, c, p2, 1);
    let rightCurve = calcNewCurve(p1, c, p2, -1);
    console.log("angle = " + angle(p1, c, p2));
    if ((p1.x == c.x && p2.x == c.x) || (p1.y == c.y && p2.y == c.y)) {
        // If the section is a line rather than a curve
        ctx.beginPath();
        for (let i = 0; i < leftCurve.length - 1; i++) {
            drawLine(leftCurve[i], leftCurve[i + 1]);
            drawLine(rightCurve[i], rightCurve[i + 1]);
        }
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();
    }
    if (app.useSplitCurve) {
        let tmp1 = subdivide(p1, c, p2);
        leftCurve = calcNewCurve(tmp1[0], tmp1[1], tmp1[2], 1).concat(calcNewCurve(tmp1[2], tmp1[3], tmp1[4], 1));
        rightCurve = calcNewCurve(tmp1[0], tmp1[1], tmp1[2], -1).concat(calcNewCurve(tmp1[2], tmp1[3], tmp1[4], -1));
        leftCurve.splice(2, 1);
        rightCurve.splice(2, 1);
        // leftCurve = subdivide(leftCurve[0],leftCurve[1],leftCurve[2]);
        // rightCurve = subdivide(rightCurve[0],rightCurve[1],rightCurve[2]);
    }
    if (app.drawControlPoints) {
        for (let i = 0; i < leftCurve.length - 1; i++) {
            ctx.beginPath();

            drawLine(leftCurve[i], leftCurve[i + 1]);
            drawLine(rightCurve[i], rightCurve[i + 1]);
            ctx.closePath();
            ctx.strokeStyle = "#0072bc";
            ctx.stroke();
            ctx.fillStyle = "#0072bc";
            ctx.fill();
        }
    }
    if (app.drawPoints) {
        ctx.beginPath();
        list_yellow = createYellow_White(tmpName(p1, c, p2, App.alpha), 1);
        list_white = createYellow_White(tmpName(p1, c, p2, App.alpha), -1);
        for (let index = 0; index < list_yellow.length; index++) {
            const element = list_yellow[index];
            const element2 = list_white[index];
            ctx.beginPath();
            ctx.rect(element.x - r, element.y - r, r * 2, r * 2);
            ctx.rect(element2.x - r, element2.y - r, r * 2, r * 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#FFFFFF";
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            ctx.lineTo(element2.x, element2.y);
            ctx.strokeStyle = "#00008B";
            ctx.stroke();
        }
        drawCurve([p1, c, p2], "#959595");
    }
    drawCurve(leftCurve, "#FFFFFF");
    drawCurve(rightCurve, "#FFFFFF");
    section.man.white = list_white;
    section.man.yellow = list_yellow;
}

function createNodeCypher(nodeID, nodeLabels, stringAttributes, numberAttributes) {
    if (!Array.isArray(nodeLabels)) {
        nodeLabels = [nodeLabels];
    }
    if (stringAttributes === undefined) {
        stringAttributes = {};
    }
    if (numberAttributes === undefined) {
        numberAttributes = {};
    }
    var declarationPart = nodeID + ":" + nodeLabels.join(":");
    var attributes = [];
    var attributesPart = "";
    var i;
    var strKeys = Object.keys(stringAttributes);
    var numberKeys = Object.keys(numberAttributes);

    for (i = 0; i < strKeys.length; i++) {
        attributes.push(strKeys[i] + ' : "' + stringAttributes[strKeys[i]] + '"');
    }
    for (i = 0; i < numberKeys.length; i++) {
        attributes.push(numberKeys[i] + " : " + numberAttributes[numberKeys[i]]);
    }

    if (attributes.length > 0) {
        attributesPart = "{" + attributes.join(",") + "}";
    }
    return "(" + declarationPart + attributesPart + ")";
}

function createLinkCypher(fromID, toID, label, isOriented) {
    if (isOriented === undefined) {
        isOriented = false;
    }
    var link = "(" + fromID + ")-[:" + label + "]-";
    if (isOriented) {
        link += ">";
    }
    link += "(" + toID + ")";
    return link;
}


function clientServer(cypher) {
    let socket  = new WebSocket("ws://localhost:8765")
    socket.send()
}

function distanceBetween(first, second) {
    if ( first != undefined && second !== undefined) {
        var dx = first.x - second.x;
        var dy = first.y - second.y;
        return Math.sqrt(dx * dx + dy * dy);
    } else {
        return NaN;
    }
}


// Main
init();

// var a =new Line2D(new Vec2D(10,400),new Vec2D(500,400))
// var b =new Line2D(new Vec2D(600,0),new Vec2D(600,600))
// console.log(a.intersectLine(b).type)
// console.log(a.intersectLine(b).pos)