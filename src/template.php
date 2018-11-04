<?php defined('_JEXEC') or die('Restricted access');?>
<!DOCTYPE html>
<html xml:lang="<?php echo $this->language; ?>" lang="<?php echo $this->language; ?>">

<head>
    <jdoc:include type="head" />
    <link rel="stylesheet" href="<?php echo $this->baseurl ?>/templates/<?php echo $this->template ?>/build/css/style.css?ver=###VERSIONNUMBER###"
        type="text/css" />
</head>

<body>
    <jdoc:include type="modules" name="top" />
    <jdoc:include type="component" />
    <jdoc:include type="modules" name="footer" />
    <script src="<?php echo $this->baseurl ?>/templates/<?php echo $this->template ?>/build/js/scripts.js?ver=###VERSIONNUMBER###"></script>
</body>

</html>