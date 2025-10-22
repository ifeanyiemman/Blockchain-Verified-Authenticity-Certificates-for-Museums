import { describe, it, expect, beforeEach } from "vitest";
import { stringUtf8CV, uintCV, buffCV, optionalCV, listCV, boolCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_ARTIFACT_HASH = 101;
const ERR_INVALID_METADATA = 102;
const ERR_INVALID_DESCRIPTION = 112;
const ERR_INVALID_ORIGIN = 113;
const ERR_INVALID_CONDITION = 114;
const ERR_INVALID_MATERIAL = 115;
const ERR_INVALID_DIMENSIONS = 116;
const ERR_INVALID_WEIGHT = 117;
const ERR_INVALID_ARTIST = 118;
const ERR_INVALID_PERIOD = 119;
const ERR_INVALID_CATEGORY = 125;
const ERR_INVALID_VALUATION = 126;
const ERR_INVALID_RESTORATION_HISTORY = 129;
const ERR_INVALID_ACQUISITION = 130;
const ERR_INVALID_EXPIRY = 111;
const ERR_CERTIFICATE_ALREADY_EXISTS = 106;
const ERR_CERTIFICATE_NOT_FOUND = 107;
const ERR_INVALID_REGISTRY_CONTRACT = 108;
const ERR_INVALID_PROVENANCE_CONTRACT = 109;
const ERR_MAX_CERTIFICATES_EXCEEDED = 121;

interface Certificate {
  artifactHash: Uint8Array;
  title: string;
  description: string;
  origin: string;
  issuanceTimestamp: number;
  issuer: string;
  currentOwner: string;
  expiry: number | null;
  condition: string;
  material: string;
  dimensions: string;
  weight: number;
  artist: string;
  period: string;
  status: boolean;
  category: string;
  valuation: number;
  insurance: boolean;
  loanStatus: boolean;
  restorationHistory: string[];
  acquisitionDate: number;
}

interface CertificateUpdate {
  updateDescription: string;
  updateCondition: string;
  updateValuation: number;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class CertificateIssuanceMock {
  state: {
    nextCertificateId: number;
    maxCertificates: number;
    issuanceFee: number;
    registryContract: string | null;
    provenanceContract: string | null;
    authorityPrincipal: string;
    certificates: Map<number, Certificate>;
    certificatesByHash: Map<string, number>;
    certificateUpdates: Map<number, CertificateUpdate>;
  } = {
    nextCertificateId: 0,
    maxCertificates: 10000,
    issuanceFee: 500,
    registryContract: null,
    provenanceContract: null,
    authorityPrincipal: "ST1TEST",
    certificates: new Map(),
    certificatesByHash: new Map(),
    certificateUpdates: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  stxTransfers: Array<{ amount: number; from: string; to: string | null }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextCertificateId: 0,
      maxCertificates: 10000,
      issuanceFee: 500,
      registryContract: null,
      provenanceContract: null,
      authorityPrincipal: "ST1TEST",
      certificates: new Map(),
      certificatesByHash: new Map(),
      certificateUpdates: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.stxTransfers = [];
  }

  setRegistryContract(contract: string): Result<boolean> {
    if (this.caller !== this.state.authorityPrincipal) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.registryContract = contract;
    return { ok: true, value: true };
  }

  setProvenanceContract(contract: string): Result<boolean> {
    if (this.caller !== this.state.authorityPrincipal) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.provenanceContract = contract;
    return { ok: true, value: true };
  }

  setIssuanceFee(newFee: number): Result<boolean> {
    if (this.caller !== this.state.authorityPrincipal) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.issuanceFee = newFee;
    return { ok: true, value: true };
  }

  setMaxCertificates(newMax: number): Result<boolean> {
    if (this.caller !== this.state.authorityPrincipal) return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.maxCertificates = newMax;
    return { ok: true, value: true };
  }

  issueCertificate(
    artifactHash: Uint8Array,
    title: string,
    description: string,
    origin: string,
    condition: string,
    material: string,
    dimensions: string,
    weight: number,
    artist: string,
    period: string,
    category: string,
    valuation: number,
    insurance: boolean,
    loanStatus: boolean,
    restorationHistory: string[],
    acquisitionDate: number,
    expiry: number | null
  ): Result<number> {
    if (this.state.nextCertificateId >= this.state.maxCertificates) return { ok: false, value: ERR_MAX_CERTIFICATES_EXCEEDED };
    if (artifactHash.length !== 32) return { ok: false, value: ERR_INVALID_ARTIFACT_HASH };
    if (!title || title.length > 100) return { ok: false, value: ERR_INVALID_METADATA };
    if (description.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (origin.length > 100) return { ok: false, value: ERR_INVALID_ORIGIN };
    if (condition.length > 50) return { ok: false, value: ERR_INVALID_CONDITION };
    if (material.length > 100) return { ok: false, value: ERR_INVALID_MATERIAL };
    if (dimensions.length > 50) return { ok: false, value: ERR_INVALID_DIMENSIONS };
    if (weight <= 0) return { ok: false, value: ERR_INVALID_WEIGHT };
    if (artist.length > 100) return { ok: false, value: ERR_INVALID_ARTIST };
    if (period.length > 50) return { ok: false, value: ERR_INVALID_PERIOD };
    if (!["painting", "sculpture", "artifact"].includes(category)) return { ok: false, value: ERR_INVALID_CATEGORY };
    if (valuation <= 0) return { ok: false, value: ERR_INVALID_VALUATION };
    if (restorationHistory.length > 10) return { ok: false, value: ERR_INVALID_RESTORATION_HISTORY };
    if (acquisitionDate > this.blockHeight) return { ok: false, value: ERR_INVALID_ACQUISITION };
    if (expiry !== null && expiry <= this.blockHeight) return { ok: false, value: ERR_INVALID_EXPIRY };
    const hashKey = artifactHash.toString();
    if (this.state.certificatesByHash.has(hashKey)) return { ok: false, value: ERR_CERTIFICATE_ALREADY_EXISTS };
    if (!this.state.registryContract) return { ok: false, value: ERR_INVALID_REGISTRY_CONTRACT };
    if (!this.state.provenanceContract) return { ok: false, value: ERR_INVALID_PROVENANCE_CONTRACT };
    this.stxTransfers.push({ amount: this.state.issuanceFee, from: this.caller, to: this.state.registryContract });
    const id = this.state.nextCertificateId;
    const cert: Certificate = {
      artifactHash,
      title,
      description,
      origin,
      issuanceTimestamp: this.blockHeight,
      issuer: this.caller,
      currentOwner: this.caller,
      expiry,
      condition,
      material,
      dimensions,
      weight,
      artist,
      period,
      status: true,
      category,
      valuation,
      insurance,
      loanStatus,
      restorationHistory,
      acquisitionDate,
    };
    this.state.certificates.set(id, cert);
    this.state.certificatesByHash.set(hashKey, id);
    this.state.nextCertificateId++;
    return { ok: true, value: id };
  }

  getCertificate(id: number): Certificate | null {
    return this.state.certificates.get(id) || null;
  }

  updateCertificate(id: number, newDescription: string, newCondition: string, newValuation: number): Result<boolean> {
    const cert = this.state.certificates.get(id);
    if (!cert) return { ok: false, value: ERR_CERTIFICATE_NOT_FOUND };
    if (cert.issuer !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newDescription.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (newCondition.length > 50) return { ok: false, value: ERR_INVALID_CONDITION };
    if (newValuation <= 0) return { ok: false, value: ERR_INVALID_VALUATION };
    const updated: Certificate = {
      ...cert,
      description: newDescription,
      condition: newCondition,
      valuation: newValuation,
      issuanceTimestamp: this.blockHeight,
    };
    this.state.certificates.set(id, updated);
    this.state.certificateUpdates.set(id, {
      updateDescription: newDescription,
      updateCondition: newCondition,
      updateValuation: newValuation,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  verifyCertificate(id: number): Result<{ valid: boolean; details: Certificate | null }> {
    const cert = this.state.certificates.get(id);
    return { ok: true, value: { valid: !!cert, details: cert || null } };
  }

  getCertificateCount(): Result<number> {
    return { ok: true, value: this.state.nextCertificateId };
  }
}

describe("CertificateIssuance", () => {
  let contract: CertificateIssuanceMock;

  beforeEach(() => {
    contract = new CertificateIssuanceMock();
    contract.reset();
  });

  it("rejects invalid artifact hash length", () => {
    contract.setRegistryContract("ST2REG");
    contract.setProvenanceContract("ST3PROV");
    const hash = new Uint8Array(31).fill(1);
    const result = contract.issueCertificate(
      hash,
      "Mona Lisa",
      "Famous painting",
      "Italy",
      "Excellent",
      "Oil on canvas",
      "77x53 cm",
      100,
      "Da Vinci",
      "Renaissance",
      "painting",
      1000000,
      true,
      false,
      ["Restored in 2020"],
      1000,
      null
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_ARTIFACT_HASH);
  });

  it("rejects invalid title", () => {
    contract.setRegistryContract("ST2REG");
    contract.setProvenanceContract("ST3PROV");
    const hash = new Uint8Array(32).fill(1);
    const longTitle = "a".repeat(101);
    const result = contract.issueCertificate(
      hash,
      longTitle,
      "Famous painting",
      "Italy",
      "Excellent",
      "Oil on canvas",
      "77x53 cm",
      100,
      "Da Vinci",
      "Renaissance",
      "painting",
      1000000,
      true,
      false,
      ["Restored in 2020"],
      1000,
      null
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_METADATA);
  });

  it("rejects update for non-existent certificate", () => {
    contract.setRegistryContract("ST2REG");
    contract.setProvenanceContract("ST3PROV");
    const result = contract.updateCertificate(99, "New desc", "Good", 2000000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_CERTIFICATE_NOT_FOUND);
  });

  it("rejects issuance fee change by non-authority", () => {
    contract.caller = "ST3FAKE";
    const result = contract.setIssuanceFee(1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("rejects certificate issuance with empty title", () => {
    contract.setRegistryContract("ST2REG");
    contract.setProvenanceContract("ST3PROV");
    const hash = new Uint8Array(32).fill(1);
    const result = contract.issueCertificate(
      hash,
      "",
      "Famous painting",
      "Italy",
      "Excellent",
      "Oil on canvas",
      "77x53 cm",
      100,
      "Da Vinci",
      "Renaissance",
      "painting",
      1000000,
      true,
      false,
      ["Restored in 2020"],
      1000,
      null
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_METADATA);
  });

  it("sets registry contract successfully", () => {
    const result = contract.setRegistryContract("ST2REG");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.registryContract).toBe("ST2REG");
  });
});