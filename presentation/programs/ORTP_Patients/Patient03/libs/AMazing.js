/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * AMazing.js   :   A library to create mazes
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 23 Sep 2019 11:28:23 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
var AMazing = new function(){
this.version = '2.3.2' ;
this.date    = 'Mon 23 Sep 2019 11:27:12 (EDT)'

this.line =''; for(var i=0;i<35;i++) this.line+='-' ;
console.log(this.line) ;
console.log('AMazing version '+ this.version) ;
console.log('Updated on '+ this.date   ) ;
console.log('Developed by Abouzar Kaboudian') ;

/*========================================================================
 * readOptions
 *========================================================================
 */ 
var readOption = function(opt,val){
    if(opt != undefined ) return opt ;
    else return val ;
}

/*========================================================================
 * isNotEmpty
 *========================================================================
 */ 
var isNotEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/*========================================================================
 * intRand
 *========================================================================
 */ 
var intRand = function(j){
    return Math.floor(j*Math.random()) ;
}

/*========================================================================
 * Node : A node is a point on a Maze where walls meet
 *========================================================================
 */
var Node = class{
    constructor(opt={}){
        this._id = Node.count++ ;
        this._column = readOption(opt.column, 0) ;
        this._row    = readOption(opt.row, 0) ;
        this._links   = {} ;
        this._north  = null ;
        this._south  = null ;
        this._east   = null ;
        this._west   = null ;
    } // End of constructor ..............................................

    get id(){
        return this._id ;
    }

    get links(){
        return this._links ;
    }

    get tag(){
        return this._id.toString();
    }

    get row(){
        return this._row ;
    }

    get column(){
        return this._column ;
    }

    get north(){
        return this._north ;
    }

    set north(n){
        if (this.north){
            delete this.links[this.south.tag] ;
        }
        this._north = n ;

        if (n){
            this.links[n.tag] = n ;
        }
    }


    get south(){
        return this._south ;
    }

    set south(s){
        if (this.south){
            delete this.links[this.south.tag] ;
        }
        this._south = s ;

        if (s){
            this.links[s.tag] = s ;
        }
    }

    get east(){
        return this._east ;
    }
    set east(s){
        if (this.east){
            delete this.links[this.east.tag] ;
        }
        this._east = s ;

        if (s){
            this.links[s.tag] = s ;
        }
    }

    get west(){
        return this._west ;
    }
    set west(s){
        if (this.west){
            delete this.links[this.west.tag] ;
        }
        this._west = s ;

        if (s){
            this.links[s.tag] = s ;
        }
    }

    get noLinks(){
        var nl = 0 ;
        
        if ( this.north ) nl++ ;
        if ( this.south ) nl++ ;
        if ( this.east  ) nl++ ;
        if ( this.west  ) nl++ ;
        return nl ;
    }
            
    get noStaningLinks(){
        var nl = 0 ;
        for (var i in this.links){
            if (this.links[i].standing) nl++ ;
        }
        return nl ;
    }

    get isCorner(){
        var nsl = this.noStandingLinks ;
        if (nsl>0) return true ;
        return false ;
    }

    deleteMe(){
        delete this ;
        Node.count-- ;
        return null ;
    }
}
Node.count = 0 ;

/*========================================================================
 * Wall 
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The barrier connecting two nodes n1, and n2
 * The wall could be standing or not standing
 *========================================================================
 */
var Wall = class{
    constructor(n1,n2,opts={}){
        this._id = Wall.count++ ;
        this._begin = n1 ;
        this._end   = n2 ;
        this._vertical = false ;
        if ( opts.vertical){
            this.vertical = opts.vertical ;
        }
        if (opts.horizontal){
            this.horizontal = opts.horizontal ;
        }
        this._standing = true ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    get begin(){
        return this._begin ;
    }
    get end(){
        return this._end ;
    }

    get vertical(){
        return this._vertical ;
    }
    get horizontal(){
        return !(this._vertical) ;
    }

    set vertical(v){
        this._vertical = v ;
    }

    set horizontal(h){
        this._vertical = !(h) ;
    }
    
    get isHorizontal(){
        return this.horizontal ;
    }
    get isVertical(){
        return this.vertical  ;
    }

    set standing(n){
        this._standing = n ;
    }
    get standing(){
        return this._standing ;
    }

    get broken(){
        return !(this.standing) ;
    }

    breakDown(){
        this.standing = false ;
    }

    deleteMe(){
        delete this ;
        Wall.count-- ;
        return null ;
    }
}
Wall.count = 0 ;

/*========================================================================
 * Maze
 *========================================================================
 */
var Maze = class{
    constructor(columns,rows, opts={}){
        this._id = Maze.count++ ;
        this._grid = new Grid(columns,rows) ;
        this._generator 
            = readOption(opts.generator,
                'RecursiveBacktracker' ) ;
        this._context = null ;
        this.canvas = readOption(opts.canvas, null) ;
        this._cellColor = readOption(opts.cellColor, [1,0,0,1]) ;
        this._wallColor = readOption(opts.wallColor, [0,0,0,1]) ;
        this._cornerWidth = readOption(opts.cornerWidth, 4) ;
        this._cornerHeight = readOption(opts.cornerHeight,4) ;
        this._doors     = readOption(opts.doors,     null    ) ;
        this._doorColor = readOption(opts.doorColor, [1,1,0,1]) ;
        if (opts.cornerSize){
            this.cornerSize = opts.cornerSize ;
        }

        this._horizontalWallWidth 
            = readOption(opts.horizontalWillWidth , 2) ;
        this._verticalWallWidth 
            = readOption(opts.verticalWallWidth, 2 ) ;
        if (opts.wallWidth){
            this.wallWidth = opts.wallWidth ;
        }

        this._cellWidth = readOption(opts.cellWidth, 20 ) ;
        this._cellHeight= readOption(opts.cellHeight, 20) ;
        if (opts.cellSize){
            this.cellSize = opts.cellSize ;
        }

        this._generators = {
            BinaryTree : new BinaryTree() ,
            SideWinder : new SideWinder() ,
            AldousBroder: new AldousBroder() ,
            Wilson : new Wilson() ,
            RecursiveBacktracker : new RecursiveBacktracker() ,
            HuntAndKill : new HuntAndKill() ,
        } ;
        this.nodes = [] ;
        this.walls = {} ;
        this.initialize() ;
        this.setup() ;
    } // End of constructor ----------------------------------------------

    get id(){
        return this._id ;
    }

    get tag(){
        return this._id.toString() ;
    }

    get grid(){
        return this._grid ;
    }
    get columns(){
        return this.grid.columns ;
    }
    set columns(c){
        this.grid.columns = c ;
        this.initialize() ;
        this.setup() ;
        this.generate() ;
    }

    get rows(){
        return this.grid.rows ;
    }
    set rows(r){
        this.grid.rows = r ;
        this.initialize() ;
        this.setup() ;
        this.generate() ;
    }

    get dimensions(){
        return this.grid.dimensions ;
    }
    set dimensions(nd){
        this.grid.dimensions = nd ;
        this.initialize() ;
        this.setup() ;
        this.generate() ;
    }

    get nodes(){
        return this._nodes ;
    }
    set nodes(n){
        this._nodes = n ;
    }
    node(i,j){
        var index= j*(this.columns+1) + i ;
        return this.nodes[index] ;
    }
    cell(i,j){
        return this.grid.cell(i,j) ;
    }

    get doors(){
        var d = [] ;
        if (this._doors){
            for(var i in this._doors){
                var ind = this._doors[i] ;
                var c = this.cell(ind[0],ind[1]) ;
                c.isDoor = true ;
                d.push(c) ;
            }
        }else{
            var c ;
            c = this.cell(0,0) ;
            c.isDoor = true ;
            d.push(c) ;
            c = this.cell(this.columns-1,this.rows-1) ;
            c.isDoor = true ;
            d.push(c) ;
        }
        return d ;
    }
    set doors(nd){
        this._doors = nd ;
    }

    get doorColor(){
        return this._doorColor ;
    }

    set doorColor(c){
        this._doorColor = c ;
    }

    setDoors(s){
        if (s){
            this.doors = s ;
        }
        return this.doors ;
    }
    // generator .........................................................
    get generators(){
        return this._generators ;
    }
    get generator(){
        return this._generator ;
    }
    set generator(ng){
        if (this._generators[ng]){
            this._generator = ng ;
        }
    }
    generate(){
        this.generators[this.generator].on(this.grid) ;
        this.setup() ;
    }

    // colors ............................................................
    get cellColor(){
        return this._cellColor ;
    }

    get wallColor(){
        return this._wallColor ;
    }

    // horizontalWall ....................................................
    horizontalWall(i,j){
        var index = j*this.columns + i ;
        return this.horizontalWalls[index] ;
    }

    get horizontalWallWidth(){
        return this._horizontalWallWidth ;
    }

    set horizontalWallWidth(w){
        this._horizontalWallWidth = w ;
    }

    // verticalWall ......................................................
    verticalWall(i,j){
        var index = j*(this.columns+1) + i ;
        return this.verticalWalls[index] ;
    }

    get verticalWallWidth(){
        return this._verticalWallWidth ;
    }
    set verticalWallWidth(w){
        this._verticalWallWidth = w ;
    }

    // wallWidth : horitzontalWallWidth = verticalWallWidth ..............
    set wallWidth(w){
        this.horizontalWallWidth = w ;
        this.verticalWallWidth = w ;
    }

    // Canvas and context ................................................
    set canvas(c){
        this._canvas = c ;
        if (c){
            this._context = c.getContext('2d') ;
        }
    }

    get canvas(){
        return this._canvas ;
    }

    get context(){
        return this._context ;
    }

    // cell dimensions ...................................................
    get cellWidth(){
        return this._cellWidth ;
    }

    set cellWidth(w){
        this._cellWidth = w ;
    }

    get cellHeight(){
        return this._cellHeight ;
    }

    set cellHeight(h){
        this._cellHeight = h ;
    }

    set cellSize(ns){
        this.cellWidth = ns ;
        this.cellHeight = ns ;
    }

    // Corner dimensions .................................................
    get cornerWidth(){
        return Math.max(this.verticalWallWidth, this._cornerWidth) ;
    }

    set cornerWidth(w){
        this._cornerWidth = w ;
    }

    get cornerHeight(){
        return Math.max(this.horizontalWallWidth, this._cornerHeight ) ;
    }

    set cornerHeight(h){
        this._cornerHeight  = h ;
    }

    set cornerSize(s){
        this.cornerHeight   = s ;
        this.cornerWidth    = s ;
    }

    // Image dimensions ..................................................
    get width(){
        return (
                this.cellWidth*this.columns 
            +   this.cornerWidth 
            ) ;
    }

    get height(){
        return (
                this.cellHeight*this.rows
            +   this.cornerHeight
            ) ;
    }

    set image(i){
        this._image = i ;
    }

    get image(){
        return this._image ;
    }

/*------------------------------------------------------------------------
 * nodePosition
 *------------------------------------------------------------------------
 */
    nodePosition(n){
        var i=n.column ;
        var j=n.row ;
        var x1 , y1 ;
        x1 = i*this.cellWidth+0.5*this.cornerWidth ;
        y1 = j*this.cellHeight+0.5*this.cornerHeight ;
        return { x: x1, y:y1 } ;
    }

/*------------------------------------------------------------------------
 * setWalls
 *------------------------------------------------------------------------
 */
    setWalls(){
        for(var i in this.walls){
            this.setWall(this.walls[i]) ;
        }
    }

/*------------------------------------------------------------------------
 * setWall
 *------------------------------------------------------------------------
 */
    setWall(w){
        if (w.isVertical){
            this.setVerticalWall(w) ;
        }else{
            this.setHorizontalWall(w) ;
        }
    }

/*------------------------------------------------------------------------
 * setHorizontalWall
 *------------------------------------------------------------------------
 */
    setHorizontalWall(w){
        if (!w.standing) return ;

        var p1 = this.nodePosition(w.begin  ) ;
        var p2 = this.nodePosition(w.end    ) ;
        if (p2.x< p1.x){
            var p = p1 ;
            p1 = p2 ;
            p2 = p ;
        }
        p1.y -= this.horizontalWallWidth*0.5 ;
        p2.y += this.horizontalWallWidth*0.5 ;
        this.rectangle(p1,p2, this.wallColor) ;
    }

/*------------------------------------------------------------------------
 * setVerticalWall
 *------------------------------------------------------------------------
 */
    setVerticalWall(w){
        if (!(w.standing)) return ;

        var p1 = this.nodePosition(w.begin  ) ;
        var p2 = this.nodePosition(w.end    ) ;
        if (p2.y< p1.y){
            var p = p1 ;
            p1 = p2 ;
            p2 = p ;
        }
        p1.x -= this.verticalWallWidth*0.5 ;
        p2.x += this.verticalWallWidth*0.5 ;
        this.rectangle(p1,p2, this.wallColor) ;
    }

/*------------------------------------------------------------------------
 * setCorners
 *------------------------------------------------------------------------
 */
    setCorners(){
        for(var i in this.nodes){
            this.setCorner(this.nodes[i]) ;
        }
    }

/*------------------------------------------------------------------------
 * setCorner
 *------------------------------------------------------------------------
 */
    setCorner(n){
        if (n.isCorner ) return ;

        var p = this.nodePosition(n) ;
        var p1 = {
            x : p.x-this.cornerWidth*0.5, 
            y : p.y-this.cornerHeight*0.5 } ;
        var p2 = {
            x : p.x+this.cornerWidth*0.5, 
            y : p.y+this.cornerHeight*0.5 } ;
        this.rectangle(p1,p2, this.wallColor) ;
    }

/*------------------------------------------------------------------------
 * setCells
 *------------------------------------------------------------------------
 */
    setCells(){
        for(var i=0;i<this.columns; i++){
            for(var j=0;j<this.rows; j++){
                var c = this.cell(i,j) ;
                var n = this.node(i,j) ;
                var p1 = this.nodePosition(n) ;
                var p2 = {
                    x:p1.x+this.cellWidth, 
                    y:p1.y+this.cellHeight } ;
                var color ;
                if (c.isDoor){
                    color = this.doorColor ;
                }else{
                    color = this.cellColor ;
                }
                this.rectangle(p1,p2,color) ;
            }
        }
    }
/*------------------------------------------------------------------------
 * rectangle
 *------------------------------------------------------------------------
 */
    rectangle(c1, c2,color){
        var x1 = Math.min(c1.x,c2.x) ;
        var y1 = Math.min(c1.y,c2.y) ;
        var x2 = Math.max(c1.x,c2.x) ;
        var y2 = Math.max(c1.y,c2.y) ;

        for(var j=y1; j<y2; j++){
            for(var i=x1; i<x2; i++){
                this.setPixel(i,j,color) ;
            }
        }
    }

/*------------------------------------------------------------------------
 * setPixel
 *------------------------------------------------------------------------
 */
    setPixel(i,j,color){
        var index = (j*this.width+i)*4.0 ;
        var p = 0 ;
        this.image[index+p] = color[p++] ;
        this.image[index+p] = color[p++] ;
        this.image[index+p] = color[p++] ;
        this.image[index+p] = color[p++] ;
    }

/*------------------------------------------------------------------------
 * 
 *------------------------------------------------------------------------
 */
   clearNodes(){
       for(var i=0; i<this.nodes.length; i++){
           this.nodes[i].deleteMe() ;
       }
       this.nodes = [] ;
   }

   clearWalls(){
       for(var i in this.walls){
           this.walls[i].deleteMe() ;
       }
       this.walls = {} ;
   }

/*------------------------------------------------------------------------
 * initialize
 *------------------------------------------------------------------------
 */
    initialize(){
        this.setDoors() ;
        this.clearNodes() ;
        this.clearWalls() ;
        this.horizontalWalls = [] ;
        this.verticalWalls = [] ;
        this.wallsArray = [] ;
        this.image = new Float32Array(this.width*this.height*4) ;

        for(var j=0; j<(this.rows+1);j++){
            for(var i=0; i<(this.columns+1) ;i++){
                this.nodes.push(new Node({
                            column : i ,
                            row : j ,
                            } )) ;
            }
        }
    
        // Seting up horizontal walls ....................................
        for(var j=0; j<(this.rows+1);j++){
            for(var i=0; i<(this.columns) ;i++){
                var w = new Wall(
                        this.node(i,j),
                        this.node(i+1,j),
                        {vertical : false } ) ;
                this.node(i,j).east = w ;
                this.node(i+1,j).west = w ;

                this.horizontalWalls.push(w) ;
                this.wallsArray.push(w) ;
                this.walls[w.tag] = w ;
            }
        }

        // Setting up vertical walls .....................................
        for(var j=0; j<(this.rows);j++){
            for(var i=0; i<(this.columns+1) ;i++){
                var w = new Wall(
                        this.node(i,j),
                        this.node(i,j+1),
                        {vertical : true } ) ;
                this.node(i,j).south = w ;
                this.node(i+1,j).north = w ;
                this.verticalWalls.push(w) ;
                this.wallsArray.push(w) ;
                this.walls[w.tag] = w ;
            }
        }

    } // End of initialize()

/*------------------------------------------------------------------------
 * setup
 *------------------------------------------------------------------------
 */
    setup(){
        for(var j=0; j<this.rows; j++){
            for(var i=0; i<this.columns; i++){
                var cell = this.grid.cell(i,j) ;
                if (cell.linked(cell.east)){
                    this.verticalWall(i+1,j).standing = false ;
                }else{
                    this.verticalWall(i+1,j).standing = true ;
                }
                if (cell.linked(cell.north)){
                    this.horizontalWall(i,j+1).standing = false ;
                }else{
                    this.horizontalWall(i,j+1).standing = true ;
                }
            }
        }
        this.setCells() ;
        this.setWalls() ;
        this.setCorners() ;
        this.setDoors() ;
    } // End of setup()


}
Maze.count = 0 ;

/*========================================================================
 * Cell 
 *========================================================================
 */ 
var Cell = class{
    constructor(opt={}){
        this._column= readOption(opt.column, 0) ;
        this._row   = readOption(opt.row, 0) ;
        this._linkIds = [] ;
        this._links = {} ;
        this._id    = Cell.count++ ;
        this._north = null ;
        this._south = null ;
        this._east  = null ;
        this._west  = null ;
        this._neighbors = null ;
        this._visited = false ;
        this._door = false ;
    } // End of constructor ..............................................

/*------------------------------------------------------------------------
 * Getters and Setters
 *------------------------------------------------------------------------
 */
    get isDoor(){
        return this._door ;
    }
    set isDoor(f){
        this._door = f ;
    }
    get id(){
        return this._id ;
    }

    get tag(){
        return this._id.toString() ;
    }

    get column(){
        return this._column ;
    }
    set column(nr){
        this._column = nr ;
    }
    get row(){
        return this._row ;
    }
    set row(nc){
        this._row = nc ;
    }

    get noLinks(){
        return this._linkIds.length ;
    }
    get linkIds(){
        return this._linkIds ;
    }

    get visited(){
        return this._visited ;
    }

    set visited(v){
        this._visited = v ;
    }

    // Neibours ..........................................................
    get south(){
        return this._south ;
    }
    get north(){
        return this._north ;
    }
    get east(){
        return this._east ;
    }
    get west(){
        return this._west ;
    }
    set south(c){
        this._south = c ;
        this.setNeighbors() ;
    }
  
    set north(c){
        this._north = c ;
        this.setNeighbors() ;
    }
    set east(c){
        this._east = c ;
        this.setNeighbors() ;
    }

    set west(c){
        this._west = c ;
        this.setNeighbors() ;
    }

    get neighbors(){
        return this._neighbors ;
    }

    get noNeighbors(){
        return this.neighbors.length ;
    }

    
    setNeighbors(){
        var n = [] ;
        if (this.south){
            n.push(this.south) ;
        }
        if (this.north){
            n.push(this.north) ;
        }
        if (this.east){
            n.push(this.east) ;
        }
        if (this.west){
            n.push(this.west) ;
        }
        this._neighbors = n ;
        return this.neighbors ;
    }
    
    getLinkById(id){
        return this._links[id.toString()] ;
    }
    
    linkNo(c){
        if (!c ) return -1 ;
        for(var i=0; i<this.noLinks;i++ ){
            if (c.id == this._linkIds[i]) return i ;
        }
        return -1 ;
    }

    get linkIds(){
        return this._linkIds ;
    }

    get links(){
        return this._links ;
    }

    get hasUnvisitedNeighbor(){
        for(var i=0 ; i< this.noNeighbors ; i++){
            if (!this.neighbors[i].visited){
                return true ;
            }
        }
        return false ;
    }

    get unvisitedNeighbors(){
        var n = [] ;
        for(var i=0 ; i< this.noNeighbors ; i++){
            if (!this.neighbors[i].visited){
                n.push(this.neighbors[i]) ;
            }
        }
        return n ;
    }

    get visitedNeighbors(){
        var n=[] ;
        for(var i=0 ; i< this.noNeighbors ; i++){
            if (this.neighbors[i].visited){
                n.push(this.neighbors[i]) ;
            }
        }
        return n ;
    }

    get noVisitedNeighbors(){
        return this.visitedNeighbors.length ;
    } 

    get noUnvisitedNeighbors(){
        return this.unvisitedNeighbors.length ;
    }

/*------------------------------------------------------------------------
 * sampleUnvisitedNeighbors
 *------------------------------------------------------------------------
 */
    sampleUnvisitedNeighbors(){
        var un = this.unvisitedNeighbors ;
        return un[intRand(un.length)] ;
    }

/*------------------------------------------------------------------------
 * sampleVisitedNeighbors
 *------------------------------------------------------------------------
 */
    sampleVisitedNeighbors(){
        var vn = this.visitedNeighbors ;
        return vn[intRand(vn.length) ];
    }

/*------------------------------------------------------------------------
 * visit : mark the cell visited
 *------------------------------------------------------------------------
 */
    visit(){
        this.visited = true ;
    }

/*------------------------------------------------------------------------
 * unvisit : mark the cell unvisited
 *------------------------------------------------------------------------
 */
    unvisit(){
        this.visited = false ;
    }

/*------------------------------------------------------------------------
 * sampleNeighbors
 *------------------------------------------------------------------------
 */
    sampleNeighbors(){
        return this.neighbors[Math.floor(Math.random()*this.noNeighbors)] ;
    }

/*------------------------------------------------------------------------
 * Linked? Check if the this is linked to C
 *------------------------------------------------------------------------
 */
    linked(c){
        if (!c ) return false ;
        for(var i=0; i<this.noLinks;i++ ){
            if (c.id == this.linkIds[i]) return true ;
        }
        return false ;
    }

/*------------------------------------------------------------------------
 * link this to cell 
 *------------------------------------------------------------------------
 */
    link(cell){
        if (cell == null ||cell == undefined ) return ;
        if (this.linked(cell)) return ;
        this.linkIds.push(cell.id) ;
        this.links[cell.tag] = cell ;
        cell.link(this) ;
    }

    
/*------------------------------------------------------------------------
 * unlink this from cell
 *------------------------------------------------------------------------
 */
    unlink(cell){
        if (this.linked(cell)){
            for(var i=0; i<this.noLinks; i++){
                if (cell.id == this._linkIds[i]){
                    this.linkIds.splice(i,1) ;
                    delete this.links[cell.tag] ;
                    break ;
                }
            }
            cell.unlink(this) ;
        }
    }

    unlinkAll(){
        this.visited= false ;
        while(this.linkIds.length>0){
            this.unlink(this.links[this.linkIds[0].toString()]) ;
        }
        return true ;
    }

/*-------------------------------------------------------------------------
 * equal
 *-------------------------------------------------------------------------
 */
    equal(c){
        if (!c) return false ;
        if (c.id == this.id ) return true ;
        return false ;
    }
    equals(c){
        return this.equal(c) ;
    }
    equalTo(c){
        return this.equal(c) ;
    }
    equalsTo(c){
        return this.equal(c) ;
    }
/*------------------------------------------------------------------------
 * deleteMe
 *------------------------------------------------------------------------
 */
    deleteMe(){
        delete this._linkIds ;
        delete this._links ;
        Cell.count-- ;
        delete this ;
        return undefined ;
    }
}

Cell.count = 0 ; // initialize the number of cells


/*========================================================================
 * Grid Class
 *========================================================================
 */ 
var Grid = class{
    constructor(r,c,opts={}){
        this._id = Grid.count++ ;
        this._columns= c ;
        this._rows   = r ;
        this._cells = [] ;
        this.canvas = readOption(opts.canvas , null) ;
        this.initCells() ;
        this.configCells() ;
    }

/*------------------------------------------------------------------------
 * Getters and setters
 *------------------------------------------------------------------------
 */
    get id(){
        return this._id ;
    }

    get tag(){
        return this._id.toString();
    }

    get columns(){
        return this._columns ;
    }
    get rows(){
        return this._rows ;
    }
    get size(){
        return this.columns*this.rows ;
    }
    get canvas(){
        return this._canvas ;
    }
    set canvas(c){
        this._canvas = c ;
        if(this.canvas){
            this._context = this.canvas.getContext('2d') ;
        }
    }
    get context(){
        return this._context ;
    }
    get width(){
        if (this.canvas)
            return this.canvas.width ;
        else
            return null ;
    }
    set width(w){
        this._width = w ;
        if (this.canvas)
            this.canvas.width = w ;
    }
    set height(h){
        this._height = h ;
        if (this.canvas)
            this.canvas.hieght= h ;
    }
    get height(){
        if (this.canvas)
            return this.canvas.height ;
        else
            return null ;
    }

    get dx(){
        return this.width/this.columns ;
    }

    get dy(){
        return this.height/this.rows ;
    }

    get cells(){
        return this._cells ;
    }
    
    get dimensions(){
        return [this.rows, this.columns] ;
    }

    set dimensions(nd){
        if (nd){
            if ((nd[0] != this.rows) && (nd[1] != this.columns)){
                this.clearCells() ;
                this._rows = nd[0] ;
                this._columns = nd[1] ;
                this.initCells() ;
                this.configCells() ;
            }
        }
    }

    set rows(r){
        if (r){
            if (this._rows != r){
                this.clearCells() ;
                this._rows = r ;
                this.initCells() ;
                this.configCells() ;
            }
        }
        return this._rows ;
    }

    set columns(c){
        if (c){
            if(c != this.columns){
                this.clearCells() ;
                this._columns = c ;
                this.initCells() ;
                this.configCells() ;
            }
        }
        return this.columns ;
    }
/*------------------------------------------------------------------------
 * sample : randomly select a cell from the grid 
 *------------------------------------------------------------------------
 */
    sample(){
        return this.cells[Math.floor(Math.random()*this.size)] ;
    }
/*------------------------------------------------------------------------
 * initCells    :    create cells array
 *------------------------------------------------------------------------
 */
    initCells(){
        for(var j=0; j<this.rows;j++){
            for(var i=0; i<this.columns ; i++){
                this._cells.push(new Cell({column:i, row:j})) ;
            }
        }
    }
/*------------------------------------------------------------------------
 * clearCells
 *------------------------------------------------------------------------
 */
    clearCells(){
        for(var i=0; i<this.columns; i++){
            for(var j=0; j<this.rows; j++){
                this.cell(i,j).deleteMe() ;
            }
        }
        this._cells=[] ;
        return null ;
    }

/*------------------------------------------------------------------------
 * configCells  :   determine the north, east, west, south 
 *                  neighbours of the cells
 *------------------------------------------------------------------------
 */
    configCells(){
        for (var j=0; j<this.rows; j++){
            for(var i=0; i<this.columns; i++){
                var c   = this.cell(i,j) ;
                c.north = this.cell(i,j+1) ;
                c.south = this.cell(i,j-1) ;
                c.east  = this.cell(i+1,j) ;
                c.west  = this.cell(i-1,j) ;
            }
        }
    }

/*------------------------------------------------------------------------
 * Access the cell with the index i and j
 *------------------------------------------------------------------------
 */
    cell(i,j){
        if (j == undefined &&
            i < this.size){
            return this._cells[i] ;
        }
        if (-1 < i && 
             i < this.columns && 
            -1 < j && 
             j < this.rows ){
            var index = j*this.columns + i ;
            return this._cells[index] ;
        }else{
            return null ;
        }
    } 

/*------------------------------------------------------------------------
 * reset
 *------------------------------------------------------------------------
 */
    reset(){
        for(var i=0; i<this.size; i++){
            this.cell(i).unlinkAll() ;
            this.cell.isDoor = false ;
        }
    }

/*------------------------------------------------------------------------
 * clear
 *------------------------------------------------------------------------
 */
    clear(){
        if (this.canvas)
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height) ;
    }
/*------------------------------------------------------------------------
 * draw
 *------------------------------------------------------------------------
 */
    draw(distance, solution){
        if (this.canvas == null ) return ;
        this.clear() ;
        var ctx = this.context;
        if (distance != undefined){
            for(var i=0 ; i<this.columns; i++){
                for(var j=0; j<this.rows; j++){
                    var c = this.cell(i,j) ;
                        var d = distance.cell(c) ;
                        ctx.fillStyle = 'rgba(0,'+255.*d/distance.max+',0,255)';
                        if (solution){
                            if (solution.isOnPath(c)){
                                ctx.fillStyle = 'rgba(200,200,200,255)';
                            }
                        }
                        ctx.fillRect(i*this.dx,this.height-j*this.dy,this.dx,-this.dy);
                        ctx.stroke() ;
                }
            }
        }
        for(var i=0 ; i<this.columns; i++){
            for(var j=0; j<this.rows; j++){
                var c = this.cell(i,j) ;
                if (distance != undefined){
                    ctx.beginPath() ;
                    var d = distance.cell(c) ;
                    ctx.font = '8px Arial' ;
                    ctx.fillStyle = '#ff0000' ;
                    ctx.strokeStyle = "#000000" ;
                    ctx.textAlign = 'center' ;
                    //ctx.fillText( d, (i+0.5)*this.dx+0.5, this.height-(j+0.3)*this.dy+0.5) ;
                    ctx.stroke() ;
                }

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,0,255)' ;
                ctx.fillStyle = 'rgba(255,255,0,255)' ;
                ctx.lineWidth = 2. ;

                if (!c.linked(c.east)){
                    ctx.moveTo((i+1)*this.dx+0.5,this.height-j*this.dy+0.5) ;
                    ctx.lineTo((i+1)*this.dx+0.5,this.height-(j+1)*this.dy+0.5) ;
                    ctx.stroke() ;
                }
                if (!c.linked(c.north)){
                    ctx.moveTo((i)*this.dx+0.5,this.height-(1+j)*this.dy+0.5) ;
                    ctx.lineTo((i+1)*this.dx+0.5,this.height-(j+1)*this.dy+0.5) ;
                    ctx.stroke() ;
                }
            }
        }
        ctx.beginPath() ;
        ctx.rect(0,0,this.width,this.height) ;
        ctx.stroke() ;
    }
}   // End of the Grid class

