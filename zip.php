<?php

function zipFolder($sourceFolder, $downloadPath)
{
  $zip = new ZipArchive();
  if($zip->open($downloadPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE)
  {
    return "Не вдалося відкрити/створити файл $downloadPath";
  }
  $files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(
      $sourceFolder,
      RecursiveDirectoryIterator::SKIP_DOTS
    ),
    RecursiveIteratorIterator::LEAVES_ONLY
  );
  foreach($files as $name => $file)
  {
    $filePath = $file->getRealPath();
    $relativePath = substr($filePath, strlen(realpath($sourceFolder)) + 1);
    $zip->addFile($filePath, $relativePath);
  }
  $zip->close();
  return "Архів створено успішно: $downloadPath";
}

$basedir = "/home/vol13_3/infinityfree.com/if0_41206967/htdocs/";
$folderToZip = $basedir . "";
$outputZip = $basedir . "www.zip";

echo zipFolder($folderToZip, $outputZip);
