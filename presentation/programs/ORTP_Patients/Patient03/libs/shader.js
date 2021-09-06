/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * Extension of the 'text' plugin specially for loading shaders 
 * FEATURES     :
 *      -   Supports #include statements to combine shaders
 *      -   Can use the define function to change the value of 
 *          #define statments in the shader
 *      -   Expects shaders to be in `./shaders/` or `./` 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 14 Aug 2019 17:06:00 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
define( {
load: function ( name, req, onload, config ) {
    if ( config.isBuild ) {
      onload();
      return;
    }

    var attempt = 0 ;
    // Shader class ------------------------------------------------------
    class Shader{
        constructor(value){
            this.value = value ;
        }
        // taking care of # defines
        define(def,value){
            var regexp = new RegExp("#define " + def + " .*", "g");
            var newDefine = 
                    "#define " 
                +   def 
                +   ( value ? " " + value : "" ) ;
            if ( this.value.match( regexp ) ) {
              // #define already exists, update its value
              this.value = this.value.replace( regexp, newDefine );
            } else {
              // New #define, prepend to start of file
              this.value = newDefine + "\n" + this.value;
            }
        }
    } // End of shader class ---------------------------------------------
  
    function loadContents(shaderContents){
        var shader = new Shader( shaderContents );
        var matches = [];
        shaderContents.replace( /#include (.*)/g, function ( match, includeFile ) {
          matches.push( includeFile );
        } );

        if ( matches.length === 0 ) {
            // No includes, just return straight away
            onload( shader );
        } else {
            // Load included shaders and replace them in the code
            var loaded = 0;
            for ( var m = 0; m < matches.length; m++ ) {
                (function ( includeFile ) {
                  req(["shader!" + includeFile], 
                        function ( includeShader ) {
                            var regexp = new RegExp("#include " + includeFile, "g");
                            shader.value = shader.value.replace( regexp, includeShader.value );
                            loaded++;

                            if ( loaded === matches.length ) {
                              // All shaders have been loaded, return result
                              onload( shader );
                            }
                    });
                    }
                )( matches[m] );
            }
        }
    }

    req( ["text!" + require.toUrl('./shaders/'+name)], 
        (contents)=>loadContents(contents),
        function(err){
            attempt++ ;
            if (attempt>1){
                
                onload(null);
                throw err ;
                return ;
            }
            console.log('Now attempting current dir') ;
            req(["text!" + require.toUrl('./'+name)], 
                    (contents)=> loadContents(contents) ) ;
    } ) ;
  }
}) ;
