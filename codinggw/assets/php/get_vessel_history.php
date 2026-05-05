<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "db_ais_data");
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

// Ambil MMSI dari URL (contoh: ?mmsi=525001234)
$mmsi = isset($_GET['mmsi']) ? (int)$_GET['mmsi'] : 0;

if ($mmsi === 0) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT latitude AS lat, longitude AS lon, speed, course, waktu FROM ship_track_history WHERE mmsi = $mmsi ORDER BY waktu ASC LIMIT 200";
$result = $conn->query($sql);

$history = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $history[] = [
            "lat" => (float)$row['lat'],
            "lon" => (float)$row['lon'],
            "speed" => (float)$row['speed'],
            "course" => (float)$row['course'],
            "waktu" => $row['waktu']
        ];
    }
}

echo json_encode($history);
$conn->close();