Grid.count = 0 ;

/*=========================================================================
 * Distances class 
 *=========================================================================
 */
var Distances = class {
    constructor(r){
        this._id    = Distances.count++ ;
        this._root  = r ;
        this._cells = {} ;
        this._dist = 0 ;
        this._farthest = null ;
        this._calced = false ;
        this.calcDistances() ;
    }

    get root(){
        return this._root ;
    }

    get id(){
        return this._id ;
    }

    get cells(){
        return this._cells ;
    }

    get maxDist(){
        return this._dist ;
    }
    get max(){
        return this._dist ;js
    }
    get farthest(){
        return this._farthest ;
    }

    distance(cell, dist){
        this._cells[cell.tag] = dist ;
    }

    measured(cell){
        if ((!cell) || (this.cells[cell.tag]==undefined)) 
            return false ;
        else 
            return true ;
    }

    cell(c){
        return this.cells[c.tag] ;
    }

    get calced(){
        return this._calced ;
    }
    set calced(c){
        this._calced = c ;
    }

    calcDistances(){
        this._cells = {} ;
        this._dist = 0 ;
        this.distance(this.root,0) ;
        this._farthest = null ;
        var fronts = this.root.links ;

        while(this.numberNotMeasured(fronts)>0){
            var new_fronts = {} ;
            this._dist++ ;
            for (var f in fronts){
                var c = fronts[f] ;
                if ( !this.measured(c) ){
                    this.distance(c, this._dist) ;
                    this._farthest = c ;
                    for (var nf in c.links){
                        var link = c.links[nf] ;
                        if (!this.measured(link)){
                            new_fronts[link.tag] 
                                = link ;
                        }
                    }
                }
            }
            fronts = new_fronts ;
        }
    }
    numberNotMeasured(fronts){
        var n = 0 ;
        for(var i in fronts){
            if ( !this.measured(fronts[i])  ) n++ ;
        }
        return n ;
    }
}

