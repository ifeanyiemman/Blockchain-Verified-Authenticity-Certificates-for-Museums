(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-ARTIFACT-HASH u101)
(define-constant ERR-INVALID-METADATA u102)
(define-constant ERR-INVALID-ISSUANCE-FEE u103)
(define-constant ERR-INVALID-TIMESTAMP u104)
(define-constant ERR-INVALID-OWNER u105)
(define-constant ERR-CERTIFICATE-ALREADY-EXISTS u106)
(define-constant ERR-CERTIFICATE-NOT-FOUND u107)
(define-constant ERR-INVALID-REGISTRY-CONTRACT u108)
(define-constant ERR-INVALID-PROVENANCE-CONTRACT u109)
(define-constant ERR-INVALID-ISSUER u110)
(define-constant ERR-INVALID-EXPIRY u111)
(define-constant ERR-INVALID-DESCRIPTION u112)
(define-constant ERR-INVALID-ORIGIN u113)
(define-constant ERR-INVALID-CONDITION u114)
(define-constant ERR-INVALID-MATERIAL u115)
(define-constant ERR-INVALID-DIMENSIONS u116)
(define-constant ERR-INVALID-WEIGHT u117)
(define-constant ERR-INVALID-ARTIST u118)
(define-constant ERR-INVALID-PERIOD u119)
(define-constant ERR-INVALID-STATUS u120)
(define-constant ERR-MAX-CERTIFICATES-EXCEEDED u121)
(define-constant ERR-INVALID-UPDATE-PARAM u122)
(define-constant ERR-UPDATE-NOT-ALLOWED u123)
(define-constant ERR-INVALID-AUTHORITY u124)
(define-constant ERR-INVALID-CATEGORY u125)
(define-constant ERR-INVALID-VALUATION u126)
(define-constant ERR-INVALID-INSURANCE u127)
(define-constant ERR-INVALID-LOAN-STATUS u128)
(define-constant ERR-INVALID-RESTORATION-HISTORY u129)
(define-constant ERR-INVALID-ACQUISITION u130)

(define-data-var next-certificate-id uint u0)
(define-data-var max-certificates uint u10000)
(define-data-var issuance-fee uint u500)
(define-data-var registry-contract (optional principal) none)
(define-data-var provenance-contract (optional principal) none)
(define-data-var authority-principal principal tx-sender)

(define-map certificates
  uint
  {
    artifact-hash: (buff 32),
    title: (string-utf8 100),
    description: (string-utf8 500),
    origin: (string-utf8 100),
    issuance-timestamp: uint,
    issuer: principal,
    current-owner: principal,
    expiry: (optional uint),
    condition: (string-utf8 50),
    material: (string-utf8 100),
    dimensions: (string-utf8 50),
    weight: uint,
    artist: (string-utf8 100),
    period: (string-utf8 50),
    status: bool,
    category: (string-utf8 50),
    valuation: uint,
    insurance: bool,
    loan-status: bool,
    restoration-history: (list 10 (string-utf8 200)),
    acquisition-date: uint
  }
)

(define-map certificates-by-hash
  (buff 32)
  uint)

(define-map certificate-updates
  uint
  {
    update-description: (string-utf8 500),
    update-condition: (string-utf8 50),
    update-valuation: uint,
    update-timestamp: uint,
    updater: principal
  }
)

(define-read-only (get-certificate (id uint))
  (map-get? certificates id)
)

(define-read-only (get-certificate-updates (id uint))
  (map-get? certificate-updates id)
)

(define-read-only (is-certificate-issued (hash (buff 32)))
  (is-some (map-get? certificates-by-hash hash))
)

(define-private (validate-artifact-hash (hash (buff 32)))
  (if (is-eq (len hash) u32)
      (ok true)
      (err ERR-INVALID-ARTIFACT-HASH))
)

(define-private (validate-title (title (string-utf8 100)))
  (if (and (> (len title) u0) (<= (len title) u100))
      (ok true)
      (err ERR-INVALID-METADATA))
)

(define-private (validate-description (desc (string-utf8 500)))
  (if (<= (len desc) u500)
      (ok true)
      (err ERR-INVALID-DESCRIPTION))
)

(define-private (validate-origin (origin (string-utf8 100)))
  (if (<= (len origin) u100)
      (ok true)
      (err ERR-INVALID-ORIGIN))
)

(define-private (validate-timestamp (ts uint))
  (if (>= ts block-height)
      (ok true)
      (err ERR-INVALID-TIMESTAMP))
)

(define-private (validate-issuer (issuer principal))
  (if (not (is-eq issuer tx-sender))
      (ok true)
      (err ERR-INVALID-ISSUER))
)

(define-private (validate-expiry (expiry (optional uint)))
  (match expiry e (if (> e block-height) (ok true) (err ERR-INVALID-EXPIRY)) (ok true))
)

(define-private (validate-condition (cond (string-utf8 50)))
  (if (<= (len cond) u50)
      (ok true)
      (err ERR-INVALID-CONDITION))
)

(define-private (validate-material (mat (string-utf8 100)))
  (if (<= (len mat) u100)
      (ok true)
      (err ERR-INVALID-MATERIAL))
)

(define-private (validate-dimensions (dim (string-utf8 50)))
  (if (<= (len dim) u50)
      (ok true)
      (err ERR-INVALID-DIMENSIONS))
)

(define-private (validate-weight (w uint))
  (if (> w u0)
      (ok true)
      (err ERR-INVALID-WEIGHT))
)

(define-private (validate-artist (art (string-utf8 100)))
  (if (<= (len art) u100)
      (ok true)
      (err ERR-INVALID-ARTIST))
)

