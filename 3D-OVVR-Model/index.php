<!DOCTYPE html>
<html>
<head>
    <title>3D OVVR</title>
<?php
    echo file_get_contents( __dir__ . "/../general_libs.html" ) ;
?>

<style><?php
  echo file_get_contents( __dir__ . "/../abubu_app.css" ) ;
?></style>
</head>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- All shaders included here (codes written in GLSL)                 -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->

<?php
    include "../shader.php" ;

    $dir = __dir__ . "/shaders/"  ;
   

    shader( 'directionator'       , $dir ) ;
    shader( 'init1'               , $dir ) ;
    shader( 'init2'               , $dir ) ;
    shader( 'comp1'               , $dir ) ;
    shader( 'comp2'               , $dir ) ;
    shader( 'click'               , $dir ) ;
?>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- body of the html page                                             -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<body>
    <h1>The 3D OVVR Model</h1>
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
    
    <div class='relative' id='editorSection' style='display:none'>
        <h2>Source code editor</h2>
        <div class='editor' id='editor'></div>
    </div>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- main script - JavaScript code                                     -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<script>
<?php
    echo file_get_contents( __dir__ . "/app.js" ) ;    
?></script>

</body>
</html>
