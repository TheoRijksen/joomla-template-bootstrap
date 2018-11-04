<?php defined('_JEXEC') or die('Restricted access');?>
<?php 

if(in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
    include('src/template.php');
} else {
    include('build/template.php');
} ?>