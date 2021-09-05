<!DOCTYPE html>
<html>
<head>
    <title>3V-MM</title>
<?php
    echo file_get_contents( __dir__ . "/../general_libs.html" ) ;
?>

<style><?php
  echo file_get_contents( __dir__ . "/../abubu_app.css" ) ;
?></style>
</head>
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- body of the html page                                             -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<body onload='loadWebGL();'>
    <h1>2D 3-Variable Minimal Model</h1>
    

    <table>
        <tr>
            <td>
                <canvas id=canvas_1 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
            <td>
                <canvas id=canvas_2 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
        </tr>
    </table>
    

    <table style='width:100%' id=editors>
        <tr id='compEditors' style='display:none'>
            <td id='ecomp'> 
                <h2>comp editor</h2>
                <div class=relative id=compEditorContainer>
                    <div class=editor id='compEditor'></div>
                </div>
            </td>
        </tr>

        <tr  id='initEditors' style='display:none'>
            <td id='einit'> 
                <h2>init editor</h2>
                <div class=relative id=initEditorContainer>
                    <div class=editor id='initEditor'></div>
                </div>
            </td>
         </tr>
    </table>
    
    <img src='CinCinv.png' id='structure' style='display:none'>
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- All shaders included here (codes written in GLSL)                 -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<?php
    include "../shader.php" ;

    $dir = __dir__ . "/shaders/" ;
   
    shader( 'initDomain'        , $dir    ) ;
    shader( 'zeroFluxDirections', $dir    ) ;
    shader( 'initSolution'      , $dir    ) ;
    shader( 'computeTimeStep'   , $dir    ) ;
    shader( 'click'             , $dir    ) ;
?>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- main script - JavaScript code                                     -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<script>
<?php
    echo file_get_contents( __dir__ . "/app.js" ) ;    
?></script>


</body>
</html>

