<?php
set_time_limit(0);
ob_implicit_flush(true);
ob_end_flush();
date_default_timezone_set('Asia/Jakarta');

$conn = new mysqli("localhost", "root", "", "db_ais_data");
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

echo "<body style='background:#0b1120; color:#10b981; font-family:monospace; padding:20px;'>";
echo "<h2>🧭 Memulai ULTRA-REALISTIC MARITIME SIMULATOR (PERFECTED ROUTES)...</h2><hr>";

$stmt_live = $conn->prepare("INSERT INTO ship_positions (mmsi, longitude, latitude, speed, course, waktu, jarak) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE longitude=VALUES(longitude), latitude=VALUES(latitude), speed=VALUES(speed), course=VALUES(course), waktu=VALUES(waktu)");
$stmt_history = $conn->prepare("INSERT INTO ship_track_history (mmsi, longitude, latitude, speed, course, waktu) VALUES (?, ?, ?, ?, ?, ?)");

// ==========================================
// 1. KARTOGRAFI: TITIK PRESISI TINGGI
// ==========================================
$nodes = [
    // --- PELABUHAN TUJUAN ---
    // Digeser ke bawah & barat agar pas di kolam pelabuhan dalam
    0 => ["name" => "Tg. Perak, Surabaya", "lat" => -7.210, "lon" => 112.720, "is_port" => true],

    1 => ["name" => "Tg. Priok, Jakarta",  "lat" => -6.100, "lon" => 106.880, "is_port" => true],
    2 => ["name" => "Belawan, Medan",      "lat" => 3.800,  "lon" => 98.700,  "is_port" => true],
    3 => ["name" => "Makassar Port",       "lat" => -5.130, "lon" => 119.410, "is_port" => true],
    4 => ["name" => "Balikpapan Port",     "lat" => -1.280, "lon" => 116.810, "is_port" => true],
    5 => ["name" => "Benoa, Bali",         "lat" => -8.750, "lon" => 115.220, "is_port" => true],
    6 => ["name" => "Tg. Emas, Semarang",  "lat" => -5.950, "lon" => 110.420, "is_port" => true],
    7 => ["name" => "Pontianak Port",      "lat" => -0.020, "lon" => 109.330, "is_port" => true],
    8 => ["name" => "Bitung Port",         "lat" => 1.440,  "lon" => 125.190, "is_port" => true],
    9 => ["name" => "Ambon Port",          "lat" => -3.690, "lon" => 128.180, "is_port" => true],

    // --- ALUR PELAYARAN BARAT SURABAYA (APBS) SANGAT PRESISI ---
    // Digeser menempel pesisir Teluk Lamong & Gresik (Ke Bawah & Ke Barat mutlak)
    10 => ["name" => "APBS 1 (Teluk Lamong)", "lat" => -7.195, "lon" => 112.670, "is_port" => false],
    11 => ["name" => "APBS 2 (Gresik Coast)", "lat" => -7.140, "lon" => 112.640, "is_port" => false],
    12 => ["name" => "APBS 3 (Kr. Jamuang)",  "lat" => -6.920, "lon" => 112.600, "is_port" => false],
    13 => ["name" => "Laut Jawa (Utama)",     "lat" => -6.650, "lon" => 112.650, "is_port" => false],

    // --- JALUR BARAT (JAWA & SUMATERA) ---
    14 => ["name" => "Utara Tuban",         "lat" => -6.400, "lon" => 111.800, "is_port" => false],
    15 => ["name" => "Utara Jepara",        "lat" => -6.300, "lon" => 110.800, "is_port" => false],
    16 => ["name" => "Masuk Semarang",      "lat" => -5.800, "lon" => 110.420, "is_port" => false],
    17 => ["name" => "Utara Cirebon",       "lat" => -5.700, "lon" => 108.600, "is_port" => false],
    18 => ["name" => "Masuk Priok",         "lat" => -5.900, "lon" => 106.880, "is_port" => false],
    19 => ["name" => "Selat Bangka S",      "lat" => -3.200, "lon" => 106.500, "is_port" => false],
    20 => ["name" => "Selat Malaka T",      "lat" => 3.000,  "lon" => 100.500, "is_port" => false],

    // --- JALUR TIMUR (MADURA, BALI, SULAWESI, MALUKU) ---
    21 => ["name" => "Barat Laut Madura",   "lat" => -6.600, "lon" => 113.000, "is_port" => false],
    22 => ["name" => "Utara Madura Tengah", "lat" => -6.600, "lon" => 113.500, "is_port" => false],
    23 => ["name" => "Timur Laut Madura",   "lat" => -6.800, "lon" => 114.100, "is_port" => false],
    24 => ["name" => "Selat Sapudi",        "lat" => -7.100, "lon" => 114.300, "is_port" => false],
    25 => ["name" => "Selat Lombok U",      "lat" => -8.300, "lon" => 115.600, "is_port" => false],
    26 => ["name" => "Selat Lombok S",      "lat" => -8.800, "lon" => 115.600, "is_port" => false],
    27 => ["name" => "Selat Makassar",      "lat" => -5.500, "lon" => 118.000, "is_port" => false],
    28 => ["name" => "Laut Banda",          "lat" => -4.000, "lon" => 124.000, "is_port" => false],

    // --- JALUR KALIMANTAN ---
    29 => ["name" => "Laut Jawa Tgh",       "lat" => -3.500, "lon" => 112.700, "is_port" => false],
    30 => ["name" => "Selat Karimata",      "lat" => -1.000, "lon" => 108.500, "is_port" => false]
];

