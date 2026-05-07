<?php

// Aktifkan laporan error secara paksa agar muncul di layar
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Jalankan index.php asli dari Laravel
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    // Jika ada error fatal, tampilkan pesannya
    echo "<h2>Laravel Deployment Error</h2>";
    echo "<p><b>Message:</b> " . $e->getMessage() . "</p>";
    echo "<p><b>File:</b> " . $e->getFile() . " (Line: " . $e->getLine() . ")</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