(define-private (validate-period (per (string-utf8 50)))
  (if (<= (len per) u50)
      (ok true)
      (err ERR-INVALID-PERIOD))
)

(define-private (validate-category (cat (string-utf8 50)))
  (if (or (is-eq cat "painting") (is-eq cat "sculpture") (is-eq cat "artifact"))
      (ok true)
      (err ERR-INVALID-CATEGORY))
)

(define-private (validate-valuation (val uint))
  (if (> val u0)
      (ok true)
      (err ERR-INVALID-VALUATION))
)

(define-private (validate-restoration-history (hist (list 10 (string-utf8 200))))
  (if (<= (len hist) u10)
      (ok true)
      (err ERR-INVALID-RESTORATION-HISTORY))
)

(define-private (validate-acquisition-date (date uint))
  (if (<= date block-height)
      (ok true)
      (err ERR-INVALID-ACQUISITION))
)

(define-public (set-registry-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get authority-principal)) (err ERR-NOT-AUTHORIZED))
    (var-set registry-contract (some contract))
    (ok true)
  )
)

(define-public (set-provenance-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get authority-principal)) (err ERR-NOT-AUTHORIZED))
    (var-set provenance-contract (some contract))
    (ok true)
  )
)

(define-public (set-issuance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender (var-get authority-principal)) (err ERR-NOT-AUTHORIZED))
    (var-set issuance-fee new-fee)
    (ok true)
  )
)

(define-public (set-max-certificates (new-max uint))
  (begin
    (asserts! (is-eq tx-sender (var-get authority-principal)) (err ERR-NOT-AUTHORIZED))
    (var-set max-certificates new-max)
    (ok true)
  )
)

(define-public (issue-certificate
  (artifact-hash (buff 32))
  (title (string-utf8 100))
  (description (string-utf8 500))
  (origin (string-utf8 100))
  (condition (string-utf8 50))
  (material (string-utf8 100))
  (dimensions (string-utf8 50))
  (weight uint)
  (artist (string-utf8 100))
  (period (string-utf8 50))
  (category (string-utf8 50))
  (valuation uint)
  (insurance bool)
  (loan-status bool)
  (restoration-history (list 10 (string-utf8 200)))
  (acquisition-date uint)
  (expiry (optional uint))
)
  (let (
    (next-id (var-get next-certificate-id))
    (current-max (var-get max-certificates))
    (registry (var-get registry-contract))
    (provenance (var-get provenance-contract))
  )
    (asserts! (< next-id current-max) (err ERR-MAX-CERTIFICATES-EXCEEDED))
    (try! (validate-artifact-hash artifact-hash))
    (try! (validate-title title))
    (try! (validate-description description))
    (try! (validate-origin origin))
    (try! (validate-condition condition))
    (try! (validate-material material))
    (try! (validate-dimensions dimensions))
    (try! (validate-weight weight))
    (try! (validate-artist artist))
    (try! (validate-period period))
    (try! (validate-category category))
    (try! (validate-valuation valuation))
    (try! (validate-restoration-history restoration-history))
    (try! (validate-acquisition-date acquisition-date))
    (try! (validate-expiry expiry))
    (asserts! (is-none (map-get? certificates-by-hash artifact-hash)) (err ERR-CERTIFICATE-ALREADY-EXISTS))
    (asserts! (is-some registry) (err ERR-INVALID-REGISTRY-CONTRACT))
    (asserts! (is-some provenance) (err ERR-INVALID-PROVENANCE-CONTRACT))
    (try! (stx-transfer? (var-get issuance-fee) tx-sender (unwrap! registry (err ERR-INVALID-REGISTRY-CONTRACT))))
    (map-set certificates next-id
      {
        artifact-hash: artifact-hash,
        title: title,
        description: description,
        origin: origin,
        issuance-timestamp: block-height,
        issuer: tx-sender,
        current-owner: tx-sender,
        expiry: expiry,
        condition: condition,
        material: material,
        dimensions: dimensions,
        weight: weight,
        artist: artist,
        period: period,
        status: true,
        category: category,
        valuation: valuation,
        insurance: insurance,
        loan-status: loan-status,
        restoration-history: restoration-history,
        acquisition-date: acquisition-date
      }
    )
    (map-set certificates-by-hash artifact-hash next-id)
    (var-set next-certificate-id (+ next-id u1))
    (print { event: "certificate-issued", id: next-id, hash: artifact-hash })
    (ok next-id)
  )
)

(define-public (update-certificate
  (cert-id uint)
  (new-description (string-utf8 500))
  (new-condition (string-utf8 50))
  (new-valuation uint)
)
  (let ((cert (map-get? certificates cert-id)))
    (match cert
      c
      (begin
        (asserts! (is-eq (get issuer c) tx-sender) (err ERR-NOT-AUTHORIZED))
        (try! (validate-description new-description))
        (try! (validate-condition new-condition))
        (try! (validate-valuation new-valuation))
        (map-set certificates cert-id
          (merge c {
            description: new-description,
            condition: new-condition,
            valuation: new-valuation,
            issuance-timestamp: block-height
          })
        )
        (map-set certificate-updates cert-id
          {
            update-description: new-description,
            update-condition: new-condition,
            update-valuation: new-valuation,
            update-timestamp: block-height,
            updater: tx-sender
          }
        )
        (print { event: "certificate-updated", id: cert-id })
        (ok true)
      )
      (err ERR-CERTIFICATE-NOT-FOUND)
    )
  )
)

(define-public (verify-certificate (id uint))
  (match (map-get? certificates id)
    cert (ok { valid: true, details: cert })
    (ok { valid: false, details: none })
  )
)

(define-public (get-certificate-count)
  (ok (var-get next-certificate-id))
)