Distances.count =0 ;

/*========================================================================
 * Dijkstra
 *========================================================================
 */ 
var DijkstraSolver = class {
    constructor(begin,end){
        this._id = DijkstraSolver.count++ ;
        this._begin = readOption(begin, null) ;
        this._end   = readOption(end,   null) ;

        this._distances = new Distances( this.begin ) ;
        this._pathMembers = {} ;
        this.solved = false ;
        this.solve() ;
    }

    get id(){
        return this._id ;
    }

    get tag(){
        return this._id.toString() ;
    }
    
    get grid(){
        return this._grid ;
    }

    get begin(){
        return this._begin ;
    }

    get end(){
        return this._end ;
    }

    distance(c){
        return this._distances.cell(c) ;
    }

    get path(){
        return this._path ;
    }

    get pathMembers(){
        return this._pathMembers ;
    }

    set pathMembers(pm){
        this._pathMembers = pm ;
    }

    solve(){
        this._path = [] ;
        var cell = this.end ;
        this.pathMembers = {} ;
        this._distances.calcDistances() ;
        this.solved = true ;
        this.pathMembers[cell.tag] = cell ;
        this.path.push(cell) ;
        while (cell.id != this.begin.id){
            var dist = this.distance(cell) ;
            var neighbors = cell.neighbors ;
            for(var i=0; i< neighbors.length; i++){
                if ((this.distance(neighbors[i])< dist)&&
                    cell.linked(neighbors[i])){
                    cell = neighbors[i] ;
                    this.path.push(cell) ;
                    this.pathMembers[cell.tag]= cell ;
                    break ;
                }
            }
        }
        return this.path ;
    }

    isOnPath(cell){
        if (this.pathMembers[cell.tag]) return true ;
        return false ;
    }
}
DijkstraSolver.count = 0 ;

