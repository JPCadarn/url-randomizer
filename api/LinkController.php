<?php
require_once 'Database.php';

class LinkController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    private function fetchTitle($url) {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 3,
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n"
            ]
        ]);

        $html = @file_get_contents($url, false, $context);

        if ($html === false) {
            return null;
        }

        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
            $title = $matches[1];

            if (preg_match('/charset=["\']?([^"\'>]+)/i', $html, $charsetMatch)) {
                $charset = $charsetMatch[1];
                if (strtolower($charset) !== 'utf-8') {
                    $title = mb_convert_encoding($title, 'UTF-8', $charset);
                }
            }

            return html_entity_decode(trim($title), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return null;
    }

    public function getAll() {
        try {
            $query = "SELECT id, url, title, is_opened FROM links ORDER BY id ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll();

            foreach ($result as &$row) {
                $row['is_opened'] = (bool)$row['is_opened'];
            }

            $this->response($result);
        } catch (Exception $e) {
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->urls) || !is_array($data->urls)) {
            $this->response(['error' => 'Invalid data'], 400);
            return;
        }

        try {
            $this->conn->beginTransaction();

            $checkStmt = $this->conn->prepare("SELECT id FROM links WHERE url = ? LIMIT 1");
            $insertStmt = $this->conn->prepare("INSERT INTO links (url, title) VALUES (?, ?)");

            foreach ($data->urls as $url) {
                $checkStmt->execute([$url]);
                if ($checkStmt->fetch()) {
                    continue;
                }

                $title = $this->fetchTitle($url);
                $insertStmt->execute([$url, $title]);
            }

            $this->conn->commit();
            $this->response(['success' => true]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    public function delete() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            $this->response(['error' => 'ID required'], 400);
            return;
        }

        try {
            $query = "DELETE FROM links WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data->id]);
            $this->response(['success' => true]);
        } catch (Exception $e) {
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    public function clearAll() {
        try {
            $query = "TRUNCATE TABLE links";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $this->response(['success' => true]);
        } catch (Exception $e) {
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    public function clearWatched() {
        try {
            $query = "DELETE FROM links WHERE is_opened = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $this->response(['success' => true]);
        } catch (Exception $e) {
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            $this->response(['error' => 'ID required'], 400);
            return;
        }

        $status = isset($data->status) ? $data->status : 1;

        try {
            $query = "UPDATE links SET is_opened = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$status, $data->id]);
            $this->response(['success' => true]);
        } catch (Exception $e) {
            $this->response(['error' => $e->getMessage()], 500);
        }
    }

    private function response($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
?>