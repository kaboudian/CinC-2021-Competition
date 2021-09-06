/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * AkMazing.js  :   A library to create mazes
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 14 Aug 2019 21:07:41 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
var AkMazing = {
    version : '2.1.0' ,
    date    : 'Wed 14 Aug 2019 21:07:33 (EDT)'
} ;

var line =''; for(var i=0;i<35;i++) line+='-' ;
console.log(line) ;
console.log('AkMazing version '+ AkMazing.version) ;
console.log('Updated on '+ AkMazing.date   ) ;
console.log('Developed by Abouzar Kaboudian') ;

/*========================================================================
 * readOptions
 *========================================================================
 */ 
AkMazing.readOption = function(opt,val){
    if(opt != undefined ) return opt ;
    else return val ;
}

/*========================================================================
 * isNotEmpty
 *========================================================================
 */ 
AkMazing.isNotEmpty = function(obj) {
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
AkMazing.intRand = function(j){
    return Math.floor(j*Math.random()) ;
}


/*========================================================================
 * Cell 
 *========================================================================
 */ 
AkMazing.Cell = class{
/*------------------------------------------------------------------------
 * Private variables
 *------------------------------------------------------------------------
 */
    /* 
    #column ; #row ;
    #links ; #id ;
    #north ; #south; #east; #west ; */
    constructor(opt={}){
        this._column= AkMazing.readOption(opt.column, 0) ;
        this._row   = AkMazing.readOption(opt.row, 0) ;
        this._linkIds = [] ;
        this._links = {} ;
        this._id    = AkMazing.Cell.count++ ;
        this._north = null ;
        this._south = null ;
        this._east  = null ;
        this._west  = null ;
        this._neighbors = null ;
        this._visited = false ;
    }
/*------------------------------------------------------------------------
 * Getters and Setters
 *------------------------------------------------------------------------
 */
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
        return this._links[id.toString] ;
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
        return un[AkMazing.intRand(un.length)] ;
    }

/*------------------------------------------------------------------------
 * sampleVisitedNeighbors
 *------------------------------------------------------------------------
 */
    sampleVisitedNeighbors(){
        var vn = this.visitedNeighbors ;
        return vn[AkMazing.intRand(vn.length) ];
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
}

AkMazing.Cell.count = 0 ; // initialize the number of cells


/*========================================================================
 * Grid Class
 *========================================================================
 */ 
AkMazing.Grid = class{
    /*
    #columns ; 
    #rows ;
    #cells ;
    #canvas ;
    #id ;
    #width; 
    #height ; */
    constructor(r, c,opts={}){
        this._id = AkMazing.Grid.count++ ;
        this._columns      = r ;
        this._rows   = c ;
        this._cells = [] ;
        this.canvas = AkMazing.readOption(opts.canvas , null) ;
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
        return this._id.toString() ;
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
        for(var i=0; i<this.columns ; i++){
            for(var j=0; j<this.rows;j++){
                this._cells.push(new AkMazing.Cell({column:i, row:j})) ;
            }
        }
    }

/*------------------------------------------------------------------------
 * configCells  :   determine the north, east, west, south 
 *                  neighbours of the cells
 *------------------------------------------------------------------------
 */
    configCells(){
        for(var i=0; i<this.columns; i++){
            for (var j=0; j<this.rows; j++){
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
            var index = i*this.rows + j ;
            return this._cells[index] ;
        }else{
            return null ;
        }
    } 

/*------------------------------------------------------------------------
 * unlinkAll
 *------------------------------------------------------------------------
 */
    unlinkAll(){
        for(var i=0; i<this.size; i++){
            this.cell(i).unlinkAll() ;
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

AkMazing.Grid.count = 0 ;

/*=========================================================================
 * Distances class 
 *=========================================================================
 */
AkMazing.Distances = class {
    constructor(r){
        this._id    = AkMazing.Distances.count++ ;
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
        return this._dist ;
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

AkMazing.Distances.count =0 ;

/*========================================================================
 * Dijkstra
 *========================================================================
 */ 
AkMazing.DijkstraSolver = class {
    constructor(begin,end){
        this._id = AkMazing.DijkstraSolver.count++ ;
        this._begin = AkMazing.readOption(begin, null) ;
        this._end   = AkMazing.readOption(end,   null) ;

        this._distances = new AkMazing.Distances( this.begin ) ;
        this._pathMembers = {} ;
        this.solved = false ;
        this.solve() ;
    }

    get id(){
        return this._id ;
    }

    get tag(){
        return this.id.toString() ;
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
AkMazing.DijkstraSolver.count = 0 ;

/*========================================================================
 * BinaryTree
 *========================================================================
 */ 
AkMazing.BinaryTree = class{
    // _id ;
    constructor(){
        this._id = AkMazing.BinaryTree.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this._id.toString() ;
    }

    on(grid){
        grid.unlinkAll() ;
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
            cell.link(neighbors[AkMazing.intRand(n)]) ;
        }
    }
}
AkMazing.BinaryTree.count=0 ;

/*=========================================================================
 * SideWinder
 *=========================================================================
 */
AkMazing.SideWinder = class{
    constructor(){
        this._id = AkMazing.SideWinder.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this.id.toString() ;
    }

    on(grid){
        grid.unlinkAll() ;
        for(var j=0; j<grid.rows ; j++){
            var run = [] ;
            for (var i=0; i<grid.columns ; i++){
                var cell = grid.cell(i,j) ;
                run.push(cell) ;

                var at_northern_boundary = (cell.north == null) ;
                var at_eastern_boundary = (cell.east == null) ;
                var should_close_out =
                    ( at_eastern_boundary ||
                      (!at_northern_boundary && (AkMazing.intRand(2)==0)) ) ;

                if ( should_close_out ){
                    var member = run[AkMazing.intRand(run.length)] ;
                    member.link(member.north) ;
                    run = [] ;
                }else{
                    cell.link(cell.east) ;
                }
            }
        }
    }
}
AkMazing.SideWinder.count=0 ;

/*========================================================================
 * AldousBroder
 *------------------------------------------------------------------------
 *
 * Creates a maze using a random walk and linking unvisited cells on the
 * path.
 *========================================================================
 */ 
AkMazing.AldousBroder = class{
    constructor(){
        this._id = AkMazing.AldousBroder.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this.id.toString() ;
    }

    on(grid){
        grid.unlinkAll() ;
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
AkMazing.AldousBroder.count = 0 ;

/*========================================================================
 * Wilson
 *------------------------------------------------------------------------
 *
 * Creates a maze by creating a loop erased path created by a random walk 
 * from a random unvisited cell to a previously visited cell. Any time in
 * the walk a loop is created, the path upto the loop is deleted and the 
 * walk resumes from that point onwards.
 *========================================================================
 */
AkMazing.Wilson = class{
    constructor(){
        this._id = AkMazing.Wilson.count++ ;
        this._unvisited = [] ;
        this._visited = {} ;
    }

    get id(){
        return this._id ;
    }
    get tag(){
        return this.id.toString() ;
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
        return this.unvisited[AkMazing.intRand(this.unvisited.length)] ;
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

    on(grid){
        grid.unlinkAll() ;
        var visited = {} ;
        for(var i=0 ; i<grid.size ;i++){
            var cell = grid.cell(i) ;
            this.visited[cell.tag] = false ;
            this.unvisited.push(cell) ;
        }
        var first= grid.cell(0,0) ; //= this.sampleUnvisited() ;
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
AkMazing.Wilson.count = 0 ;

/*========================================================================
 * RecursiveBacktracker 
 *------------------------------------------------------------------------
 *
 * Start by choosing a cell at random and add it to the stack. Also mark it
 * visited. Connect it to one of its randomly selected unvisited neighbors. 
 * Make that cell the current cell, add it to the stack and mark it
 * visited. continue till the current cell has no uvisited neighbors.
 * At this point backtrack the stack until you find a cell with unvisited 
 * neighbors. Continue the process from that cell till the stack is empty.
 *========================================================================
 */ 
AkMazing.RecursiveBacktracker = class{
    constructor(){
        this._id = AkMazing.RecursiveBacktracker.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this.id.toString() ;
    }
    on(grid){
        grid.unlinkAll() ;
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
AkMazing.RecursiveBacktracker.count = 0;

/*========================================================================
 * HuntAndKill
 * -----------------------------------------------------------------------
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
AkMazing.HuntAndKill = class{
    constructor(){
        this._id = AkMazing.HuntAndKill.count++ ;
    }
    get id(){
        return this._id ;
    }
    get tag(){
        return this.id.toString() ;
    }

    on(grid){
        grid.unlinkAll() ;
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
AkMazing.HuntAndKill.count = 0 ;

/*========================================================================
 * Returning AkMazing if require.js is used to load the library
 *========================================================================
 */
try{
    define(function(){
        console.log('Loading the library using require.js...') ;
        console.log(line) ;
        return AkMazing ;
    } ) ;
}catch(e){
    console.log('Loaded the library without using require.js...') ;
    console.log(line) ;
}

