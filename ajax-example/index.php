<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
    <head>
        <meta http-equiv = "Content-Type" content = "text/html; charset=iso-8859-1" />
        <title>AJAX example</title>
        <link href = "common/css/main.css" rel = "stylesheet" type = "text/css" />

        <script type = "text/javascript" src = "common/js/jquery/jquery-1.7.1.min.js"></script>
        <script type = "text/javascript" src = "common/js/navigation_bar.js"></script>
        <script type = "text/javascript" src = "js/index.js"></script>
        <script type = "text/javascript">
            $( document ).ready(
                function() {
                    initialize()
                }
            );
        </script>
    </head>
    <body>
        <?php include_once( 'common/php/navigation_bar.php' ); ?>

        <br />
        <br />

        <div id = "page_body">
            <table class = "data-table">
                <thead id = "thead_header">
                </thead>
                <tbody id = "tbody_body">
                </tbody>
            </table>
        </div>
    </body>
</html>
