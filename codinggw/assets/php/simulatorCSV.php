<?php
set_time_limit(0);
ob_implicit_flush(true);
ob_end_flush();
date_default_timezone_set('Asia/Jakarta');

$conn = new mysqli("localhost", "root", "", "db_ais_data");
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

$file_path = '../resource/data_dummy/data_kapal.csv'; 
if (!file_exists($file_path)) {
    die("Error: File $file_path tidak ditemukan.");
}

$handle = fopen($file_path, "r");
fgets($handle); // Lewati baris pertama (Header Excel)

echo "<body style='background:#0f172a; color:#38bdf8; font-family:monospace; padding:20px;'>";
echo "<h2>🚀 Memulai Simulasi Radar AIS...</h2><hr>";

// QUERY BARU: Menghapus kolom 'mid' dari insert dan update
$stmt = $conn->prepare("INSERT INTO ship_positions (mmsi, longitude, latitude, speed, course, waktu, jarak) 
                        VALUES (?, ?, ?, ?, ?, ?, ?) 
                        ON DUPLICATE KEY UPDATE 
                        longitude=VALUES(longitude), latitude=VALUES(latitude), speed=VALUES(speed), course=VALUES(course), waktu=VALUES(waktu), jarak=VALUES(jarak)");

if (!$stmt) {
    die("<span style='color:red;'>Error Prepare SQL: " . $conn->error . "</span>");
}

$batch_size = 15; 
$count = 0;

while (($line = fgets($handle)) !== false) {
    $line = trim($line);
    if (empty($line)) continue; // Lewati baris kosong

    // PARSER ANTI-GAGAL: Pisahkan berdasarkan Koma, Titik Koma, Tab, atau Spasi Berlebih
    $data = preg_split('/[,;\t]+|\s{2,}/', $line);

    // Pastikan baris memiliki data yang cukup
    if (count($data) < 7) { 
        continue; 
    }

    // Urutan berdasarkan file Excel Anda: 
    // ID(0), MID(1), MMSI(2), Longitude(3), Latitude(4), Speed(5), Course(6), Waktu(7), f_str(8), Jarak(9)
    $mmsi = (int)$data[2];
    $lon = (float)$data[3];
    $lat = (float)$data[4];
    $speed = (float)$data[5];
    $course = (float)$data[6];
    $jarak = isset($data[9]) ? (float)$data[9] : 0;
    
    // Waktu kita override dengan waktu Server saat ini agar terlihat Real-Time
    $waktu = date('Y-m-d H:i:s'); 

    if ($mmsi > 0) {
        // i=integer, d=double(float), s=string
        $stmt->bind_param("iddddss", $mmsi, $lon, $lat, $speed, $course, $waktu, $jarak);
        
        if ($stmt->execute()) {
            echo "✅ Transmitting MMSI: <b>$mmsi</b> | Pos: [$lat, $lon] | Spd: $speed kn<br>";
            $count++;
        } else {
            echo "❌ <span style='color:red;'>Gagal MMSI $mmsi: " . $stmt->error . "</span><br>";
        }

        // Tunda 3 detik setiap 15 kapal agar Peta Anda ter-update secara berkala (animasi jalan perlahan)
        if ($count > 0 && $count % $batch_size == 0) {
            echo "<hr><span style='color:#f43f5e;'>⏳ Menunggu 3 detik untuk transmisi berikutnya...</span><hr>";
            flush(); 
            sleep(3); 
        }
    }
}

fclose($handle);
$stmt->close();
$conn->close();

echo "<br><h3>✅ Simulasi Selesai! Semua data Excel berhasil masuk.</h3></body>";
?>