<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../sessions/session.php';


function getActiveCartId(PDO $pdo, int $userId): int {
    // try to find existing active cart
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id = :uid AND status = 'active' LIMIT 1");
    $stmt->execute(['uid' => $userId]);
    $cid = $stmt->fetchColumn();
    if ($cid) return (int)$cid;

    // create if not found
    $stmt = $pdo->prepare("INSERT INTO carts (user_id, status) VALUES (:uid, 'active')");
    $stmt->execute(['uid' => $userId]);
    return (int)$pdo->lastInsertId();
}

function getCartFromDB(PDO $pdo, int $userId): array {
    $cartId = getActiveCartId($pdo, $userId);

    $sql = "SELECT ci.id                          AS line_id,
                   ci.quantity                    AS qty,
                   ci.variant                     AS variant,
                   p.id                           AS product_id,
                   p.name,
                   p.price,
                   p.original_price,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) AS image
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = :cid";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['cid' => $cartId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // decode variant JSON for each item
    foreach ($items as &$it) {
        $it['variant'] = $it['variant'] ? json_decode($it['variant'], true) : null;
    }

    return calcTotals($items);
}

function calcTotals(array $items): array {
    $subtotal = 0;
    foreach ($items as $it) {
        $subtotal += $it['price'] * $it['qty'];
    }
    $discount = 0; // implement promo later
    $delivery = $subtotal > 0 ? 10 : 0;
    $total    = $subtotal - $discount + $delivery;
    return [
        'items'    => $items,
        'subtotal' => (float)$subtotal,
        'discount' => (float)$discount,
        'delivery' => (float)$delivery,
        'total'    => (float)$total,
    ];
}

function addOrUpdateItemDB(PDO $pdo, int $userId, array $payload): array {
    $cartId  = getActiveCartId($pdo, $userId);
    $pid     = (int)$payload['product_id'];
    $qty     = max(1, (int)$payload['qty']);
    $variantJson = json_encode(['color' => $payload['color'] ?? null, 'size' => $payload['size'] ?? null]);

    // Try find same product+variant line
    $find = $pdo->prepare("SELECT id, quantity FROM cart_items WHERE cart_id = :cid AND product_id = :pid AND variant = :variant LIMIT 1");
    $find->execute(['cid' => $cartId, 'pid' => $pid, 'variant' => $variantJson]);
    if ($row = $find->fetch(PDO::FETCH_ASSOC)) {
        $newQty = $row['quantity'] + $qty;
        $upd = $pdo->prepare("UPDATE cart_items SET quantity = :q WHERE id = :id");
        $upd->execute(['q' => $newQty, 'id' => $row['id']]);
    } else {
        $ins = $pdo->prepare("INSERT INTO cart_items (cart_id, product_id, variant, quantity) VALUES (:cid, :pid, :variant, :qty)");
        $ins->execute(['cid' => $cartId, 'pid' => $pid, 'variant' => $variantJson, 'qty' => $qty]);
    }

    return getCartFromDB($pdo, $userId);
}

function setLineQuantityDB(PDO $pdo, int $userId, int $lineId, int $qty): array {
    $cartId  = getActiveCartId($pdo, $userId);
    if ($qty <= 0) {
        $del = $pdo->prepare("DELETE FROM cart_items WHERE id = :id AND cart_id = :cid");
        $del->execute(['id' => $lineId, 'cid' => $cartId]);
    } else {
        $upd = $pdo->prepare("UPDATE cart_items SET quantity = :q WHERE id = :id AND cart_id = :cid");
        $upd->execute(['q' => $qty, 'id' => $lineId, 'cid' => $cartId]);
    }
    return getCartFromDB($pdo, $userId);
}

function getSessionCart(): array {
    return calcTotals($_SESSION['cart']['items'] ?? []);
}

function addOrUpdateSession(array $payload): array {
    if (!isset($_SESSION['cart']['items'])) $_SESSION['cart']['items'] = [];
    $items =& $_SESSION['cart']['items'];

    // Look for same product & variant
    foreach ($items as &$it) {
        if ($it['product_id'] == $payload['product_id'] &&
            ($it['variant']['color'] ?? null) == ($payload['color'] ?? null) &&
            ($it['variant']['size']  ?? null) == ($payload['size']  ?? null)) {
            $it['qty'] += max(1, (int)$payload['qty']);
            return getSessionCart();
        }
    }

    // Need product name & price info for quick rendering. fetch from DB.
    $pdo = getPDOConnection();
    $stmt = $pdo->prepare("SELECT name, price, original_price FROM products WHERE id = :pid");
    $stmt->execute(['pid' => $payload['product_id']]);
    $p = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$p) throw new Exception('Product not found');

    // image
    $img = $pdo->prepare("SELECT image_url FROM product_images WHERE product_id = :pid AND is_main = 1 LIMIT 1");
    $img->execute(['pid' => $payload['product_id']]);
    $imgUrl = $img->fetchColumn();

    $items[] = [
        'line_id'    => uniqid(),
        'product_id' => (int)$payload['product_id'],
        'name'       => $p['name'],
        'price'      => (float)$p['price'],
        'original_price' => (float)$p['original_price'],
        'qty'        => max(1, (int)$payload['qty']),
        'variant'    => ['color' => $payload['color'] ?? null, 'size' => $payload['size'] ?? null],
        'image'      => $imgUrl
    ];
    return getSessionCart();
}

function setLineQuantitySession(string $lineId, int $qty): array {
    if (!isset($_SESSION['cart']['items'])) return getSessionCart();
    $items =& $_SESSION['cart']['items'];
    foreach ($items as $idx => &$it) {
        if ($it['line_id'] === $lineId) {
            if ($qty <= 0) {
                array_splice($items, $idx, 1);
            } else {
                $it['qty'] = $qty;
            }
            break;
        }
    }
    return getSessionCart();
}
?> 