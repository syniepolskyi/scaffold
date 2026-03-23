<?php

function main()
{
$idata = $_POST;
if(empty($idata))
{
  return json_encode(["info" => "_POST allowed params: " 
    . "scaffold_action (SAVE | READ | SCAN), " 
    . "scaffold_dir (string), " 
    . "scaffold_filename (string), " 
    . "scaffold_text (string); " 
    . "_FILES allowed params: scaffold_file; "
    . ""]);
}
$basedir = "/app";
$output = [];

if(!is_dir($basedir . $idata["scaffold_dir"]))
{
  if(!@mkdir($basedir . $idata["scaffold_dir"], 0755, true))
  {
    $output []= "Cannot create dir: " . $basedir . $idata["scaffold_dir"];
  }
  else
  {
    $output []= "Created dir: " . realpath($basedir . $idata["scaffold_dir"]);
  }
}

if($_FILES
    && isset($_FILES["scaffold_file"])
    && isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "SAVE")
    && isset($_FILES["scaffold_file"]["tmp_name"])
    && !empty($idata["scaffold_filename"]))
{
  $target = $basedir . $idata["scaffold_dir"] . "/" . $idata["scaffold_filename"];
  $resMove = @move_uploaded_file($_FILES["scaffold_file"]["tmp_name"], $target);
  if($resMove)
  {
    $output []= "Uploaded file: " . realpath($target);
  }
  else
  {
    $output []= "Error of uploading file: " . str_replace("///", "/", $target);
  }
}

if(!empty($idata["scaffold_text"])
    && !empty($idata["scaffold_filename"])
    && isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "SAVE")
    && !isset($_FILES["scaffold_file"]))
{
  $target = str_replace("///", "/", 
    $basedir . $idata["scaffold_dir"] . "/" . $idata["scaffold_filename"]);
  $resPut = @file_put_contents($target, $idata["scaffold_text"]);
  if($resPut !== false)
  {
    $output []= "Write file: " . realpath($target) . " (bytes: " . $resPut . " )";
  }
  else
  {
    $output []= "Error of writing file: " . $target;
  }
}

if(!empty($idata["scaffold_dir"])
    && !empty($idata["scaffold_filename"])
    && isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "READ")
)
{
  $target = $basedir . $idata["scaffold_dir"] . "/" . $idata["scaffold_filename"];
  if(!is_file($target))
  {
    return "";
  }
  else
  {
    $size = filesize($target);
    if($size > 10000000)
    {
      return "File is too large to view as text, file size in bytes is " . $size;
    }
    return file_get_contents($target);
  }
}
else if(isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "READ")
)
{
  return "";
}

if(!empty($idata["scaffold_dir"])
    && isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "SCAN")
)
{
  $target = str_replace("///", "/", $basedir 
    . $idata["scaffold_dir"]);
  if(!is_dir($target))
  {
    return json_encode(["error" => $target . " is not directory"]);
  }
  else if(strpos(realpath($target) . "/", $basedir) === false)
  {
    return json_encode(["error" => realpath($target) . " - access denied"]);
  }
  else
  {
    $items = @scandir($target);
    $dirs = []; $files = [];
    $scanParams = [];
    $toHide = [];
    if(is_file($target . "/.scan.json"))
    {
      $scanJSON = file_get_contents($target . "/.scan.json");
      $scanParams = json_decode($scanJSON, true);
      if(isset($scanParams["hidden"]) && is_array($scanParams["hidden"]))
      {
        $toHide = $scanParams["hidden"];
      }
      if(isset($scanParams["remove"]) && is_array($scanParams["remove"]))
      {
        if(!isset($scanParams["removed"]))
        {
          $scanParams["removed"] = [];
        }
        foreach($scanParams["remove"] as $rk => $ritem)
        {
          if(strpos(realpath($target . "/" . $ritem) . "/", $basedir) === false)
          {
            continue;
          }
          if(strpos(realpath($target . "/" . $ritem) . "/", "scaffold.") !== false)
          {
            continue;
          }
          if(is_dir(realpath($target . "/" . $ritem)))
          {
            $curDir = realpath($target . "/" . $ritem);
            $filesI = new RecursiveIteratorIterator(
              new RecursiveDirectoryIterator(
                $curDir,
                RecursiveDirectoryIterator::SKIP_DOTS
              ),
              RecursiveIteratorIterator::CHILD_FIRST
            );
            $allRmResult = true;
            foreach ($filesI as $fileinfo)
            {
              if($fileinfo->isDir())
              {
                $curResult = @rmdir($fileinfo->getRealPath());
              }
              else
              {
                $curResult = @unlink($fileinfo->getRealPath());
              }
              if(!$curResult)
              {
                $allRmResult = false;
              }
            }
            if($allRmResult)
            {
              $allRmResult = @rmdir($curDir);
            }
            if($allRmResult)
            {
              $scanParams["removed"][$ritem] = date("Y-m-d H:i:s");
              unset($scanParams["remove"][$rk]);
            }
          }
          if(is_file(realpath($target . "/" . $ritem)))
          {
            if(@unlink(realpath($target . "/" . $ritem)))
            {
              $scanParams["removed"][$ritem] = date("Y-m-d H:i:s");
              unset($scanParams["remove"][$rk]);
            }
          }
        }
        $scanParams["remove"] = array_values($scanParams["remove"]);
        file_put_contents($target . "/.scan.json", 
          json_encode($scanParams, JSON_PRETTY_PRINT)
        );
      }
    }
    foreach($items as $item)
    {
      $isDir = is_dir($target . "/" . $item);
      if(!empty($toHide) && in_array($item . (($isDir) ? "/" : ""), $toHide))
      {
        continue;
      }
      if($isDir || $item === "..")
      {
        $dirs []= $item . "/";
      }
      else
      {
        $files []= $item;
      }
    }
    sort($dirs); sort($files);
    return json_encode([...$dirs, ...$files]);
  }
}
else if(isset($idata["scaffold_action"])
    && ($idata["scaffold_action"] === "SCAN")
)
{
    return json_encode(["error" => "POST param scaffold_dir expected"]);
}

return json_encode($output);
}

echo main();