// ==========================================
// 2. JARINGAN RUTE LAUT (EDGES)
// ==========================================
$links = [
    // Pintu Keluar Surabaya Mutlak (Meliuk ke barat lewat APBS yang sudah digeser)
    [0, 10],
    [10, 11],
    [11, 12],
    [12, 13],

    // Laut Jawa Utama ke Barat
    [13, 14],
    [14, 15],
    [15, 16],
    [16, 6],
    [16, 17],
    [17, 18],
    [18, 1],
    [18, 19],
    [19, 20],
    [20, 2],

    // Laut Jawa Utama ke Utara
    [13, 29],
    [29, 4],
    [17, 30],
    [30, 7],

    // Laut Jawa Utama ke Timur
    [13, 21],
    [21, 22],
    [22, 23],
    [23, 24],
    [24, 25],
    [25, 26],
    [26, 5],
    [24, 27],
    [27, 3],
    [27, 8],
    [27, 28],
    [28, 9]
];

function findPath($start, $end, $links)
{
    $adj = [];
    foreach ($links as $link) {
        $adj[$link[0]][] = $link[1];
        $adj[$link[1]][] = $link[0];
    }
    $queue = new SplQueue();
    $queue->enqueue([$start]);
    $visited = [$start => true];
    while (!$queue->isEmpty()) {
        $path = $queue->dequeue();
        $node = $path[count($path) - 1];
        if ($node === $end) return $path;
        if (isset($adj[$node])) {
            foreach ($adj[$node] as $neighbor) {
                if (!isset($visited[$neighbor])) {
                    $visited[$neighbor] = true;
                    $newPath = $path;
                    $newPath[] = $neighbor;
                    $queue->enqueue($newPath);
                }
            }
        }
    }
    return [$start];
}

function getDistance($lat1, $lon1, $lat2, $lon2)
{
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
    return 6371 * (2 * asin(sqrt($a)));
}

function getBearing($lat1, $lon1, $lat2, $lon2)
{
    $dLon = deg2rad($lon2 - $lon1);
    $y = sin($dLon) * cos(deg2rad($lat2));
    $x = cos(deg2rad($lat1)) * sin(deg2rad($lat2)) - sin(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos($dLon);
    return (rad2deg(atan2($y, $x)) + 360) % 360;
}

// ==========================================
// 3. ARMADA: 10 KAPAL INDONESIA BERBEDA
// ==========================================
$ships = [];
$total_ships = 10;
$mids = [235, 211, 226, 366, 338, 353, 412, 431, 440, 525, 503, 512];
$destinations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];

