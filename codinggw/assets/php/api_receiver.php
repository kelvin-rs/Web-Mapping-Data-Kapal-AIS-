<?php
// Izinkan akses dari IP mana saja di jaringan lokal
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Cek apakah ini request POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Tangkap data yang dikirim dari Raspberry Pi
    $mmsi   = isset($_POST['mmsi']) ? (int)$_POST['mmsi'] : 0;
    $lat    = isset($_POST['lat']) ? (float)$_POST['lat'] : 0;
    $lon    = isset($_POST['lon']) ? (float)$_POST['lon'] : 0;
    $speed  = isset($_POST['speed']) ? (float)$_POST['speed'] : 0;
    $course = isset($_POST['course']) ? (float)$_POST['course'] : 0;
    $waktu  = isset($_POST['waktu']) ? $_POST['waktu'] : date('Y-m-d H:i:s');
    $jarak  = isset($_POST['jarak']) ? (float)$_POST['jarak'] : 0;

    if ($mmsi > 0) {
        $conn = new mysqli("localhost", "root", "", "db_ais_data");

        if ($conn->connect_error) {
            die(json_encode(["status" => "error", "message" => "Database error"]));
        }

        // 1. UPDATE TABEL LIVE (Papan Skor Peta)
        $stmt_live = $conn->prepare("INSERT INTO ship_positions (mmsi, longitude, latitude, speed, course, waktu, jarak) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE longitude=VALUES(longitude), latitude=VALUES(latitude), speed=VALUES(speed), course=VALUES(course), waktu=VALUES(waktu)");
        $stmt_live->bind_param("iddddsd", $mmsi, $lon, $lat, $speed, $course, $waktu, $jarak);
        $stmt_live->execute();

        // 2. INSERT KE TABEL HISTORY (Rekam Jejak)
        $stmt_history = $conn->prepare("INSERT INTO ship_track_history (mmsi, longitude, latitude, speed, course, waktu) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt_history->bind_param("idddds", $mmsi, $lon, $lat, $speed, $course, $waktu);
        $stmt_history->execute();

        $stmt_live->close();
        $stmt_history->close();
        $conn->close();

        echo json_encode(["status" => "success", "message" => "Data kapal $mmsi berhasil disimpan"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Data MMSI tidak valid"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Hanya menerima metode POST"]);
}