/*========================================================================
 * BinaryTree
 *========================================================================
 */ 
var BinaryTree = class{
    // _id ;
    constructor(){
        this._id = BinaryTree.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    on(grid){
        grid.reset() ;
        for(var i=0;  i<grid.columns; i++)
            for(var j=0;  j<grid.rows; j++){

            var cell = grid.cell(i,j) ;
            var neighbors = [] ;
            var n = 0 ;
            if (cell.north){
                neighbors.push(cell.north) ;
                n++ ;
            }
            if (cell.east){
                neighbors.push(cell.east) ;
                n++ ;
            }
            cell.link(neighbors[intRand(n)]) ;
        }
    }
}
BinaryTree.count=0 ;

/*=========================================================================
 * SideWinder
 *=========================================================================
 */
var SideWinder = class{
    constructor(){
        this._id = SideWinder.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    on(grid){
        grid.reset() ;
        for(var j=0; j<grid.rows ; j++){
            var run = [] ;
            for (var i=0; i<grid.columns ; i++){
                var cell = grid.cell(i,j) ;
                run.push(cell) ;

                var at_northern_boundary = (cell.north == null) ;
                var at_eastern_boundary = (cell.east == null) ;
                var should_close_out =
                    ( at_eastern_boundary ||
                      (!at_northern_boundary && (intRand(2)==0)) ) ;

                if ( should_close_out ){
                    var member = run[intRand(run.length)] ;
                    member.link(member.north) ;
                    run = [] ;
                }else{
                    cell.link(cell.east) ;
                }
            }
        }
    }
}
SideWinder.count=0 ;

/*========================================================================
 * AldousBroder
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Creates a maze using a random walk and linking unvisited cells on the
 * path.
 *========================================================================
 */ 
var AldousBroder = class{
    constructor(){
        this._id = AldousBroder.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    on(grid){
        grid.reset() ;
        var cell = grid.sample() ;
        var unvisited = grid.size -1 ;
        while( unvisited > 0 ){
            var neighbor = cell.sampleNeighbors() ;
            if (neighbor.noLinks < 1){
                cell.link(neighbor) ;
                unvisited-- ;
            }
            cell = neighbor ;
        }
        return grid ;
    }
}
AldousBroder.count = 0 ;

/*========================================================================
 * Wilson
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Creates a maze by creating a loop erased path created by a random walk 
 * from a random unvisited cell to a previously visited cell. Any time in
 * the walk a loop is created, the path upto the loop is deleted and the 
 * walk resumes from that point onwards.
 *========================================================================
 */
var Wilson = class{
    constructor(){
        this._id = Wilson.count++ ;
        this._unvisited = [] ;
        this._visited = {} ;
    }

    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    get visited(){
        return this._visited ;
    }
    get unvisited(){
        return this._unvisited ;
    }
    set unvisited(u){
        this._unvisited = u ;
    }

    set visited(v){
        this._visited = v ;
    }

    sampleUnvisited(){
        return this.unvisited[intRand(this.unvisited.length)] ;
    }

    markVisited(cell){
        this.visited[cell.tag] = true ;
        var i  ;
        var found = false;
        for(i=0; i<this.unvisited.length;i++){
            if (this.unvisited[i].tag == cell.tag ){
                found = true ;
                break ;
            }
        }
        if(found){
            this._unvisited.splice(i,1) ;
        }
    }

/*------------------------------------------------------------------------
 * Apply the method on the grid
 *------------------------------------------------------------------------
 */
    on(grid){
        grid.reset() ;
        var visited = {} ;
        for(var i=0 ; i<grid.size ;i++){
            var cell = grid.cell(i) ;
            this.visited[cell.tag] = false ;
            this.unvisited.push(cell) ;
        }
        var first = this.sampleUnvisited() ;
        this.markVisited(first) ;
        while ( this.unvisited.length >0 ){
            var index = 0 ;
            var cell = this.sampleUnvisited() ;
            var path = [cell] ;
            while (!this.visited[cell.tag]){
                cell = cell.sampleNeighbors() ;
                var loop = false ;
                var i ;
                for(i=0 ; i < path.length;i++){
                    if (path[i].id == cell.id){
                        loop = true ;
                        break ;
                    }
                }
                if (!loop){ /* If there was no loop add the cell to the
                               path and continue */

                    path.push(cell) ;
                }else{ /*   if a loop was encountered we delete
                            the path upto the loop  */
                    path.splice(i+1, path.length - i - 1 ) ;
                    cell = path[i] ; 
                }
            }
            for (var j=0; j< (path.length-1); j++){
                this.markVisited(path[j]) ;
                this.markVisited(path[j+1]) ;
                path[j].link(path[j+1]) ;
            }
        }
    }

}
Wilson.count = 0 ;

/*========================================================================
 * RecursiveBacktracker 
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Start by choosing a cell at random and add it to the stack. Also mark it
 * visited. Connect it to one of its randomly selected unvisited neighbors. 
 * Make that cell the current cell, add it to the stack and mark it
 * visited. continue till the current cell has no uvisited neighbors.
 * At this point backtrack the stack until you find a cell with unvisited 
 * neighbors. Continue the process from that cell till the stack is empty.
 *========================================================================
 */ 
var RecursiveBacktracker = class{
    constructor(){
        this._id = RecursiveBacktracker.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }
    on(grid){
        grid.reset() ;
        var stack = [] ;
        var cell = grid.sample() ;
        var new_cell ;
        cell.visit() ;
        stack.push(cell) ;
        while(stack.length>0){
            while (cell.noUnvisitedNeighbors >0){
                new_cell = cell.sampleUnvisitedNeighbors() ;
                cell.link(new_cell) ;
                new_cell.visit() ;
                cell = new_cell ;
                stack.push(cell) ;
            }
            stack.pop() ;
            cell = stack[stack.length-1] ;
        }
    }
}
RecursiveBacktracker.count = 0;

/*========================================================================
 * HuntAndKill
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Kill: Choose a cell at random and link to one of its random unvisited 
 * neighbors and make that one the current cell until the cell has no
 * unvisited neighbors. Then, enter the hunt mode.
 *
 * Hunt: look for an unvisited cell which has at least one visited neighbor;
 * make it the current cell and connect the cell with one of its randomly
 * selected visited neighbors and continue into the kill mode.
 * Do the above steps until no unvisited cells are left.
 *========================================================================
 */ 
var HuntAndKill = class{
    constructor(){
        this._id = HuntAndKill.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    on(grid){
        grid.reset() ;
        var cell = grid.sample() ;
        cell.visit() ;
        var new_cell ;
        while (cell != null){
            if (cell.noUnvisitedNeighbors >0){
                new_cell = cell.sampleUnvisitedNeighbors() ;
                cell.link(new_cell) ;
                new_cell.visit() ;
                cell = new_cell ;
            }else{
                cell = null ;
                for(var i=0; i<grid.size; i++){
                    new_cell = grid.cell(i) ;
                    if( (!new_cell.visited) 
                            && (new_cell.noVisitedNeighbors>0)){
                        cell = new_cell.sampleVisitedNeighbors() ;
                        new_cell.link(cell) ;
                        new_cell.visit() ;
                        cell = new_cell ;
                        break ;
                    }
                }
            }
        }
    }

}
HuntAndKill.count = 0 ;
// outputs
this.Node = Node ;
this.Wall = Wall ;
this.Maze = Maze ;
this.Cell = Cell ;
this.Grid = Grid ;

this.DijkstraSolver = DijkstraSolver ;
this.Distances = Distances ;
this.BinaryTree = BinaryTree ;
this.SideWinder = SideWinder ;
this.AldousBroder = AldousBroder ;
this.Wilson = Wilson ;
this.RecursiveBacktracker = RecursiveBacktracker ;
this.HuntAndKill = HuntAndKill ;

this.generators = {
    list : [ 
        'BinaryTree', 
        'SideWinder', 
        'AldousBroder',
        'Wilson',
        'RecursiveBacktracker',
        'HuntAndKill' ] ,
    BinaryTree  : BinaryTree,
    SideWinder  : SideWinder,
    AldousBroder: AldousBroder,
    Wilson      : Wilson ,
    RecursiveBacktracker: RecursiveBacktracker ,
    HuntAndKill : HuntAndKill ,
} ;


} ; // End of Amazing
/*========================================================================
 * Returning AMazing if require.js is used to load the library
 *========================================================================
 */
/*========================================================================
 * Returning AMazing if require.js is used to load the library
 *========================================================================
 */
try{
    define(function(){
        console.log('Loading the library using require.js...') ;
        console.log(AMazing.line) ;
        var amazing = AMazing ;
        AMazing =undefined;
        return amazing ;
    } ) ;
}catch(e){
    console.log('Loaded the library without using require.js...') ;
    console.log(line) ;
}