for ($i = 0; $i < $total_ships; $i++) {
    $start_port = 0; // SEMUA MUTLAK DARI SURABAYA
    $end_port = $destinations[$i];

    $path = findPath($start_port, $end_port, $links);
    $random_speed = mt_rand(120, 220) / 10; // Kecepatan organik (12.0 - 22.0 knot)

    $ships[] = [
        'mmsi'          => ($mids[array_rand($mids)] * 1000000) + mt_rand(100000, 999999),
        'max_speed'     => $random_speed,
        'speed'         => $random_speed,
        'path'          => $path,
        'target_idx'    => 1,

        // PENTING: Koordinat Awal persis di titik pelabuhan (Tanpa scatter acak!)
        'lat'           => $nodes[$start_port]['lat'],
        'lon'           => $nodes[$start_port]['lon'],

        'origin'        => $start_port,
        'dest'          => $end_port,
        'docked_cycles' => 0
    ];
}

echo "Berhasil memuat 10 Kapal Unik di Pelabuhan Tanjung Perak...<br><hr>";

// ==========================================
// 4. MESIN NAVIGASI & LOOPING SEUMUR HIDUP
// ==========================================
$cycle = 1;
while (true) {
    $waktu = date('Y-m-d H:i:s');

    if ($cycle % 12 == 0) {
        $conn->query("DELETE FROM ship_track_history WHERE waktu < DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    }

    $docked_count = 0;
    $sailing_count = 0;

    foreach ($ships as &$ship) {
        
        // --- LOGIKA BERLABUH ---
        if ($ship['docked_cycles'] > 0) {
            $ship['speed'] = 0; 
            $ship['docked_cycles']--;
            $docked_count++;

            // Jika sandar selesai, tentukan rute baru!
            if ($ship['docked_cycles'] == 0) {
                $ship['origin'] = $ship['dest'];
                
                // SIKLUS TANPA BATAS (LOOPING ABADI)
                if ($ship['origin'] == 0) {
                    $ship['dest'] = mt_rand(1, 9);
                } else {
                    $ship['dest'] = 0;
                }

                $ship['path'] = findPath($ship['origin'], $ship['dest'], $links);
                $ship['target_idx'] = 1;
                $ship['speed'] = $ship['max_speed']; 
            }
            goto eksekusi_database; 
        } 
        
        // --- LOGIKA BERLAYAR ---
        $sailing_count++;
        $target_node = $nodes[$ship['path'][$ship['target_idx']]];
        $dist_to_target = getDistance($ship['lat'], $ship['lon'], $target_node['lat'], $target_node['lon']);

        if ($dist_to_target < 8) {
            $ship['target_idx']++; 
            
            if ($ship['target_idx'] >= count($ship['path'])) {
                $ship['target_idx'] = count($ship['path']) - 1; 
                $ship['speed'] = 0;
                $ship['docked_cycles'] = mt_rand(4, 6); 
                
                $ship['lat'] = $target_node['lat'];
                $ship['lon'] = $target_node['lon'];
                
                goto eksekusi_database; 
            } else {
                $target_node = $nodes[$ship['path'][$ship['target_idx']]];
                $dist_to_target = getDistance($ship['lat'], $ship['lon'], $target_node['lat'], $target_node['lon']);
            }
        }

        $ship['course'] = getBearing($ship['lat'], $ship['lon'], $target_node['lat'], $target_node['lon']);
        $time_warp = 300; 
        $move_dist_km = ($ship['speed'] * 1.852) * ($time_warp / 3600);

        if ($move_dist_km > $dist_to_target) {
            $move_dist_km = $dist_to_target;
        }

        $ship['lat'] += ($move_dist_km / 111.32) * cos(deg2rad($ship['course']));
        $ship['lon'] += ($move_dist_km / (111.32 * cos(deg2rad($ship['lat'])))) * sin(deg2rad($ship['course']));

        // Label GOTO
        eksekusi_database:
        $jarak_temp = mt_rand(10, 50);

        $stmt_live->bind_param("iddddsd", $ship['mmsi'], $ship['lon'], $ship['lat'], $ship['speed'], $ship['course'], $waktu, $jarak_temp);
        $stmt_live->execute();

        $stmt_history->bind_param("idddds", $ship['mmsi'], $ship['lon'], $ship['lat'], $ship['speed'], $ship['course'], $waktu);
        $stmt_history->execute();
    }

    echo "[$waktu] Siklus #$cycle | Armada: $sailing_count Berlayar, $docked_count Berlabuh.<br>";
    flush();
    $cycle++;
    sleep(5);
}
?>